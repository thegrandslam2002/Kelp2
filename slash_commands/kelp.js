const {SlashCommandBuilder} = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('kelp')
        .setDescription('Learn about who I am!')
        .addStringOption(option => option
            .setName('topic')
            .setDescription('Which topic to learn more about')
            .addChoices(
                {name: 'Kelp', value: 'kelp'},
                {name: 'Source', value: 'source'},
                {name: 'Credits', value: 'credits'},
                {name: 'History', value: 'history'})),
    
    // Replies with an ephemeral message giving info about the bot
    async execute(interaction) {
        // Gets the topic from the interaction
        topic = interaction.options.getString('topic')

        //Chooses the content of the message based on the requested topic
        message = ""
        if (topic === 'source') message = "My source can be found at <https://github.com/thegrandslam2002/Kelp2>"
        else if (topic === 'credits') message = "Kelp was created by Ben Howe (they/them) in 2023 for the Laurier Pride Society. A full list of contributors can be found [here](<https://github.com/thegrandslam2002/Kelp2/blob/main/README.md>)."
        else if (topic === 'history') message = "Even though I'm officially called \"Kelp2\", I'm actually the fourth version of Kelp! The first two got scrapped due to being based on bad libraries, and the third was overcome by feature bloat and a lack of development time. I... try not to think about it too much. I'm a rewrite of that last one, featuring a modular approach and a more community-focussed design philosophy!"
        else message = "Hey there! I'm Kelp, I use any pronouns, and my job is to help out around here. I can do loads of stuff, so check out my other commands!"

        //Sends an ephemeral reply with the specified content
        await interaction.reply({content: message, ephemeral: true})
    },
}