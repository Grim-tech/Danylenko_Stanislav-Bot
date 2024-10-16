function parseTimeString(timeString) {
    const regex = /^(\d+)(s|sec|min|h|hr|d|day)$/;
    const match = timeString.match(regex);
    
    if (!match) {
        throw new Error('Неверный формат времени. Используйте число, за которым следует s, sec, min, h, hr, d или day.');
    }
    
    const value = parseInt(match[1]);
    const unit = match[2];
    
    switch (unit) {
        case 's':
        case 'sec':
            return value * 1000;
        case 'min':
            return value * 60 * 1000;
        case 'h':
        case 'hr':
            return value * 60 * 60 * 1000;
        case 'd':
        case 'day':
            return value * 24 * 60 * 60 * 1000;
        default:
            throw new Error('Неизвестная единица времени');
    }
}

module.exports = { parseTimeString };