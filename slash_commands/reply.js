const {SlashCommandBuilder, PermissionFlagsBits} = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('reply')
        .setDescription('Replies to a message through the bot user')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
        .addStringOption(option => option
            .setName('target')
            .setDescription('The link to the message to reply to')
            .setRequired(true))
        .addStringOption(option => option
            .setName('reply')
            .setDescription('The reply to send as the bot. Supports standard Discord markdown')
            .setRequired(true))
        .addBooleanOption(option => option
            .setName('mention')
            .setDescription('Whether to ping the replied user or not')),

    // Sends a reply using the bot user to the specified message
    async execute(interaction) {
        // Defers sending a response
        await interaction.deferReply({ephemeral: true})

        // Gets the options from the interaction
        target = interaction.options.getString('target').split('/')
        reply = interaction.options.getString('reply')
        mention = interaction.options.getBoolean('mention')

        // Warns the user if the reply is empty and returns
        if (reply === "") {
            await interaction.followUp("You can't send an empty message!")
            return
        }

        // Sends the reply, replies with an error instead if the message can't be found
        try {
            // Finds the specified message
            channel = interaction.guild.channels.cache.get(target[5])
            message = await channel.messages.fetch(target[6])

            // Sends the reply to that message
            await message.reply({content: reply, allowedMentions: {repliedUser: mention}})
            await interaction.deleteReply()
        } catch {
            await interaction.followUp({content: 'This message could not be found', ephemeral: true})
            return
        }
    }
}