const path = require('path')

module.exports = {
    async execute(message) {
        // Gets the main directory of the program
        topDir = __dirname.split(path.sep).slice(0, -1).join(path.sep)

        // Gets the reaction rules list from config.json
        const {reactionRules} = require(path.join(topDir, 'config.json'))

        // Tests the message against each rule and reacts with the rule's emoji if it passes
        for (ruleID in reactionRules) {
            rule = reactionRules[ruleID]
            if (message.channel.id === rule['channelID']) {
                conditions = rule['conditions']
                if (!Object.hasOwn(conditions, 'attachment') || message.attachments.size !== 0) {
                    if (!Object.hasOwn(conditions, 'user') || message.author.id === conditions['user']) {
                        if (!Object.hasOwn(conditions, 'role') || message.member.roles.cache.some(role => role.id === conditions['role'])) {
                            await message.react(rule['emoji'])
                        }
                    }
                }
            }
        }
    }
}