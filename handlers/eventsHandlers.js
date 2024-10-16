const fs = require('fs');
const path = require('path');

function loadEvents(client) {
    const eventsPath = path.join(__dirname, '..', 'events');
    
    function readEventsDir(dir) {
        const eventFiles = fs.readdirSync(dir, { withFileTypes: true });
        
        for (const file of eventFiles) {
            if (file.isDirectory()) {
                readEventsDir(path.join(dir, file.name));
            } else if (file.name.endsWith('.js')) {
                const filePath = path.join(dir, file.name);
                const event = require(filePath);
                
                if (event.once) {
                    client.once(event.name, (...args) => event.execute(...args, client));
                } else {
                    client.on(event.name, (...args) => event.execute(...args, client));
                }
            }
        }
    }

    readEventsDir(eventsPath);
}

module.exports = loadEvents;