const {SlashCommandBuilder, EmbedBuilder, MessagePayload} = require('discord.js')
const path = require('path')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('report')
        .setDescription('Reports another user to the moderators')
        .addUserOption(option => option
            .setName('user')
            .setDescription('Which user to report')
            .setRequired(true))
        .addBooleanOption(option => option
            .setName('anon')
            .setDescription('Whether to be anonymous in the report'))
        .addStringOption(option => option
            .setName('reason')
            .setDescription('Why you are reporting this user')
            .setMaxLength(1024)),
    
    // Files a report against a user
    async execute(interaction) {
        // Defers sending a response
        await interaction.deferReply({ephemeral: true})

        // Gets the main directory of the program
        topDir = __dirname.split(path.sep).slice(0, -1).join(path.sep)

        // Gets the reporting channel and mod role IDs from config.json
        const {reportChannelID, modRoleID} = require(path.join(topDir, 'config.json'))

        // Checks if a reporting channel has been set. Warns the user and returns if not
        if (reportChannelID === "") {
            await interaction.followUp("No reporting channel has been set! Please contact your mod team")
            return
        }

        // Gets the options from the interaction
        reportedUser = interaction.options.getUser('user')
        anon = interaction.options.getBoolean('anon')
        reason = interaction.options.getString('reason')

        //Checks that the user didn't report themself
        if (reportedUser.id === interaction.user.id) {
            await interaction.followUp("You can't report yourself!")
            return
        }

        // Builds the base interaction
        embed = new EmbedBuilder()
            .setColor('Red')
            .setTitle('User Report')
            .setThumbnail(reportedUser.displayAvatarURL())
            .addFields({name: 'Reported User:', value: `<@${reportedUser.id}>`})
            .setFooter({text: "This message was generated at a user's request by Kelp", iconURL: interaction.client.user.displayAvatarURL()})
            .setTimestamp()
        
        // Adds the reason in a new field, if it exists
        if (reason != undefined) embed.addFields({name: 'Reason:', value: reason})

        // Adds the sender, if they did not request to be anonymous. If they did, adds a field stating this
        if (anon !== true) embed.addFields({name: 'Sender:', value: `<@${interaction.user.id}>`})
        else embed.addFields({name: 'Sender', value: 'Anonymous'})

        // Sends the report to the reporting channel, pings the mod role if it has been set
        reportChannel = interaction.guild.channels.cache.get(reportChannelID)
        if (modRoleID !== "") await reportChannel.send({content: `<@&${modRoleID}>`, embeds: [embed]})
        else await reportChannel.send({embeds: [embed]})

        // Sends a copy of the report to the sender with a confirmation message
        await interaction.followUp({content: "Report submitted!", embeds: [embed]})
    }
}