# MentalBuddy

## Table of contents  
- [Prerequisites](#prerequisites)  
- [Third Party Accounts](#third-party-accounts)  
- [Gactions](#gactions)  
    
## [Prerequisites](#prerequisites)
Before setting up the prototype you need a computer with either Linux/Windows or MacOS and an internet connection. Furthermore, you should have a Google Account that is able to connect to the [Action Console](console.actions.google.com/).

## [Third Party Accounts](#third-party-accounts)
To setup the project you need to create a new Google Assistant project. All information can be found in the relevant [docs](https://developers.google.com/assistant/conversational/build). After having created the project, follow the steps described [here](https://developers.google.com/assistant/actionssdk/gactions/guide#import_an_existing_project_from_a_source_code_management_system) to publish the source code of this directory to the new Actions project.

Please also check that you have a [valid payment method](https://cloud.google.com/billing/docs/how-to/payment-methods) in place for your Firebase project to enable the usage of Cloud Functions needed for the backend services of MentalBuddy. Also carefully read through the [Docs](https://firebase.google.com/docs/projects/billing/firebase-pricing-plans?hl=en) about the billing process to not face unplanned expenses.

## [Gactions](#gactions)
While all of the voice application can be developed using the Actions Console, it might make sense to have all of the relevant files also locally. This ensures that you can developed without an internet connection and manage the source-code of the application using a version control system. To do so, you need to install the `gactions` CLI tool on your local machine. You can find all the relevant information about the installation process in the official [Google Docs](https://developers.google.com/assistant/actionssdk/gactions). 

In case you activated 2FA for your Google account, you might face an issue when authorizing the CLI tool to access your project. A workaround for this is installing gactions using `npm` with the following command:

    npm install -g gactions
