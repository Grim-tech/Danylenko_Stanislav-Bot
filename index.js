const fs = require("fs");
const path = require("path");
const { Client, Collection, GatewayIntentBits } = require("discord.js");
const config = require("./config.json");

const client = new Client({ intents: Object.keys(GatewayIntentBits) });

client.commands = new Collection();

const handlersPath = path.join(__dirname, "handlers");
const handlers = fs
  .readdirSync(handlersPath)
  .filter((file) => file.endsWith(".js"));

for (const file of handlers) {
  try {
    const handler = require(path.join(handlersPath, file));
    if (typeof handler === "function") {
      handler(client);
      console.log(`Загружен обработчик ${file}`);
    } else {
      console.error(`Файл ${file} не экспортирует функцию`);
    }
  } catch (error) {
    console.error(`Ошибка при загрузке обработчика ${file}:`, error);
  }
}

client.on('error', (error) => {
  console.error('Произошла ошибка клиента:', error);
});


client.on('interactionCreate', async (interaction) => {
  try {
    // Ваш код для обработки взаимодействий
  } catch (error) {
    console.error('Ошибка при обработке взаимодействия:', error);
    if (interaction.isRepliable()) {
      await interaction.reply({ content: 'Произошла ошибка при обработке вашего запроса.', ephemeral: true });
    }
  }
});

client.login(config.token).catch(error => {
  console.error('Ошибка при входе в систему:', error);
});

process.on('uncaughtException', (error) => {
  console.error('Необработанное исключение:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Необработанное отклонение промиса:', reason);
});

module.exports = client; // Экспортируем клиент