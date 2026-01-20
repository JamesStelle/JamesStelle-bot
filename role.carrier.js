var roleCarrier = {
    /** @param {Creep} creep **/
    run: function(creep) {
        // 如果 Creep 存储为空，获取资源
        if (creep.store.getUsedCapacity() === 0) {
            this.gatherResources(creep);
        }
        // 否则（非空），按优先级搬运资源
        else {
            this.deliverResources(creep);
        }
    },

    gatherResources: function(creep) {
        // 优先级1: 拾取墓碑中的资源
        const tombstones = creep.room.find(FIND_TOMBSTONES, {
            filter: (tombstone) => {
                // 检查墓碑是否含有能量或矿物
                return tombstone.store.getUsedCapacity() > 0;
            }
        });

        if (tombstones.length > 0) {
            const target = creep.pos.findClosestByPath(tombstones);
            if (target) {
                // 优先拾取能量，其次是矿物
                let resourceType = RESOURCE_ENERGY;
                if (target.store[RESOURCE_ENERGY] === 0) {
                    // 如果没有能量，找第一个可用的矿物资源
                    for (const resource in target.store) {
                        if (target.store[resource] > 0) {
                            resourceType = resource;
                            break;
                        }
                    }
                }

                if (creep.withdraw(target, resourceType) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(target, {visualizePathStyle: {stroke: '#ff0000'}});
                }
                creep.say(`💀 拾取${resourceType}`);
                return;
            }
        }

        // 优先级2: 拾取掉落的资源
        const droppedResources = creep.room.find(FIND_DROPPED_RESOURCES);
        if (droppedResources.length > 0) {
            const target = creep.pos.findClosestByPath(droppedResources);
            if (target) {
                if (creep.pickup(target) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(target, {visualizePathStyle: {stroke: '#ffff00'}});
                }
                creep.say(`📦 拾取${target.resourceType}`);
                return;
            }
        }

        // 优先级3: 从Link获取能量
        const links = creep.room.find(FIND_STRUCTURES, {
            filter: (s) => s.structureType == STRUCTURE_LINK &&
                           s.store[RESOURCE_ENERGY] > 0
        });

        if (links.length > 0) {
            // 优先选择距离 Storage 最近的 Link
            const storage = creep.room.storage;
            const storageLink = storage ? _.min(links, link => link.pos.getRangeTo(storage)) : links[0];
            
            if (storageLink) {
                if (creep.withdraw(storageLink, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(storageLink, {visualizePathStyle: {stroke: '#00ffff'}});
                }
                creep.say('🔗 Link');
                return;
            }
        }

        // 如果都没有，待机
        creep.say('💤 等待');
    },

    deliverResources: function(creep) {
        // 检查携带的资源类型
        const carriedResources = Object.keys(creep.store);
        const hasEnergy = creep.store[RESOURCE_ENERGY] > 0;
        const hasMinerals = carriedResources.some(resource => resource !== RESOURCE_ENERGY && creep.store[resource] > 0);

        // 如果携带能量，按原有优先级分配
        if (hasEnergy) {
            this.deliverEnergy(creep);
        }
        // 如果携带矿物，送到Storage或Terminal
        else if (hasMinerals) {
            this.deliverMinerals(creep);
        }
    },

    deliverEnergy: function(creep) {
        let target = null;
        
        // 优先级1: Extension 和 Spawn
        target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
            filter: (s) => (s.structureType == STRUCTURE_EXTENSION ||
                           s.structureType == STRUCTURE_SPAWN) &&
                           s.store.getFreeCapacity(RESOURCE_ENERGY) > 0
        });
        
        // 优先级2: Storage 和 Terminal
        if (!target) {
            target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                filter: (s) => (s.structureType == STRUCTURE_STORAGE ||
                               s.structureType == STRUCTURE_TERMINAL) &&
                               s.store.getFreeCapacity(RESOURCE_ENERGY) > 0
            });
        }
        
        // 优先级3: LAB
        if (!target) {
            target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                filter: (s) => s.structureType == STRUCTURE_LAB &&
                               s.store.getFreeCapacity(RESOURCE_ENERGY) > 0
            });
        }

        if (target) {
            if (creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}});
            }
            creep.say(`⚡ → ${target.structureType.replace('structure_', '')}`);
        } else {
            creep.say('💤 无目标');
        }
    },

    deliverMinerals: function(creep) {
        // 优先送到Terminal，其次Storage
        let target = creep.room.terminal;
        if (!target || target.store.getFreeCapacity() === 0) {
            target = creep.room.storage;
        }

        if (target && target.store.getFreeCapacity() > 0) {
            // 转移所有非能量资源
            for (const resourceType in creep.store) {
                if (resourceType !== RESOURCE_ENERGY && creep.store[resourceType] > 0) {
                    if (creep.transfer(target, resourceType) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(target, {visualizePathStyle: {stroke: '#00ff00'}});
                    }
                    creep.say(`💎 → ${target.structureType.replace('structure_', '')}`);
                    return;
                }
            }
        } else {
            creep.say('💤 存储满');
        }
    }
};

module.exports = roleCarrier;