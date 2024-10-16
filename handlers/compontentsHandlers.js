const fs = require('fs');
const path = require('path');
const Logs = require("../utils/logs");

function loadComponents(client) {
    const componentsPath = path.join(__dirname, '..', 'components');
    client.components = {
        buttons: new Map(),
        selects: new Map(),
        modals: new Map()
    };

    function readComponentsDir(dir, type) {
        const files = fs.readdirSync(dir, { withFileTypes: true });

        for (const file of files) {
            const filePath = path.join(dir, file.name);

            if (file.isDirectory()) {
                readComponentsDir(filePath, type);
            } else if (file.name.endsWith('.js')) {
                const component = require(filePath);
                if (component.execute && component.customId) {
                    client.components[type].set(component.customId, component);
                    Logs.info(`Загружен ${type}: ${component.customId}`);
                } else {
                    Logs.warn(`Пропущен файл ${filePath}: отсутствует execute или customId`);
                }
            }
        }
    }

    // Загрузка кнопок
    readComponentsDir(path.join(componentsPath, 'buttons'), 'buttons');

    // Загрузка селектов
    readComponentsDir(path.join(componentsPath, 'selects'), 'selects');

    // Загрузка модальных окон
    readComponentsDir(path.join(componentsPath, 'modals'), 'modals');

    // Обработчик для всех типов компонентов
    client.on('interactionCreate', async (interaction) => {
        if (interaction.isButton()) {
            const button = client.components.buttons.get(interaction.customId);
            if (button) await button.execute(interaction);
        } else if (interaction.isStringSelectMenu()) { // Изменено здесь
            const select = client.components.selects.get(interaction.customId);
            if (select) await select.execute(interaction);
        } else if (interaction.isModalSubmit()) {
            const modal = client.components.modals.get(interaction.customId);
            if (modal) await modal.execute(interaction);
        }
    });
}

module.exports = loadComponents;    