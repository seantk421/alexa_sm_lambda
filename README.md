#Sapient Atlanta Hackathon Alexa

This is the AWS Lambda and Alexa portions of the Hackathon Project.

In this folder:
1. src --> All Lambda code
2. speechAssets --> All Alexa speech utterances and data objects


#Lambda Source Code
1. main.js -- Handles all intent processing and generates responses
2. translations.json -- Holds all text responses for Alexa
3. requestHelper.js -- Makes all post requests to the web app for browser refresh

#Setup
1. Install serverless with "npm install -g serverless"
2. Run "npm install" in the /src folder to install all node modules
3. To deploy the Lambda code, you should run "serverless deploy" in the src folder.
