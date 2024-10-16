const fs = require('fs');
const path = require('path');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const config = require('../config.json');
const Logs = require("../utils/logs");

async function loadCommands(client) {
    const commands = [];
    const commandsPath = path.join(__dirname, '..', 'app');

    function readCommandsDir(dir) {
        const files = fs.readdirSync(dir, { withFileTypes: true });

        for (const file of files) {
            const filePath = path.join(dir, file.name);

            if (file.isDirectory()) {
                readCommandsDir(filePath);
            } else if (file.name.endsWith('.js')) {
                const command = require(filePath);
                if (command.data && command.execute) {
                    commands.push(command.data.toJSON());
                    client.commands.set(command.data.name, command);
                    Logs.info(`Загружена команда: ${command.data.name}`);
                } else {
                    Logs.warn(`Пропущен файл ${filePath}: отсутствует data или execute`);
                }
            }
        }
    }

    readCommandsDir(commandsPath);
    Logs.info(`Загружено команд: ${client.commands.size}`);
    Logs.info('Загруженные команды:', client.commands.map(cmd => cmd.data.name).join(', '));

    const rest = new REST({ version: '9' }).setToken(config.token);

    try {
        Logs.info('Начинаем обновление слэш-команд (/)');

        await rest.put(
            Routes.applicationGuildCommands(config.clientID, config.guildID),
            { body: commands }
        );

        Logs.info('Слэш-команды (/) успешно обновлены');
    } catch (error) {
        Logs.error('Произошла ошибка при обновлении слэш-команд:', error);
    }
}

module.exports = loadCommands;