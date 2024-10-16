const Logs = require("../utils/logs");

module.exports = {
    name: 'interactionCreate',
    async execute(interaction, client) {
        if (!interaction.isCommand()) return;

        if (!client || !client.commands) {
            Logs.error('client или client.commands не определены');
            return;
        }

        Logs.info(`Попытка выполнить команду: ${interaction.commandName}`);
        Logs.info(`Доступные команды: ${Array.from(client.commands.keys()).join(', ')}`);

        const command = client.commands.get(interaction.commandName);

        if (!command) {
            Logs.warn(`Попытка выполнить несуществующую команду: ${interaction.commandName}`);
            return;
        }

        try {
            await command.execute(interaction, client);
        } catch (error) {
            Logs.error(`Ошибка при выполнении команды ${interaction.commandName}:`, error);
            
            const errorMessage = 'Произошла ошибка при выполнении команды.';
            
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ content: errorMessage, ephemeral: true });
            } else {
                await interaction.reply({ content: errorMessage, ephemeral: true });
            }
        }
    },
};