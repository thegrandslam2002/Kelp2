const {SlashCommandBuilder, PermissionFlagsBits} = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('say')
        .setDescription('Sends a message through the bot user')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
        .addStringOption(option => option
            .setName('message')
            .setDescription('The message to send as the bot. Supports standard Discord markdown')
            .setRequired(true)),

    // Sends a message using the bot user in whichever channel the command was used in
    async execute(interaction) {
        // Defers sending a response
        await interaction.deferReply({ephemeral: true})

        // Gets the message from the interaction
        message = interaction.options.getString('message')

        // Sends the message in the channel the command was used in, warns the user instead if the message is empty
        if (message === "") await interaction.followUp("You can't send an empty message!")
        else {
            await interaction.channel.send(message)
            await interaction.deleteReply()
        }
    }
}