var roleCarrierT = {
    /** @param {Creep} creep **/
    run: function(creep) {
        // 如果 Creep 存储为空，取能量
        if (creep.store.getUsedCapacity() === 0) {
            const links = creep.room.find(FIND_STRUCTURES, {
                filter: (s) => s.structureType == STRUCTURE_LINK
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
                }
            }
        }
        // 否则（非空），搬运能量
        else {
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
