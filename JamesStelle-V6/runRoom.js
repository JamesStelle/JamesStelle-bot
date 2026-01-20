// runRoom.js
const roomE39N8 = require('E39N8');
const roomE45N9 = require('E45N9');
const roomE51N15 = require('E51N15');
const roomE49N13 = require('E49N13');
module.exports = {
    run: function() {
        // 调用每个房间的逻辑
        roomE39N8.run();
        roomE45N9.run();
        roomE51N15.run();
        roomE49N13.run();
    }
};
