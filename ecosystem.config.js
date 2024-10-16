module.exports = {
  apps: [
    {
      name: "creative_bot",
      script: "nodemon",
      args: "index.js",
      watch: ["index.js"], // Отслеживание изменений в файле index.js
      interpreter: "none", // Задаем интерпретатор "none", так как nodemon сам определит, какой использовать
      exec_mode: "fork",
    },
  ],
};
