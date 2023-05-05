const {SlashCommandBuilder, PermissionFlagsBits, REST, Routes} = require('discord.js')
const fs = require('fs')
const path = require('path')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('reload')
        .setDescription('Registers commands to the current server')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    
    // Updates the list of commands registered to the server
    async execute(interaction) {
        // Defers sending a response to avoid errors if registry takes more than 3 seconds
        await interaction.deferReply({ephemeral: true})
        
        // Gets the main directory of the program
        topDir = __dirname.split(path.sep).slice(0, -1).join(path.sep)
        
        // Gets the token and client ID from application_data.json
        const {token, clientID} = require(path.join(topDir, 'application_data.json'))

        // Checks if the token and client ID are set. Flags the function to return if not
        exitFlag = false
        if (token === "") {
            console.error("Token not set!")
            exitFlag = true
        }
        if (clientID === "") {
            console.error("Client ID not set!")
            exitFlag = true
        }

        // Returns with a message to the user if any of the required variables are not set
        if (exitFlag === true) {
            await interaction.followUp("Token or Client ID not set! Command failed.")
            return
        }

        // Gets the contents of slash_commands and context_menu_commands and adds their data in JSON format to an array
        const commands = []
        for (const folder of ['slash_commands', 'context_menu_commands']) {
            // Gets the contents of a folder
            const commandsPath = path.join(topDir, folder)
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

        // Registers commands from the array to the bot via REST
        console.log(`Registering ${commands.length} commands to server`)
        const data = await rest.put(
            Routes.applicationGuildCommands(clientID, interaction.guildId),
            {body: commands},
        )
        console.log(`Successfully registered ${data.length} commands to server`)

        // Follows up with a success message
        await interaction.followUp(`Successfully registered ${data.length} commands`)
    },
}