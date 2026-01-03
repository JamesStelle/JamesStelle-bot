var runCreep = require('runCreep');
var memoryCleaner = require('memoryCleaner');
var spawnManager = require('spawnManager');
var Tower = require('Tower');
module.exports.loop = function () {
    
    // Run Creeps
    // 中文: 运行爬虫
    runCreep.run();
    // Clear Memory
    // 中文: 清理内存
    memoryCleaner.run();
    // Manage Spawns
    // 中文: 管理生成器
    spawnManager.run();
    // Manage Towers
    // 中文: 管理防御塔
    Tower.run();
    
}

