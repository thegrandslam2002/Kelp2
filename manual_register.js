const {REST, Routes} = require('discord.js')
const fs = require('fs')
const path = require('path')

exitFlag = false

// Checks to see if application_data.json exists. If it does not, creates application_data.json and flags the program to exit
if (!fs.existsSync(path.join(__dirname, 'application_data.json'))) {
    console.log("Application data not found! Creating application_data.json now")

    // Creates application_data.json using the empty template from data/application_data_template.json
    fs.copyFileSync(path.join(__dirname, 'data', 'templates', 'application_data_template.json'), 'application_data.json')

    console.log("application_data.json created")
    exitFlag = true
}

// Checks to see if config.json exists. If it does not, creates config.json and flags the program to exit
if (!fs.existsSync(path.join(__dirname, 'config.json'))) {
    console.log("Config data not found! Creating config.json now")

    // Creates config.json using the empty template from data/config_template.json
    fs.copyFileSync(path.join(__dirname, 'data', 'templates', 'config_template.json'), 'config.json')

    console.log("config.json created")
    exitFlag = true
}

// Stops the process if a required config does not exist
if (exitFlag === true) process.exit(0)

const {token, clientID} = require(path.join(__dirname, 'application_data.json'))
const {guildID} = require(path.join(__dirname, 'config.json'))

// Checks if the token client ID, and guild ID are set. Flags the program to exit if not
if (token === "") {
    console.error("Token not set!")
    exitFlag = true
}
if (clientID === "") {
    console.error("Client ID not set!")
    exitFlag = true
}
if (guildID === "") {
    console.error("Guild (server) ID not set!")
    exitFlag = true
}

// Stops the process if any of the required variables have not been set
if (exitFlag === true) process.exit(1)

// Gets the contents of slash_commands and context_menu_commands and adds their data in JSON format to an array
const commands = []
for (const folder of ['slash_commands', 'context_menu_commands']) {
    // Gets the contents of a folder
    const commandsPath = path.join(__dirname, folder)
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'))

    // Resisters each command in the folder if it has 'data' and 'execute' properties
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file)
        const command = require(filePath)
        if ('data' in command && 'execute' in command) {
            commands.push(command.data.toJSON())
        } else {
            console.error(`The command at ${filePath} lacks a data or exectue property and will not be registered`)
        }
    }
}

// Creates an instance of the REST module using the bot's token
const rest = new REST().setToken(token);

// Registers commands to the bot
(async () => {
    try {
        // Registers commands from the array to the bot via REST
        console.log(`Registering ${commands.length} commands to server`)
        const data = await rest.put(
            Routes.applicationGuildCommands(clientID, guildID),
            {body: commands},
        )
        console.log(`Successfully registered ${data.length} commands to server`)
    } catch (error) {
        // Logs any error which occurs
        console.error(error)
    }
})()