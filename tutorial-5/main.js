var roleHarvester = require('role.harvester');
var roleUpgrader = require('role.upgrader');
var roleBuilder = require('role.builder');

module.exports.loop = function () {
    // 控制防御塔
    var tower = Game.getObjectById('76ab26816ad517a2da5a3b1f');
    if(tower) {
        var closestDamagedStructure = tower.pos.findClosestByRange(FIND_STRUCTURES, {
            filter: (structure) => structure.hits < structure.hitsMax
        });
        // 修复受损结构
        if(closestDamagedStructure) {
            tower.repair(closestDamagedStructure);
        }
        // 攻击最近的敌对爬虫
        var closestHostile = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
        if(closestHostile) {
            tower.attack(closestHostile);
        }
    }
    // 控制角色
    for(var name in Game.creeps) {
        var creep = Game.creeps[name];
        if(creep.memory.role == 'harvester') {
            roleHarvester.run(creep);
        }
        if(creep.memory.role == 'upgrader') {
            roleUpgrader.run(creep);
        }
        if(creep.memory.role == 'builder') {
            roleBuilder.run(creep);
        }
    }
}


// 控制台输入以下代码生成角色
//Game.spawns['Spawn1'].spawnCreep( [WORK, CARRY, MOVE], 'Harvester1' );
//Game.spawns['Spawn1'].spawnCreep( [WORK, CARRY, MOVE], 'Harvester2' );
//Game.spawns['Spawn1'].spawnCreep( [WORK, CARRY, MOVE], 'Upgrader1' );
// 给角色分配角色记忆
//Game.creeps['Harvester1'].memory.role = 'harvester';
//Game.creeps['Upgrader1'].memory.role = 'upgrader';

// 生成新的角色并分配角色记忆
//Game.spawns['Spawn1'].spawnCreep( [WORK, CARRY, MOVE], 'Builder1', { memory: { role: 'builder' } } );

// 生成更大能量容量的角色
//Game.spawns['Spawn1'].spawnCreep( [WORK,WORK,WORK,WORK,CARRY,MOVE,MOVE],'HarvesterBig', { memory: { role: 'harvester' } } );

// 让角色自杀
//Game.creeps['Harvester1'].suicide()

// 激活安全模式
//Game.spawns['Spawn1'].room.controller.activateSafeMode();

// 建造防御塔
//Game.spawns['Spawn1'].room.createConstructionSite( 23, 22, STRUCTURE_TOWER );
