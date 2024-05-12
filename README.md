# Kelp 2
## About this project:

This bot was created for the Laurier Pride Society Discord server, and for purposes of transparency and community contribution its code is made open source.

## Contributing to the project:

If you'd like to add a command to Kelp, it's very easy to do! All you need is to create a module in the proper folder including a 'data' property with the appropriate command builder and an 'execute' property with the code to execute upon recieving the command. NOTE: commands requiring intents not already included in the index.js file must add their intents there in order for the command to function correctly. Information about which intents are required for which actions can be found [here](https://discord.com/developers/docs/topics/gateway#list-of-intents).

Message Components (eg. buttons and select menus) work almost exactly the same as commands, with the differences that they do not need a data property (execute is still required) and they go in a different folder.

Functions that execute when an event is recieved need to be written in `index.js` using their respective [event listener](https://discord.js.org/#/docs/discord.js/main/typedef/Events). Wrapping these functions in a `try { } catch { }` loop is highly reccomended, as is creating a seperate module for large functions.

New config options only need to be added to `data/templates/config_template.json`. The main file will take care of the rest.

All code submissions are expected to conform to the following guidelines:
- Modules must be self-contained, meaning a change to one should not require changes to the rest of the project
- Commands with long functions (eg. sending an image, reading or writing a file, etc.) must use `interaction.deferReply()`
- Message component custom ids should start with their type, eg. `menu_` for select menus or `button_` for buttons
- Avoid sending "spam" messages. Command responces can be made invisible to everyone but the sender using the `ephemeral` flag
- Variables intended to persist accross restarts should be saved in JSON (preferred) or another relevant format. This is what `config.json` and the `data` folder are intended to contain. Do not assume variables in `config.json` have already been set
  - DO NOT store variables in `application_data.json` (or its template). This file is only intended to contain variables required for the bot to function - currently only the token and client ID
- Use async/await notation where relevant

## Making your own bot using Kelp's code:

Kelp runs on Node.js, so installing Kelp should be as simple as downloading Node.js on your machine, running `npm install discord.js`, and cloning the repo. In order for the bot to run, you'll need to input your token and client ID into the application_data.json file, then run `index.js`. Slash commands must be registered first by running `manual_register.js`, with the additional requirement of your server ID from the config.json file. Commands can then be re-registered remotely using the /reload command. More information about bot development is available [here](https://discord.js.org/#/).

Kelp was designed to run on only one server at a time. If you attempt to use it on multiple, it WILL NOT function correctly.

## Credits:
Ben Howe
