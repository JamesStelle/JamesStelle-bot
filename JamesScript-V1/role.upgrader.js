var roleUpgrader = {

    /** @param {Creep} creep **/
    run: function(creep) {
        // If creep has no energy, harvest from source
        // 中文: 如果爬虫没有能量，从源头采集
	    if(creep.store[RESOURCE_ENERGY] == 0) {
            var sources = creep.room.find(FIND_SOURCES);
            if(creep.harvest(sources[0]) == ERR_NOT_IN_RANGE) {
                creep.moveTo(sources[0]);
            }
        }
        // If creep has energy, upgrade the controller
        // 中文: 如果爬虫有能量，升级控制器
        else {
            if(creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
                creep.moveTo(creep.room.controller);
            }
        }
	}
};

module.exports = roleUpgrader;
