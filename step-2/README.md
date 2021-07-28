# BUSINESS MESSAGES: Live agent transfer

This is the second step in a codelab demonstrating how to manage live agent transfers in a Business Messages conversation. The second step extends the initial Echo Bot setup to display all conversations in a simple web-based CRM. When a user requests to speak to a live agent, the CRM user will be able to join the conversation as a live agent representative.

This sample relies on the [Business Messages Node.js client library](https://github.com/google-business-communications/nodejs-businessmessages) for sending messages to the Business Messages platform.

This sample runs on the Google App Engine.

See the Google App Engine (https://cloud.google.com/appengine/docs/nodejs/) standard environment documentation for more detailed instructions.

## Documentation

The documentation for the Business Messages API can be found [here](https://developers.google.com/business-communications/business-messages/reference/rest).

## Prerequisite

You must have the following software installed on your machine:

* [Google Cloud SDK](https://cloud.google.com/sdk/) (aka gcloud)
* [Node.js](https://nodejs.org/en/) - version 10 or above

## Before you begin

1.  [Register with Business Messages](https://developers.google.com/business-communications/business-messages/guides/set-up/register).
1.  Once registered, follow the instructions to [enable the APIs for your project](https://developers.google.com/business-communications/business-messages/guides/set-up/register#enable-api).
1.  Enable the [Cloud Datastore APIs](https://cloud.google.com/datastore/docs/activate) for your project.
1.  Open the [Create an agent](https://developers.google.com/business-communications/business-messages/guides/set-up/agent)
guide and follow the instructions to create a Business Messages agent.

## Deploy the sample

1.  In a terminal, navigate to this sample's root directory.

1.  Run the following commands:

    ```bash
    gcloud config set project PROJECT_ID
    ```

    Where PROJECT_ID is the project ID for the project you created when you registered for Business Messages.

    ```bash
    gcloud app deploy
    ```

1.  On your mobile device, use the test URL associated with the
    Business Messages agent you created. See the
    [Test an agent](https://developers.google.com/business-communications/business-messages/guides/set-up/agent#test-agent) guide if you need help retrieving your test business URL.

    Open a conversation with your agent
    and type in "Hello". Once delivered, you should receive "Hello" back
    from the agent.

    Navigate to https://PROJECT_ID.appspot.com to view the list of conversation
    threads and experiment with joining a conversation.

    See the [Test an agent](https://developers.google.com/business-communications/business-messages/guides/set-up/agent#test-agent) guide if you need help retrieving your test business URL.

## Datastore schema for saving conversation history

Thread:
    * brandId - (string) The unique identifier for the brand.
    * conversationId - (string) The unique identifier for the converastion between the user and business.
    * displayName - (string) The name of the last entity that sent a message, either the user or the business.
    * lastMessageText - (string) The last message sent or received.
    * lastUpdated - (datetime) The date and time the last message was sent or received.
    * state - (string) Represents the state of the thread, managed by a bot, in queue for live agent, or manged by a live agent.

Message:
    * conversationId - (string) The unique identifier for the converastion between the user and business.
    * messageId - (string) The unique identifier for the message that was sent or received.
    * displayName - (string) The name of the  entity that sent a message, either the user or the business.
    * messageText - (string) The message text sent or received.
    * userType - (string) Who sent the message, the CRM or the user.
    * createdDate - (datetime) The date and time the last message was sent or received.