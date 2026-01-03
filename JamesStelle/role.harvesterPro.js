var roleHarvesterPro = {
    /** @param {Creep} creep **/
    run: function(creep) {
        // 如果 Creep 有空余容量，采集矿物
        if (creep.store.getFreeCapacity() > 0) {
            // 找到房间内的矿物
            const minerals = creep.room.find(FIND_MINERALS);
            
            if (minerals.length > 0) {
                const mineral = minerals[0];
                // 检查是否有 Extractor
                const extractor = creep.pos.findClosestByRange(FIND_STRUCTURES, {
                    filter: s => s.structureType === STRUCTURE_EXTRACTOR && s.pos.isNearTo(mineral)
                });
                if (extractor) {
                    if (creep.harvest(mineral) === ERR_NOT_IN_RANGE) {
                        creep.moveTo(mineral, { visualizePathStyle: { stroke: '#ff00ff' } });
                    }
                }
            }
            else{
                //
            }
        }
        // 如果 Creep 已满，将矿物存放到 Storage
        else {
            const storage = creep.room.storage;
            if (storage) {
                const mineralType = Object.keys(creep.store)[0]; // 获取矿物类型
                if (creep.transfer(storage, mineralType) === ERR_NOT_IN_RANGE) {
                    creep.moveTo(storage, { visualizePathStyle: { stroke: '#ffffff' } });
                }
            }
        }
    }
};

module.exports = roleHarvesterPro;
