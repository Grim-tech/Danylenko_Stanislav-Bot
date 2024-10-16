const { handleZayvka } = require('../utils/tags');
const cfg = require('../cfg.js');
const config = require('../config.json');

module.exports = {
    name: "ready",
    once: true,
    async execute(client) {
        console.log(`Ready! Logged in as ${client.user.tag}`);

        const dummyMessage = {
            author: client.user,
            guild: await client.guilds.fetch(config.guildID)
        };

        try {
            await handleZayvka(dummyMessage, client);
            console.log('handleZayvka выполнен успешно при запуске.');
        } catch (error) {
            console.error('Ошибка при выполнении handleZayvka при запуске:', error);
        }
    },
};