const fs = require('fs')
const path = require('path')

module.exports = {
    // Deletes the rule specified from /config remove_reaction_role
    async execute(interaction) {
        // Gets the main directory of the program
        topDir = __dirname.split(path.sep).slice(0, -2).join(path.sep)

        // Gets the current list of reaction rules from config.json
        reactionRules = JSON.parse(fs.readFileSync(path.join(topDir, 'config.json')))['reactionRules']

        // Checks that the specified rule exists, warns the user and returns if not
        if (!Object.hasOwn(reactionRules, interaction.values[0])) {
            interaction.update('The chosen rule cannot be found')
            return
        }
        // Gets which rule will be deleted and creates a description of it
        rule = reactionRules[interaction.values[0]]
        conditionNames = []
        if (Object.hasOwn(rule['conditions'], 'attachment')) conditionNames.push("`has attachment`")
        if (Object.hasOwn(rule['conditions'], 'user')) conditionNames.push(`\`sent by:\` <@${rule['conditions'].user}>`)
        if (Object.hasOwn(rule['conditions'], 'role')) conditionNames.push(`\`has role:\` <@&${rule['conditions'].role}>`)
        ruleDesc = `React with ${rule['emoji']} to messages sent in <#${rule['channelID']}>`
        if (conditionNames.length != 0) ruleDesc += ", conditions: " + conditionNames.join(', ')

        // Removes the rule from the list of rules
        delete reactionRules[interaction.values[0]]
        
        // Gets the method to update config
        const updateConfig = require(path.join(topDir, 'functions', 'update_config.js'))

        // Updates config.json with the new list of rules
        updateConfig.execute("reactionRules", reactionRules)

        // Edits the original interaction with the removed rule
        await interaction.update({content: `Removed rule: ${ruleDesc}`, components: []})
    }
}