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

            // 1. SourceLink[0] → StorageLink 传输
            if (sourceLinks.length >= 1 && storageLink &&
                sourceLinks[0].store[RESOURCE_ENERGY] > 0 &&
                storageLink.store.getFreeCapacity(RESOURCE_ENERGY) > 0) {
                sourceLinks[0].transferEnergy(storageLink);
            }

            // 2. SourceLink[1] → ControllerLink 传输
            if (sourceLinks.length >= 2 && controllerLink &&
                sourceLinks[1].store[RESOURCE_ENERGY] > 0 &&
                controllerLink.store.getFreeCapacity(RESOURCE_ENERGY) > 0) {
                sourceLinks[1].transferEnergy(controllerLink);
            }
        }
    }
};
