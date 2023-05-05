const fs = require('fs')
const path = require('path')

module.exports = {
    async execute(oldMember, newMember) {
        // Gets the main directory of the program and seperator role IDs
        topDir = __dirname.split(path.sep).slice(0, -1).join(path.sep)
        const {identityDividerID, otherDividerID} = require(path.join(topDir, 'config.json'))

        // Checks if the role divider IDs have been set, returns if not
        if (identityDividerID === '' || otherDividerID === '') return
        
        // Checks if the member already has both roles, returns if they do
        if (newMember.roles.cache.some(role => role.id === identityDividerID) && newMember.roles.cache.some(role => role.id === otherDividerID)) return

        // Finds the role the member has gained, if any
        for (role of newMember.roles.cache) {
            if (!oldMember.roles.cache.some(oldRole => oldRole.id === role[1].id)) {
                // Checks if the new role is an identity or other role using role ordering, then gives that seperator role
                identityDividerRole = newMember.guild.roles.cache.get(identityDividerID)
                otherDividerRole = newMember.guild.roles.cache.get(otherDividerID)

                if (role[1].position < identityDividerRole.position) {
                    if (role[1].position > otherDividerRole.position) await newMember.roles.add(identityDividerRole)
                    else await newMember.roles.add(otherDividerRole)
                }
            }
        }
    }
}