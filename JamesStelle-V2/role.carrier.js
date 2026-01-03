var roleCarrier = {

    /** @param {Creep} creep **/
    run: function(creep) {
        // 如果爬虫有空余容量，搬运Container的能量
        if(creep.store.getFreeCapacity() > 0) {
            // 查找最近的Container（有能量的）
            const container = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                filter: (s) => s.structureType == STRUCTURE_CONTAINER &&
                               s.store[RESOURCE_ENERGY] > 0
            });
            
            if(container) {
                if(creep.withdraw(container, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(container);
                }
                return;
            }
        }
        // 如果爬虫已满，向Extension/Spawn/Tower传输能量
        else {
            // 查找最近的需能建筑（优先Extension，其次Spawn/Tower）
            const target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                filter: (s) => (s.structureType == STRUCTURE_EXTENSION ||
                               s.structureType == STRUCTURE_SPAWN ||
                               s.structureType == STRUCTURE_TOWER) &&
                               s.store.getFreeCapacity(RESOURCE_ENERGY) > 0
            });
            
            if(target) {
                if(creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(target);
                }
            }
        }
    }
};
module.exports = roleCarrier;