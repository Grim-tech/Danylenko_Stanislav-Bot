const fs = require('fs');
const path = require('path');
const Logs = require('../utils/logs');
const { parseTimeString } = require('../utils/timetask');

function loadTasks(client) {
    const tasksDir = path.join(__dirname, '..', 'tasks');
    const taskFiles = fs.readdirSync(tasksDir).filter(file => file.endsWith('.js'));

    for (const file of taskFiles) {
        const task = require(path.join(tasksDir, file));
        if (typeof task.execute === 'function' && task.interval) {
            try {
                const intervalMs = parseTimeString(task.interval);
                setInterval(() => task.execute(client), intervalMs);
                Logs.info(`Задача ${file} загружена и будет выполняться каждые ${task.interval}`);
            } catch (error) {
                Logs.error(`Ошибка при загрузке задачи ${file}: ${error.message}`);
            }
        } else {
            Logs.warn(`Задача ${file} не соответствует требуемому формату`);
        }
    }
}

module.exports = loadTasks;