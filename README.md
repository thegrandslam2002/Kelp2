# Kelp2
## About this project:

This bot was created for the Laurier Pride Society Discord server, and for purposes of transparency and community contribution its code is made open source.

## Contributing to the project:

If you'd like to add a command to Kelp, it's very easy to do! All you need is to include a 'data' property with the appropriate command builder and an 'execute' property with the code to execute upon recieving the command. NOTE: commands requiring intents not already included in the index.js file must add their intents there in order for the command to function correctly. Information about which intents are required for which actions can be found here: https://discord.com/developers/docs/topics/gateway#list-of-intents.

More information to come about adding functions on event listeners.

## Making your own bot using Kelp's code:

Kelp runs on Node.js, so installing Kelp should be as simple as downloading Node.js on your machine and cloning the repo. In order for the bot to run, you'll need to input your token and client ID into the application_data.json file. Slash commands must be registered first by running manual_register.js, with the additional requirement of your server ID from the config.json file. Commands can then be re-registered remotely using the /reload command. More information about bot development is available here: https://discord.js.org/#/.

Kelp was designed to run on only one server at a time. If you attempt to use it on multiple, it WILL NOT function correctly.

## Credits:
Ben Howe
