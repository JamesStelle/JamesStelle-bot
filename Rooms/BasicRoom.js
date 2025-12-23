module.exports = {
    run: function(room) {
        // 基础房间管理逻辑
        //获取本房间spawns
        if(!room.memorym.spawnCache || Game.time %100 ===0){
            room.memory.spawnCache = {
                spawns: room.find(FIND_MY_SPAWNS),
            };
        }
        const spawns = room.memory.spawnCache.spawns;

        //获取本房间creeps的数量
        if (!room.memory.creepCounts || Game.time % 10 === 0) {
            const creeps = room.find(FIND_MY_CREEPS);
            const harvesters = _.filter(creeps, (creep) => 
                creep.memory.role === 'harvester');
            const harvesterPros = _.filter(creeps, (creep) => 
                creep.memory.role === 'harvesterPro');
            const upgraders = _.filter(creeps, (creep) => 
                creep.memory.role === 'upgrader');
            const builders = _.filter(creeps, (creep) => 
                creep.memory.role === 'builder');
            const carriers = _.filter(creeps, (creep) => 
                creep.memory.role === 'carrier');
            const repairers = _.filter(creeps, (creep) => 
                creep.memory.role === 'repairer');
            const repairerWalls = _.filter(creeps, (creep) => 
                creep.memory.role === 'repairerWall');
            const repairerRoads = _.filter(creeps, (creep) => 
                creep.memory.role === 'repairerRoad');
            const repairerContainers = _.filter(creeps, (creep) => 
                creep.memory.role === 'repairerContainer');

            // 存储在房间记忆中
            room.memory.creepCounts = {
                harvesters: harvesters.length,
                harvesterPros: harvesterPros.length,
                upgraders: upgraders.length,
                builders: builders.length,
                carriers: carriers.length,
                repairers: repairers.length,
                repairerWalls: repairerWalls.length,
                repairerRoads: repairerRoads.length,
                repairerContainers: repairerContainers.length
            }
        }

        for (const spawn of spawns) {
            // 简单的生成逻辑
            if (harvesters.length < 2) {
                const body = [WORK, CARRY, MOVE, MOVE];
                spawn.spawnCreep(body, `Harvester${Game.time}`, { memory: { role: 'harvester' } });
            } else if (harvesterPros.length < 0) {
                const body = [WORK, CARRY, MOVE, MOVE];
                spawn.spawnCreep(body, `HarvesterPro${Game.time}`, { memory: { role: 'harvesterPro' } });
            } else if (upgraders.length < 2) {
                const body = [WORK, CARRY, MOVE, MOVE];
                spawn.spawnCreep(body, `Upgrader${Game.time}`, { memory: { role: 'upgrader' } });
            } else if (carriers.length < 1) {
                const body = [CARRY, CARRY, MOVE, MOVE];
                spawn.spawnCreep(body, `Carrier${Game.time}`, { memory: { role: 'carrier' } });
            } else if (builders.length < 1) {
                const body = [WORK, CARRY, MOVE, MOVE];
                spawn.spawnCreep(body, `Builder${Game.time}`, { memory: { role: 'builder' } });
            } else if (repairers.length < 2) {
                const body = [WORK, CARRY, MOVE, MOVE];
                spawn.spawnCreep(body, `Repairer${Game.time}`, { memory: { role: 'repairer' } });
            } else if (repairerWalls.length < 0) {
                const body = [WORK, CARRY, MOVE, MOVE];
                spawn.spawnCreep(body, `RepairerWall${Game.time}`, { memory: { role: 'repairerWall' } });
            } else if (repairerRoads.length < 0) {
                const body = [WORK, CARRY, MOVE, MOVE];
                spawn.spawnCreep(body, `RepairerRoad${Game.time}`, { memory: { role: 'repairerRoad' } });
            } else if (repairerContainers.length < 0) {
                const body = [WORK, CARRY, MOVE, MOVE];
                spawn.spawnCreep(body, `RepairerContainer${Game.time}`, { memory: { role: 'repairerContainer' } });
            }
        }
    }
};