const {SlashCommandBuilder, PermissionFlagsBits, ChannelType, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder} = require('discord.js')
const fs = require('fs')
const path = require('path')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('config')
        .setDescription('Set various properties of the bot')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addSubcommand(subcommand => subcommand
            .setName('mod_role')
            .setDescription('Change the role the bot pings when a report is sent')
            .addRoleOption(option => option
                .setName('role')
                .setDescription('The role to set as the moderator role')
                .setRequired(true)))
        .addSubcommand(subcommand => subcommand
            .setName('report_channel')
            .setDescription('Change the channel the bot sends reports to')
            .addChannelOption(option => option
                .setName('channel')
                .setDescription('The channel to send reports to')
                .addChannelTypes(ChannelType.GuildText)
                .setRequired(true)))
        .addSubcommand(subcommand => subcommand
            .setName('identity_divider')
            .setDescription('The role used to seperate identities')
            .addRoleOption(option => option
                .setName('role')
                .setDescription('The divider role')
                .setRequired(true)))
        .addSubcommand(subcommand => subcommand
            .setName('other_divider')
            .setDescription('The role used to seperate "other" roles')
            .addRoleOption(option => option
                .setName('role')
                .setDescription('The divider role')
                .setRequired(true)))
        .addSubcommandGroup(subcommandGroup => subcommandGroup
            .setName('reaction_rules')
            .setDescription("Manage the bot's reaction rules")
            .addSubcommand(subcommand => subcommand
                .setName('add')
                .setDescription('Add a new rule for reacting to messages')
                .addChannelOption(option => option
                    .setName('channel')
                    .setDescription('The channel to react to messages in')
                    .addChannelTypes(ChannelType.GuildText)
                    .setRequired(true))
                .addStringOption(option => option
                    .setName('emoji')
                    .setDescription('The emoji to react with')
                    .setRequired(true))
                .addBooleanOption(option => option
                    .setName('has_attachment')
                    .setDescription('Whether to require an attachment to recieve a reaction'))
                .addUserOption(option => option
                    .setName('from_user')
                    .setDescription('Only react to a specific user'))
                .addRoleOption(option => option
                    .setName('has_role')
                    .setDescription('Only react to users with a role')))
            .addSubcommand(subcommand => subcommand
                .setName('remove')
                .setDescription('Remove an existing rule for reacting to messages'))
            .addSubcommand(subcommand => subcommand
                .setName('cleanup')
                .setDescription('Remove broken or obsolete rules'))
            .addSubcommand(subcommand => subcommand
                .setName('list')
                .setDescription('Create a list of reaction rules'))),
    
    // Updates config.json values
    async execute(interaction) {
        // Gets the main directory of the program
        topDir = __dirname.split(path.sep).slice(0, -1).join(path.sep)

        // Gets the method to update the config
        const updateConfig = require(path.join(topDir, 'functions', 'update_config.js'))

        // Gets which subcommand was used and runs updateConfig() with the appropriate option(s), then sends a confirmation message
        if (interaction.options.getSubcommand() === 'mod_role') {
            // Defers sending a response
            await interaction.deferReply()

            // Gets the value of the command's option
            roleID = interaction.options.getRole('role').id

            // Updates config.json
            updateConfig.execute('modRoleID', roleID)

            // Gives a confirmation message
            await interaction.followUp(`Mod role updated to: <@&${roleID}>`)
        }
        else if (interaction.options.getSubcommand() === 'report_channel') {
            // Defers sending a response
            await interaction.deferReply()

            // Gets the value of the command's option
            channelID = interaction.options.getChannel('channel').id

            // Updates config.json
            updateConfig.execute('reportChannelID', channelID)

            // Gives a confirmation message
            await interaction.followUp(`Reporting channel updated to: <#${channelID}>`)
        }
        else if (interaction.options.getSubcommand() === 'identity_divider') {
            // Defers sending a response
            await interaction.deferReply()

            // Gets the value of the command's option
            identityDividerID = interaction.options.getRole('role').id

            // Updates config.json
            updateConfig.execute('identityDividerID', identityDividerID)

            // Gives a confirmation message
            await interaction.followUp(`Identity divider role updated to: <@&${identityDividerID}>`)
        }
        else if (interaction.options.getSubcommand() === 'other_divider') {
            // Defers sending a response
            await interaction.deferReply()

            // Gets the value of the command's option
            otherDividerID = interaction.options.getRole('role').id

            // Updates config.json
            updateConfig.execute('otherDividerID', otherDividerID)

            // Gives a confirmation message
            await interaction.followUp(`"Other" divider role updated to: <@&${otherDividerID}>`)
        }
        else if (interaction.options.getSubcommandGroup() === 'reaction_rules' && interaction.options.getSubcommand() === 'add') {
            // Defers sending a response
            await interaction.deferReply()

            // Gets the values of the command's options
            channelID = interaction.options.getChannel('channel').id
            emoji = interaction.options.getString('emoji')
            conditions = {}
            conditionNames = []
            if (interaction.options.getBoolean('has_attachment')) {
                conditions['attachment'] = true
                conditionNames.push("`has attachment`")
            }
            if (interaction.options.getUser('from_user') != undefined) {
                conditions['user'] = interaction.options.getUser('from_user').id
                conditionNames.push(`\`sent by:\` <@${conditions['user']}>`)
            }
            if (interaction.options.getRole('has_role') != undefined) {
                conditions['role'] = interaction.options.getRole('has_role').id
                conditionNames.push(`\`has role:\` <@&${conditions['role']}>`)
            }

            // Gets the current list of reaction rules from config.json
            reactionRules = JSON.parse(fs.readFileSync(path.join(topDir, 'config.json')))['reactionRules']

            // Checks if a duplicate rule already exists, warns the user and returns if it does
            for (ruleID in reactionRules) if (JSON.stringify(reactionRules[ruleID]) === JSON.stringify({channelID: channelID, emoji: emoji, conditions: conditions})) {
                interaction.followUp('Rule already exists!')
                return
            }

            // Adds the user's settings as an object to the list of rules and updates the config with it
            reactionRules[Date.now()] = {channelID: channelID, emoji: emoji, conditions: conditions}
            
            // Tests if the emoji string provided is usable as a reaction
            await interaction.followUp('Testing rule...')
            try {
                reply = await interaction.fetchReply()
                await reply.react(emoji)
            } catch {
                await interaction.editReply('Rule failed! Check that the emoji input contains only the emoji')
                return
            }

            // Updates config.json
            updateConfig.execute('reactionRules', reactionRules)

            // Gives a confirmation message
            conditionText = ", conditions: " + conditionNames.join(', ')
            content = `New rule created: react with ${emoji} to messages sent in <#${channelID}>`
            if (conditionText !== ", conditions: ") content += conditionText
            await interaction.editReply(content)
        }
        else if (interaction.options.getSubcommandGroup() === 'reaction_rules' && interaction.options.getSubcommand() === 'remove') {
            // Defers sending a response
            await interaction.deferReply()

            // Gets the current list of reaction rules from config.json
            reactionRules = JSON.parse(fs.readFileSync(path.join(topDir, 'config.json')))['reactionRules']

            // Checks that the list is not empty, retuens if it is
            if (Object.keys(reactionRules).length === 0) {
                interaction.followUp('No reaction rules exist yet!')
                return
            }

            // Creates a select menu
            selectMenu = new StringSelectMenuBuilder()
                .setCustomId('menu_remove_reaction_rule')
                .setPlaceholder('Choose a rule to remove')
            
            // Adds a new option to the select menu for each rule
            for (ruleID in reactionRules) {
                // Gets the reaction rule
                rule = reactionRules[ruleID]

                label = ''

                // Gets the channel name if possible, falls back to the ID if not
                if (interaction.guild.channels.cache.some(channel => channel.id === rule['channelID'])) {
                    label = `#${interaction.guild.channels.cache.get(rule['channelID']).name}`
                } else label = rule['channelID']

                // Creates a list of conditions
                conditions = []
                if (Object.hasOwn(rule['conditions'], 'attachment')) conditions.push("has attachment: true")
                if (Object.hasOwn(rule['conditions'], 'user')) {
                    if (interaction.guild.members.cache.some(member => member.id === rule['conditions'].user)) {
                        conditions.push(`sent by: ${interaction.guild.members.cache.get(rule['conditions'].user).user.username}`)
                    } else conditions.push(`@${rule['conditions'].user}`)
                }
                if (Object.hasOwn(rule['conditions'], 'role')) {
                    if (interaction.guild.roles.cache.some(role => role.id === rule['conditions'].role)) {
                        conditions.push(`has role: ${interaction.guild.roles.cache.get(rule['conditions'].role).name}`)
                    } else conditions.push(`@&${rule['conditions'].role}`)
                }

                // Joins the list into a string. If the string is empty, sets its value to 'none'
                conditionsString = conditions.join(', ')
                if (conditionsString === '') conditionsString = 'none'

                // Adds a new entry to the select menu using the rule's info
                selectMenu.addOptions(
                    new StringSelectMenuOptionBuilder()
                        .setLabel(label)
                        .setDescription(conditionsString)
                        .setEmoji(rule['emoji'])
                        .setValue(ruleID.toString())
                )
            }

            // Creates an action row message component containing the select menu
            row = new ActionRowBuilder()
                .addComponents(selectMenu)
            
            // Sends a reply with the select menu. If this doesn't work, warns the user
            try {await interaction.followUp({components: [row]})} catch {await interaction.followUp('Menu creation failed! Try running /config cleanup_reaction_rules')}
        }
        else if (interaction.options.getSubcommandGroup() === 'reaction_rules' && interaction.options.getSubcommand() === 'cleanup') {
            // Replies with a temporary message
            await interaction.reply('Testing rules...')

            // Gets the current list of reaction rules from config.json
            reactionRules = JSON.parse(fs.readFileSync(path.join(topDir, 'config.json')))['reactionRules']

            // Performs various tests to see if rules are valid. If a rule is not valid, deletes it from the list
            numRemoved = 0
            for (ruleID in reactionRules) {
                rule = reactionRules[ruleID]
            
                // Tests if the rule's channel still exists
                if (!interaction.guild.channels.cache.some(channel => channel.id === rule['channelID'])) {
                    delete reactionRules[ruleID]
                    numRemoved++
                }
                // Tests if the rule's user exists, if one is specified
                else if (Object.hasOwn(rule['conditions'], 'user') && !interaction.guild.members.cache.some(member => member.id === rule['conditions'].user)) {
                    delete reactionRules[ruleID]
                    numRemoved++
                }
                // Tests if the rule's role exists, if one is specified
                else if (Object.hasOwn(rule['conditions'], 'role') && !interaction.guild.roles.cache.some(role => role.id === rule['conditions'].role)) {
                    delete reactionRules[ruleID]
                    numRemoved++
                }
                // Tests if the emoji is usable
                else try {
                    reply = await interaction.fetchReply()
                    await reply.react(rule['emoji'])
                } catch {
                    delete reactionRules[ruleID]
                    numRemoved++
                }
            }

            // Updates the config with the new list of rules
            updateConfig.execute('reactionRules', reactionRules)

            // Gives a confirmation message with the number of removed rules
            interaction.editReply(`Deleted ${numRemoved} broken rules`)
        }
        else if (interaction.options.getSubcommandGroup() === 'reaction_rules' && interaction.options.getSubcommand() === 'list') {
            // Defers sending a response
            await interaction.deferReply()

            // Gets the current list of reaction rules from config.json
            reactionRules = JSON.parse(fs.readFileSync(path.join(topDir, 'config.json')))['reactionRules']

            // Creates a list of rules in string form
            rulesList = []
            for (ruleID in reactionRules) {
                rule = reactionRules[ruleID]

                // Creates a list of conditions
                conditions = []
                if (Object.hasOwn(rule['conditions'], 'attachment')) conditions.push("`has attachment: true`")
                if (Object.hasOwn(rule['conditions'], 'user')) conditions.push(`\`sent by:\` <@${rule['conditions'].user}>`)
                if (Object.hasOwn(rule['conditions'], 'role')) conditions.push(`\`has role:\` <@&${rule['conditions'].role}>`)

                // Adds an entry to the list of rules
                if (conditions.length !== 0) rulesList.push(`React with ${rule['emoji']} to messages in <#${rule['channelID']}>, conditions: ${conditions.join(', ')}`)
                else rulesList.push(`React with ${rule['emoji']} to messages in <#${rule['channelID']}>`)
            }

            // Checks if there are any reaction rules, if there are not, replies stating this and returns
            if (rulesList.length === 0) {
                await interaction.followUp("No reaction rules exist yet!")
                return
            }

            // Replies with a list of reaction rules
            interaction.followUp(`Reaction rules:\n    ${rulesList.join('\n    ')}`)
        }
    }
}