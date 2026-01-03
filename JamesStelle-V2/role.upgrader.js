var roleUpgrader = {

    /** @param {Creep} creep **/
    run: function(creep) {
        // 中文: 如果爬虫没有能量，从Container采集
        if(creep.store[RESOURCE_ENERGY] === 0) {
            // 查找最近的Container（有能量的）
            const container = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                filter: (s) => s.structureType == STRUCTURE_CONTAINER &&
                               s.store[RESOURCE_ENERGY] > 0
            });
            
            if(container) {
                if(creep.withdraw(container, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(container);
                }
            }
        }
        // 中文: 如果爬虫有能量，升级控制器
        else {
            if(creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
                creep.moveTo(creep.room.controller);
            }
        }
    }
};

module.exports = roleUpgrader;
