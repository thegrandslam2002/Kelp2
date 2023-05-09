const {SlashCommandBuilder, PermissionFlagsBits} = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('edit')
        .setDescription('Edits a message sent through the bot user')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
        .addStringOption(option => option
            .setName('target')
            .setDescription('The link to the message to edit')
            .setRequired(true))
        .addStringOption(option => option
            .setName('content')
            .setDescription('The updated content for the message. Supports standard Discord markdown')
            .setRequired(true)),

    // Edits specified message sent by the bot user
    async execute(interaction) {
        // Defers sending a response
        await interaction.deferReply({ephemeral: true})

        // Gets the options from the interaction
        target = interaction.options.getString('target').split('/')
        content = interaction.options.getString('content')

        // Warns the user if the message is empty and returns
        if (content === "") {
            await interaction.followUp("You can't send an empty message!")
            return
        }

        // Edits the message, replies with an error instead if the message can't be found
        try {
            // Finds the specified message
            channel = interaction.guild.channels.cache.get(target[5])
            message = await channel.messages.fetch(target[6])

            // Checks the the message is one sent by the bot, returns if not
            if (message.member.user !== interaction.client.user) {
                await interaction.followUp('This message cannot be edited!')
                return
            }
            // Sends the reply to that message
            await message.edit({content: content, allowedMentions: {repliedUser: false}})
            await interaction.deleteReply()
        } catch {
            await interaction.followUp({content: 'This message could not be found', ephemeral: true})
            return
        }
    }
}