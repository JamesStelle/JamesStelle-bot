module.exports = {
    run: function() {
        // 按房间分组处理
        const rooms = _.groupBy(Game.structures, s => s.room.name);
        for (const roomName in rooms) {
            const roomLinks = _.filter(rooms[roomName], s => s.structureType === STRUCTURE_LINK);
            
            // 至少需要 4 个 Link 才启用
            if (roomLinks.length < 4) continue;

            // 分类 Link
            const sourceLinks = _.filter(roomLinks, l => l.pos.findInRange(FIND_SOURCES, 2).length > 0);
            const storageLink = _.find(roomLinks, l => l.pos.findInRange(FIND_STRUCTURES, 2, {
                filter: s => s.structureType === STRUCTURE_STORAGE
            }).length > 0);
            const controllerLink = _.find(roomLinks, l => l.pos.findInRange(FIND_STRUCTURES, 2, {
                filter: s => s.structureType === STRUCTURE_CONTROLLER
            }).length > 0);

            // SourceLink[0] 逻辑：优先 StorageLink，其次 ControllerLink
            if (sourceLinks.length >= 1) {
                if (storageLink && sourceLinks[0].store[RESOURCE_ENERGY] > 0 && storageLink.store.getFreeCapacity(RESOURCE_ENERGY) > 0) {
                    sourceLinks[0].transferEnergy(storageLink);
                }
                else if (controllerLink && sourceLinks[0].store[RESOURCE_ENERGY] > 0 && controllerLink.store.getFreeCapacity(RESOURCE_ENERGY) > 0) {
                    sourceLinks[0].transferEnergy(controllerLink);
                }
            }

            // SourceLink[1] 逻辑：优先 ControllerLink，其次 StorageLink
            if (sourceLinks.length >= 2) {
                if (controllerLink && sourceLinks[1].store[RESOURCE_ENERGY] > 0 && controllerLink.store.getFreeCapacity(RESOURCE_ENERGY) > 0) {
                    sourceLinks[1].transferEnergy(controllerLink);
                }
                else if (storageLink && sourceLinks[1].store[RESOURCE_ENERGY] > 0 && storageLink.store.getFreeCapacity(RESOURCE_ENERGY) > 0) {
                    sourceLinks[1].transferEnergy(storageLink);
                }
            }
        }
    }
};
