// 1.Memory 清理模块
const memoryCleaner = require('./Memory/memoryCleaner');
// 2.Memory 结构定义模块
const memoryStructures = require('./Memory/memoryStructures');
// 3.像素生成器模块
const rolePixelGenerator = require('./role.pixelGenerator');
// 4.Tower 管理模块
const towerManager = require('./Structures/towerManager');
// 5.工厂管理模块
const factoryManager = require('./Structures/FactoryManage');
// 6.实验室管理模块
const labManager = require('./Structures/LabManage');
// 7.房间管理模块
const myRoomManager = require('./Rooms/MyRoom');
// 8.Link 管理模块
 const linkManager = require('./Structures/LinkManage');

module.exports.loop = function () {
    
    // 1.清理内存
    memoryCleaner.cleanMemory();
    // 2.初始化内存结构
    memoryStructures.initializeMemory();
    // 3.调用像素生成器
    rolePixelGenerator.run();
    // 4.管理 Tower 的防御
    towerManager.run();
    // 5.管理 工厂
    factoryManager.run();
    // 6.管理 实验室
    labManager.run();
    // 7.管理 房间
    myRoomManager.run();
    // 8.管理 Link
    linkManager.run();

    // 执行每个 Creep 的任务
    for (const name in Game.creeps) 
    {
        const creep = Game.creeps[name];
        const role = creep.memory.role;

        if (role === 'harvester') {
            require('role.harvester').run(creep);
        } else if (role === 'harvesterPro') {
            require('role.harvesterPro').run(creep);
        } else if (role === 'upgrader') {
            require('role.upgrader').run(creep);
        } else if (role === 'carrier'){
            require('role.carrier').run(creep);
        } else if (role === 'builder') {
            require('role.builder').run(creep);
        } else if (role === 'repairer') {
            require('role.repairer').run(creep);
        } else if (role === 'repairerWall') {
            require('role.repairerWall').run(creep);
        } else if (role === 'repairerContainer') {
            require('role.repairerContainer').run(creep);
        } else if (role === 'repairerRoad') {
            require('role.repairerRoad').run(creep);
        } else if (role === 'ChernoAlpha') {
            require('role.ChernoAlpha').run(creep);
        } else if (role === 'CrimsonTyphoon') {
            require('role.CrimsonTyphoon').run(creep);
        } else if (role === 'StrikerEureka') {
            require('role.StrikerEureka').run(creep);
        } else if (role === 'GipsyDanger') {
            require('role.GipsyDanger').run(creep);
        }
    }
};
