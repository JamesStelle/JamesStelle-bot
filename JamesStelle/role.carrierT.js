var roleCarrierT = {
    /** @param {Creep} creep **/
    run: function(creep) {
        // 如果 Creep 有空余容量，搬运能量
        if (creep.store.getFreeCapacity() > 0) {
            // 找到所有有能量的 Link
            const links = creep.room.find(FIND_STRUCTURES, {
                filter: (s) => s.structureType == STRUCTURE_LINK 
            });

            // 优先选择距离 Storage 最近的 Link（即 StorageLink）
            let storageLink = null;
            if (links.length > 0) {
                const storage = creep.room.storage;
                if (storage) {
                    storageLink = _.min(links, link => link.pos.getRangeTo(storage));
                }
            }

            // 如果有可用的 StorageLink，取能量
            if (storageLink) {
                if (creep.withdraw(storageLink, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(storageLink);
                }
                return;
            }
        }
        // 如果 Creep 已满，向 Extension/Spawn/Tower 传输能量
        else {
            // 查找最近的需能建筑
            const target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                filter: (s) => (s.structureType == STRUCTURE_TOWER ||
                               s.structureType == STRUCTURE_LAB) &&
                               s.store.getFreeCapacity(RESOURCE_ENERGY) > 0
            });

            if (target) {
                if (creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(target);
                }
            }
        }
    }
};

module.exports = roleCarrierT;
