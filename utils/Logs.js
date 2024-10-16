const fs = require('fs');
const path = require('path');

class Logs {
  constructor(logDir = 'logs') {
    this.logDir = logDir;
    this.ensureLogDirectory();
  }

  ensureLogDirectory() {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  log(message, level = 'INFO', consoleOutput = true) {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] [${level}] ${message}\n`;
    const logFile = path.join(this.logDir, `${level.toLowerCase()}.log`);

    fs.appendFileSync(logFile, logEntry);
    if (consoleOutput) {
      console.log(logEntry.trim());
    }
  }

  info(message, consoleOutput = true) {
    this.log(message, 'INFO', consoleOutput);
  }

  warn(message, consoleOutput = true) {
    this.log(message, 'WARN', consoleOutput);
  }

  error(message, consoleOutput = true) {
    this.log(message, 'ERROR', consoleOutput);
  }

  debug(message, consoleOutput = false) {
    this.log(message, 'DEBUG', consoleOutput);
  }
}

module.exports = new Logs();