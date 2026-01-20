const E39N8Link = require('E39N8Link');
const E45N9Link = require('E45N9Link');
const E51N15Link = require('E51N15Link');
module.exports = function runLink() {
    // 检查并运行各房间的 Link 逻辑
    if (Game.rooms['E39N8']) E39N8Link();
    if (Game.rooms['E45N9']) E45N9Link();
    if (Game.rooms['E51N15']) E51N15Link();
    // 可以继续添加其他房间...
};
