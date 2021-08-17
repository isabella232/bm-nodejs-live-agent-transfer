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

// Service account credentials for Datastore
const appEnginePrivateKey = require('../resources/credentials.json');

// Imports the Google Cloud client library
const {Datastore} = require('@google-cloud/datastore');

// Creates a datastore client
const datastore = new Datastore({
    projectId: appEnginePrivateKey.project_id,
    keyFilename: './resources/credentials.json',
});

// Datastore utility class for managing threads and messages for chat bot.
let datastoreUtil = {
  /**
     * Lists all message threads managed by the CRM.
     *
     * @param {function} callback Callback method for after the method is complete.
     */
  listMessageThreads: function(callback) {
    const query = datastore
      .createQuery('Thread');

    datastore.runQuery(query).then((results) => {
      let matchingItems = results[0];

      if (callback != undefined) {
        if (matchingItems.length > 0) {
          // Sort in descending order based on last update date
          matchingItems.sort(function(a, b) {
            return b.lastUpdated - a.lastUpdated;
          });

          callback(matchingItems);
        } else {
          callback(false);
        }
      }
    });
  },

  /**
   * Gets a specific thread object based on the conversation ID.
   *
   * @param {string} conversationId The conversation ID created when the user first messages the business.
   * @param {function} callback Callback method for after the method is complete.
   */
  getMessageThread: function(conversationId, callback) {
    const query = datastore
      .createQuery('Thread')
      .filter('conversationId', '=', conversationId);

    datastore.runQuery(query).then((results) => {
      let matchingItems = results[0];

      if (callback != undefined) {
        if (matchingItems.length > 0) {
            callback(matchingItems[0]);
        } else {
            callback(false);
        }
      }
    });
  },

  /**
   * Lists all messages for a thread based on the conversation ID.
   *
   * @param {string} conversationId The conversation ID created when the user first messages the business.
   * @param {function} callback Callback method for after the method is complete.
   */
  listMessages: function(conversationId, callback) {
    const query = datastore
      .createQuery('Message')
      .filter('conversationId', '=', conversationId);

    datastore.runQuery(query).then((results) => {
      let matchingItems = results[0];

      if (callback != undefined) {
        if (matchingItems.length > 0) {
          // Sort in ascending order based on created date
          matchingItems.sort(function(a, b) {
            return a.createdDate - b.createdDate;
          });

          callback(matchingItems);
        } else {
          callback(false);
        }
      }
    });
  },

  /**
     * Saves a new message object to the datastore.
     *
     * @param {object} message The message object and parameters.
     * @property {string} params.messageId The unique identifier for the message.
     * @property {string} params.messageText The text value of the message.
     * @property {string} params.conversationId The conversation ID that owns this message.
     * @property {string} params.userType Whether the message was sent from a user or CRM.
     * @property {string} params.displayName The user's display name.
     * @property {datetime} params.createdDate The date the message was created.
     * @param {function} callback Callback method for after the method is complete.
     */
  saveMessage: function(message, callback) {
    const messageKey = datastore.key(['Message']);

    // Prepare the message
    const messageObject = {
      key: messageKey,
        data: {
          messageId: message.messageId,
          messageText: message.messageText,
          conversationId: message.conversationId,
          userType: message.userType,
          displayName: message.displayName,
          createdDate: message.createdDate,
        },
    };

    // Save the message to the datastore
    datastore
      .save(messageObject)
      .then(() => {
        console.log('message saved');
        if (callback != undefined) {
          callback();
        }
      })
      .catch((err) => {
        console.error('ERROR:', err);
      });
  },

  /**
     * Saves a new thread object to the datastore.
     *
     * @param {object} thread The thread object and parameters.
     * @property {string} params.lastMessageText The text of the last message sent
     * in the conversation.
     * @property {datetime} params.lastUpdated The date and time the last message was sent.
     * @property {string} params.conversationId The conversation ID for this thread.
     * @property {string} params.displayName The user's name.
     * @property {string} params.state The state of the thread, who is handling it.
     * @param {function} callback Callback method for after the method is complete.
     */
  saveThread: function(thread, callback) {
    // Check for an existing thread
    datastoreUtil.getMessageThread(thread.conversationId, (threadResponse) => {
      if (threadResponse) {
        threadResponse.lastMessageText = thread.lastMessageText;
        threadResponse.lastUpdated = thread.lastUpdated;
        threadResponse.displayName = thread.displayName;
        threadResponse.state = thread.state;
      } else {
        const threadKey = datastore.key(['Thread']);

        threadResponse = {
          key: threadKey,
            data: {
              lastMessageText: thread.lastMessageText,
              lastUpdated: thread.lastUpdated,
              conversationId: thread.conversationId,
              displayName: thread.displayName,
              brandId: thread.brandId,
              state: thread.state,
            },
          };
      }

      // Save the thread to the datastore
      datastore
        .save(threadResponse)
        .then(() => {
            if (callback != undefined) {
              callback();
            }
        })
        .catch((err) => {
            console.error('ERROR:', err);
        });
    });
  },
};

module.exports = datastoreUtil;
