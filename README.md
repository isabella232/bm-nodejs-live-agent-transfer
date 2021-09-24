# BUSINESS MESSAGES: Live agent transfer starter code

This sample demonstrates how to use the [Business Messages Node.js client library](https://github.com/google-business-communications/nodejs-businessmessages) for performing operations
with the [Business Messages API](https://developers.google.com/business-communications/business-messages/reference/rest).

This sample contains multiple example codebases. Each subfolder
is a complete example bot and can be deployed to Google App Engine
to support a Business Messages conversational experience.

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

## Codelab tutorial
See our [codelab](https://developers.google.com/business-communications/business-messages/codelabs/live-agent-transfer) tutorial for detailed instructions on how to build this sample and deploy it to Google Cloud App
Engine. Once deployed you can interact with the conversational surface through
Business Messages.

## Samples

Each sample has a `README.md` with instructions for running the sample.

| Sample                      | Description                       |
| --------------------------- | --------------------------------- |
| [step-1](https://github.com/google-business-communications/bm-nodejs-live-agent-transfer/tree/master/step-1) | Base code for an Echo Bot that saves all sent and received messages to a Google Cloud Datastore. |
| [step-2](https://github.com/google-business-communications/bm-nodejs-live-agent-transfer/tree/master/step-2) | Extension of step-1 that adds a web-based UI to view conversations. |
| [step-3](https://github.com/google-business-communications/bm-nodejs-live-agent-transfer/tree/master/step-3) | Extension of step-2 that adds a web-based UI for responding to user messages. |
| [step-4](https://github.com/google-business-communications/bm-nodejs-live-agent-transfer/tree/master/step-4) | Extension of step-3 that adds live agent handover back to a bot. |

## Learn more

To learn more about setting up Business Messages and supporting
chat from Search and Maps, see the [documentation](https://developers.google.com/business-communications/business-messages/guides).