const {Client, Collection, Events, GatewayIntentBits} = require('discord.js')
const fs = require('fs')
const path = require('path')

// Checks to see if application_data.json exists. If it does not, creates application_data.json and exits
if (!fs.existsSync(path.join(__dirname, 'application_data.json'))) {
    console.log("Application data not found! Creating application_data.json now")

    // Creates application_data.json using the empty template from data//templates/application_data_template.json
    fs.copyFileSync(path.join(__dirname, 'data', 'templates', 'application_data_template.json'), 'application_data.json')

    console.log("application_data.json created! Please set your token and client ID")
    process.exit(0)
}

const {token} = require(path.join(__dirname, 'application_data.json'))

// Checks if the token is set. Exits with an error message if not
if (token === "") {
    console.error("Token not set!")
    process.exit(1)
}

// Checks to see if config.json exists. If it does not, creates config.json
if (!fs.existsSync(path.join(__dirname, 'config.json'))) {
    console.log("Config data not found! Creating config.json now")

    // Creates config.json using the empty template from data/templates/config_template.json
    fs.copyFileSync(path.join(__dirname, 'data', 'templates', 'config_template.json'), 'config.json')

    console.log("config.json created")
}

// Checks if config.json is missing options. Updates it with the missing ones if it is. Mostly only relavent for updates
config = JSON.parse(fs.readFileSync(path.join(__dirname, 'config.json')))
template = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'templates', 'config_template.json')))
if (Object.keys(config).toString() !== Object.keys(template).toString()) {
    console.log("Missing options in config. Updating config.json now")

    // Checks if each option from the template exists in the config, and creates it if not
    for (key of Object.keys(template)) {
        if (!Object.hasOwn(config, key)) {
            config[key] = template[key]
        }
    }

    // Creates a new config.json including the missing options and overwrites the old one
    fs.writeFileSync(path.join(__dirname, 'config.json'), JSON.stringify(config, null, 4))

    console.log("config.json updated")
}

const {devID} = require(path.join(__dirname, 'config.json'))

// Creates a new client and specifies which intents the bot will make use of
const client = new Client({intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildMessageReactions, GatewayIntentBits.MessageContent]})

// Gets the commands from their files and registers them as a collection 
client.commands = new Collection()
function registerClientCommands(client) {
    // Checks that the directories exist and creates them if they don't
    if (!fs.existsSync(path.join(__dirname, 'slash_commands'))) fs.mkdirSync(path.join(__dirname, 'slash_commands'))
    if (!fs.existsSync(path.join(__dirname, 'context_menu_commands'))) fs.mkdirSync(path.join(__dirname, 'context_menu_commands'))

    for (const folder of ['slash_commands', 'context_menu_commands']) {
        // Gets the contents of a folder
        const commandsPath = path.join(__dirname, folder)
        const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'))

        // Resisters each command in the folder if it has 'data' and 'execute' properties
        for (const file of commandFiles) {
            const filePath = path.join(commandsPath, file)
            const command = require(filePath)
            if ('data' in command && 'execute' in command) {
                client.commands.set(command.data.name, command)
            } else {
                console.error(`The command at ${filePath} lacks a data or exectue property and will not be usable`)
            }
        }
    }
    console.log(`Found ${client.commands.size} usable commands`)
}

// Gets the message components from their files and registers them as a collection
client.messageComponents = new Collection()
function registerClientMessageComponents(client) {
    for (const folder of fs.readdirSync(path.join(__dirname, 'message_components'))) {
        // Gets the contents of a folder
        const msgComponentPath = path.join(__dirname, 'message_components', folder)
        const msgComponentFiles = fs.readdirSync(msgComponentPath).filter(file => file.endsWith('.js'))

        // Resisters each message component in the folder if it has 'data' and 'execute' properties
        for (const file of msgComponentFiles) {
            const filePath = path.join(msgComponentPath, file)
            const msgComponent = require(filePath)
            if ('execute' in msgComponent) {
                client.messageComponents.set(path.parse(filePath).name, msgComponent)
            } else {
                console.error(`The message component at ${filePath} lacks an exectue property and will not be usable`)
            }
        }
    }
    console.log(`Found ${client.messageComponents.size} usable message components`)
}

//Runs the above functions once on startup
registerClientCommands(client)
registerClientMessageComponents(client)

// Runs once the client successfully logs in
client.once(Events.ClientReady, c => {
    console.log(`Logged in as ${c.user.tag}`)
})

// Runs when the client recieves an interaction
client.on(Events.InteractionCreate, async interaction => {
    if (interaction.isCommand()) {
        // Finds the command from the collection of the client's known commands
        const command = interaction.client.commands.get(interaction.commandName)
        // Errors and returns if the command isn't found
        if (!command) {
            console.error(`No command with the name ${interaction.commandName} was found`)
            return
        }

        // Executes the command from the collection
        try {
            await command.execute(interaction)
        } catch (error) {
            // If an error occurs, logs the error message to console and warns the user of the issue
            console.error(error)
            errorMessage = ""
            if (devID !== "") errorMessage = `An error has occurred! Please try again or contact <@${devID}> if the problem persists.`
            else errorMessage = "An error has occurred! Please try again or contact the developer if the problem persists."
            
            if (interaction.replied || interaction.deferred) await interaction.followUp({content: errorMessage, ephemeral: true})
            else await interaction.reply({content: errorMessage, ephemeral: true})
        }

        // Checks if the command is /reload, and re-registers the client's known commands and message components if it is
        if (interaction.commandName === 'reload') {
            registerClientCommands(client)
            registerClientMessageComponents(client)
        }
        // Checks if the command is /config, and deletes the cached values if it is
        else if (interaction.commandName === 'config') delete require.cache[path.join(__dirname, 'config.json')]
    }
    else if (interaction.isMessageComponent()) {
        // Finds the message component from the collection of the client's known message components
        const messageComponent = interaction.client.messageComponents.get(interaction.customId)
        // Errors and returns if the message component isn't found
        if (!messageComponent) {
            console.error(`No message component with the name ${interaction.customId} was found`)
            return
        }

        // Executes the message component from the collection
        try {
            await messageComponent.execute(interaction)
        } catch (error) {
            // If an error occurs, logs the error message to console and warns the user of the issue
            console.error(error)
            errorMessage = ""
            if (devID !== "") errorMessage = `An error has occurred! Please try again or contact <@${devID}> if the problem persists.`
            else errorMessage = "An error has occurred! Please try again or contact the developer if the problem persists."
            
            if (interaction.replied || interaction.deferred) await interaction.followUp({content: errorMessage, ephemeral: true})
            else await interaction.reply({content: errorMessage, ephemeral: true})
        }
    }
})

// Runs whevever a message is sent in a server the client is in
client.on(Events.MessageCreate, async message => {
    const emoji_react = require(path.join(__dirname, 'event_functions', 'emoji_react.js'))
    
    // Reacts with an emoji if the message matches an existing reaction rule
    try {await emoji_react.execute(message)} catch (error) {console.error(error)}
})

// Runs whenever changes are made to a member of a server the client is in
client.on(Events.GuildMemberUpdate, async (oldMember, newMember) => {
    const give_seperator_role = require(path.join(__dirname, 'event_functions', 'give_seperator_role.js'))

    // Gives a seperator role if the member has taken their first role from that category
    try {await give_seperator_role.execute(oldMember, newMember)} catch (error) {console.error(error)}
})

// Logs in to Discord as the bot
client.login(token)