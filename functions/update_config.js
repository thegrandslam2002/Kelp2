const fs = require('fs')
const path = require('path')

module.exports = {
    // Updates the config with the specified option, keeping all other values the same
    execute(key, value) {
        // Gets the main directory of the program
        topDir = __dirname.split(path.sep).slice(0, -1).join(path.sep)

        // Reads config.json and parses its values into an object
        config = JSON.parse(fs.readFileSync(path.join(topDir, 'config.json')))
        
        // Replaces the previous value of the specified variable with the new one
        config[key] = value

        // Creates a new config.json including the changed option and overwrites the old one
        fs.writeFileSync(path.join(topDir, 'config.json'), JSON.stringify(config, null, 4))
        console.log(`Value of config setting "${key}" has been updated to: ${value}`)
    }
}