// Copyright 2021 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// HTTP router used for receiving messages from users and sending responses.
const express = require('express');
const router = express.Router();

const {google} = require('googleapis');
const businessmessages = require('businessmessages');
const {v4: uuidv4} = require('uuid');

// Set the private key to the service account file
const privatekey = require('../resources/credentials.json');

// Initialize the Business Messages API
const bmApi =
  new businessmessages.businessmessages_v1.Businessmessages({});

// Set the scope that we need for the Business Messages API
const scopes = [
  'https://www.googleapis.com/auth/businessmessages',
];

// Reference to the backend datastore util
const datastoreUtil = require('../libs/datastore_util');

// Name of the brand
const BUSINESS_NAME = 'Slice Pizza';

// The value for who manages the conversation on behalf of the business
const BOT_THREAD_STATE = 'Bot';

/**
 * The webhook callback method.
 */
router.post('/callback', async function(req, res, next) {
  let requestBody = req.body;

  // Extract the message payload parameters
  let conversationId = requestBody.conversationId;
  let messageId = requestBody.requestId;
  let agentName = requestBody.agent;
  let brandId = agentName.substr(agentName.indexOf('brands/') + 7,
    agentName.indexOf('/agents') - 7);
  let displayName = requestBody.context.userInfo.displayName;

  // Log message parameters
  console.log('conversationId: ' + conversationId);
  console.log('displayName: ' + displayName);
  console.log('brandId: ' + brandId);

  // Initialize object details that will be used to
  // create thread and message records
  let threadAndMessage = {
    messageId: messageId,
    userType: 'User',
    displayName: displayName,
    brandId: brandId,
    conversationId: conversationId,
    state: BOT_THREAD_STATE,
  };

  // Check that the message and text values exist
  if ((requestBody.message !== undefined
    && requestBody.message.text !== undefined)) {
    let message = requestBody.message.text;

    console.log('message: ' + message);

    threadAndMessage.message = message;

    await storeMessage(threadAndMessage);
    storeAndSendResponse(message, conversationId, BOT_THREAD_STATE, 'BOT');
  } else if (requestBody.suggestionResponse !== undefined) {
    let message = requestBody.suggestionResponse.text;

    console.log('message: ' + message);

    threadAndMessage.message = message;

    await storeMessage(threadAndMessage);
    storeAndSendResponse(message, conversationId, BOT_THREAD_STATE, 'BOT');
  } else if (requestBody.userStatus !== undefined) {
    if (requestBody.userStatus.requestedLiveAgent !== undefined) {
      console.log('User requested transfer to live agent');
    }
  }

  res.sendStatus(200);
});

/**
 * Updates the thread, adds a new message and sends a response to the user.
 *
 * @param {string} message The message content that was received.
 * @param {string} conversationId The unique id for this user and agent.
 * @param {string} threadState Represents who is managing the conversation for the CRM.
 * @param {string} representativeType The representative sending the message, BOT or HUMAN.
 */
async function storeAndSendResponse(message, conversationId, threadState, representativeType) {
  let messageId = uuidv4();

  // Store the message
  await storeMessage({
    messageId: messageId,
    message: message,
    userType: 'CRM',
    displayName: BUSINESS_NAME,
    conversationId: conversationId,
    state: threadState,
  });

  // Send message to the user
  sendResponse({
    messageId: messageId,
    representative: getRepresentative(representativeType),
    text: message,
    containsRichText: true,
    fallback: message,
    suggestions: [
      {
        liveAgentRequest: {},
      },
    ],
  }, conversationId);
}

/**
 * Updates the thread and saves a new message for the conversation as received
 * from a user talking to the business or from a business messaging the user.
 *
 * @param {object} threadAndMessage Object containining thread and message details.
 * @param {string} params.message The message content that was received.
 * @param {string} params.messageId The unique identifier for the message.
 * @param {string} params.userType User or CRM, depending on inbound or outbound message.
 * @param {string} params.displayName The name of the user.
 * @param {string} params.brandId The unique identifier for the business.
 * @param {string} params.conversationId The unique id for this user and agent.
 * @param {string} params.state Represents who is managing the conversation for the CRM.
 * @return A Promise.
 */
async function storeMessage(threadAndMessage) {
  return new Promise((resolve, reject) => {
    // Update the thread
    datastoreUtil.saveThread({
      lastMessageText: threadAndMessage.message,
      lastUpdated: new Date(),
      conversationId: threadAndMessage.conversationId,
      displayName: threadAndMessage.displayName,
      brandId: threadAndMessage.brandId,
      state: threadAndMessage.state,
    }, () => {
      // Store the message
      datastoreUtil.saveMessage({
        messageId: threadAndMessage.messageId,
        messageText: threadAndMessage.message,
        conversationId: threadAndMessage.conversationId,
        userType: threadAndMessage.userType,
        displayName: threadAndMessage.displayName,
        createdDate: new Date(),
      });

      resolve();
    });
  });
}

/**
 * Posts a message to the Business Messages API, first sending a typing
 * indicator event and sending a stop typing event after the message
 * has been sent.
 *
 * @param {object} messageObject The message object payload to send to the user.
 * @param {string} conversationId The unique id for this user and agent.
 */
async function sendResponse(messageObject, conversationId) {
  let authClient = await initCredentials();

  // Create the payload for sending a typing started event
  let apiEventParams = {
    auth: authClient,
    parent: 'conversations/' + conversationId,
    resource: {
      eventType: 'TYPING_STARTED',
      representative: messageObject.representative,
    },
    eventId: uuidv4(),
  };

  // Send the typing started event
  bmApi.conversations.events.create(apiEventParams,
    {auth: authClient}, (err, response) => {
    let apiParams = {
      auth: authClient,
      parent: 'conversations/' + conversationId,
      resource: messageObject,
    };

    // Call the message create function using the
    // Business Messages client library
    bmApi.conversations.messages.create(apiParams,
      {auth: authClient}, (err, response) => {
      console.log(response);

      // Update the event parameters
      apiEventParams.resource.eventType = 'TYPING_STOPPED';
      apiEventParams.eventId = uuidv4();

      // Send the typing stopped event
      bmApi.conversations.events.create(apiEventParams,
        {auth: authClient}, (err, response) => {
      });
    });
  });
}

/**
 * Returns a representative for the business.
 * @param {string} representativeType The representative sending the message,
 * BOT or HUMAN.
 * @return The representative type object.
 */
function getRepresentative(representativeType) {
  return {
    representativeType: representativeType,
    displayName: BUSINESS_NAME,
  };
}

/**
 * Initializes the Google credentials for calling the
 * Business Messages API.
 * @return A Promise with an authentication object.
 */
async function initCredentials() {
  // configure a JWT auth client
  let authClient = new google.auth.JWT(
    privatekey.client_email,
    null,
    privatekey.private_key,
    scopes,
  );

  return new Promise(function(resolve, reject) {
    // authenticate request
    authClient.authorize(function(err, tokens) {
      if (err) {
        reject(false);
      } else {
        resolve(authClient);
      }
    });
  });
}

module.exports = router;
