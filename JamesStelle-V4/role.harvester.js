var roleHarvester = {
    /** @param {Creep} creep **/
    run: function(creep) {
        // 初始化或修复 creep.memory.sourceIndex（确保每个 Harvester 固定一个 Source）
        if (creep.memory.sourceIndex === undefined) {
            // 为新 Creep 分配 Source：0 或 1
            creep.memory.sourceIndex = _.random(0, 1);
            console.log(`Assigned Harvester ${creep.name} to Source ${creep.memory.sourceIndex}`);
        }

        // 获取所有 Source
        const sources = creep.room.find(FIND_SOURCES);
        // 获取当前分配的 Source
        const assignedSource = sources[creep.memory.sourceIndex];

        // 如果 Creep 有空余容量，采集能量
        if (creep.store.getFreeCapacity() > 0) {
            // 检查分配的 Source 是否有能量
            if (assignedSource && assignedSource.energy > 0) {
                if (creep.harvest(assignedSource) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(assignedSource, { visualizePathStyle: { stroke: '#ffaa00' } });
                }
                // 记录当前采集的 Source（用于后续选择对应的 SourceLink）
                creep.memory.currentSource = assignedSource.id;
            }
            // 如果分配的 Source 能量耗尽，暂时切换到另一个 Source
            else if (sources.length > 1) {
                const fallbackSource = sources[1 - creep.memory.sourceIndex]; // 切换到另一个 Source
                if (fallbackSource.energy > 0) {
                    if (creep.harvest(fallbackSource) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(fallbackSource, { visualizePathStyle: { stroke: '#ffaa00' } });
                    }
                    // 临时记录 fallbackSource（不影响固定分配）
                    creep.memory.currentSource = fallbackSource.id;
                }
            }
        }
        // 如果 Creep 已满，向对应 Source 的 SourceLink 传输能量
        else {
            // 获取当前采集的 Source ID
            const currentSourceId = creep.memory.currentSource;
            const currentSource = Game.getObjectById(currentSourceId);

            // 找到所有可用的 Link
            const links = creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return structure.structureType == STRUCTURE_LINK &&
                           structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
                }
            });

            // 如果有当前采集的 Source，优先选择距离它最近的 Link
            let sourceLink = null;
            if (links.length > 0 && currentSource) {
                sourceLink = _.min(links, link => link.pos.getRangeTo(currentSource));
            }

            // 如果有可用的 SourceLink，传输能量
            if (sourceLink) {
                if (creep.transfer(sourceLink, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(sourceLink, { visualizePathStyle: { stroke: '#ffffff' } });
                }
            }
            // 如果没有可用的 SourceLink，尝试将能量存放到 Storage 或 Container
            else {
                const energyStructures = creep.room.find(FIND_STRUCTURES, {
                    filter: (s) => (s.structureType == STRUCTURE_STORAGE ||
                                   s.structureType == STRUCTURE_CONTAINER) &&
                                   s.store.getFreeCapacity(RESOURCE_ENERGY) > 0
                });
                if (energyStructures.length > 0) {
                    const closestEnergy = creep.pos.findClosestByPath(energyStructures);
                    if (creep.transfer(closestEnergy, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(closestEnergy, { visualizePathStyle: { stroke: '#ffffff' } });
                    }
                }
            }
        }
    }
};

module.exports = roleHarvester;
