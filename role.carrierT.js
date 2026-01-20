var roleCarrierT = {
    /** @param {Creep} creep **/
    run: function(creep) {
        // 如果 Creep 存储为空，取能量
        if (creep.store.getUsedCapacity() === 0) {
            const links = creep.room.find(FIND_STRUCTURES, {
                filter: (s) => s.structureType == STRUCTURE_LINK &&
                               s.store[RESOURCE_ENERGY] > 0
            });

            // 优先选择距离 Storage 最近的 Link
            let storageLink = null;
            if (links.length > 0) {
                const storage = creep.room.storage;
                storageLink = storage ? _.min(links, link => link.pos.getRangeTo(storage)) : links[0];
            }

            if (storageLink) {
                if (creep.withdraw(storageLink, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(storageLink);
                    creep.say('🚶 → Link');
                } else {
                    creep.say('🔗 取能量');
                }
                return; // 成功从 Link 取能量后直接返回
            }

            // 如果没有 Link 能量，拾取地面能量
            const droppedEnergy = creep.pos.findClosestByPath(FIND_DROPPED_RESOURCES, {
                filter: (resource) => resource.resourceType == RESOURCE_ENERGY
            });

            if (droppedEnergy) {
                if (creep.pickup(droppedEnergy) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(droppedEnergy);
                    creep.say('🚶 → 掉落');
                } else {
                    creep.say('📦 拾取');
                }
                return; // 成功拾取地面能量后直接返回
            }

            // 没有能量来源
            creep.say('⏳ 等能量');
        }
        // 否则（非空），搬运能量
        else {
            // 1. 优先给能量低于 50% 的 Tower 补充能量
            const lowEnergyTowers = creep.room.find(FIND_STRUCTURES, {
                filter: (s) => s.structureType == STRUCTURE_TOWER &&
                              s.store[RESOURCE_ENERGY] < s.store.getCapacity(RESOURCE_ENERGY) * 0.5 // 能量低于 50%
            });

            if (lowEnergyTowers.length > 0) {
                const closestTower = creep.pos.findClosestByPath(lowEnergyTowers);
                if (creep.transfer(closestTower, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(closestTower);
                    creep.say('🚶 → Tower');
                } else {
                    creep.say('🏰 → Tower');
                }
                return; // 成功补充 Tower 后直接返回
            }

            // 2. 如果没有低能量 Tower，给其他结构（如 Extension）补充能量
            const otherTargets = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                filter: (s) => s.structureType == STRUCTURE_EXTENSION &&
                              s.store.getFreeCapacity(RESOURCE_ENERGY) > 0
            });

            if (otherTargets) {
                if (creep.transfer(otherTargets, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(otherTargets);
                    creep.say('🚶 → Ext');
                } else {
                    creep.say('⚡ → Ext');
                }
            } else {
                creep.say('💤 无目标');
            }
        }
    }
};

module.exports = roleCarrierT;
