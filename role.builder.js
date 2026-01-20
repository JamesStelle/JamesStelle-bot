var roleBuilder = {
    //通用
    /** @param {Creep} creep **/
    run: function(creep) {
        // 状态切换逻辑
        if(creep.memory.working && creep.store[RESOURCE_ENERGY] == 0) {
            creep.memory.working = false;
            creep.say('🔄 挖能量');
        }
        if(!creep.memory.working && creep.store.getFreeCapacity() == 0) {
            creep.memory.working = true;
            creep.say('🚧 工作中');
        }

        if(creep.memory.working) {
            // 工作模式：优先建造，其次修复
            this.doWork(creep);
        }
        else {
            // 采集模式：从多种来源获取能量
            this.harvestEnergy(creep);
        }
    },

    doWork: function(creep) {
        // 优先级1: 建造任务
        const constructionSites = creep.room.find(FIND_CONSTRUCTION_SITES);
        if(constructionSites.length > 0) {
            // 选择最近的建造点
            const target = creep.pos.findClosestByPath(constructionSites);
            if(target) {
                if(creep.build(target) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}});
                }
                creep.say('🚧 建造');
                return;
            }
        }

        // 优先级2: 修复任务（没有建造任务时）
        const damagedStructures = creep.room.find(FIND_STRUCTURES, {
            filter: (structure) => {
                return structure.hits < structure.hitsMax && 
                       structure.structureType != STRUCTURE_WALL &&
                       structure.structureType != STRUCTURE_RAMPART;
            }
        });

        if(damagedStructures.length > 0) {
            // 按损坏程度排序，优先修复损坏严重的
            damagedStructures.sort((a, b) => {
                const damageA = (a.hitsMax - a.hits) / a.hitsMax;
                const damageB = (b.hitsMax - b.hits) / b.hitsMax;
                return damageB - damageA;
            });

            const target = damagedStructures[0];
            if(creep.repair(target) == ERR_NOT_IN_RANGE) {
                creep.moveTo(target, {visualizePathStyle: {stroke: '#00ff00'}});
            }
            creep.say('🔧 修复');
            return;
        }

        // 没有任务时，待机
        creep.say('💤 待机');
    },

    harvestEnergy: function(creep) {
        // 直接从Source挖取能量
        const sources = creep.room.find(FIND_SOURCES);
        if(sources.length > 0) {
            const target = creep.pos.findClosestByPath(sources);
            if(target) {
                if(creep.harvest(target) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(target, {visualizePathStyle: {stroke: '#ffaa00'}});
                }
                creep.say('⛏️ 挖矿');
            }
        }
    }
};

module.exports = roleBuilder;