var roleHarvester_1 = {
    /** @param {Creep} creep **/
    run: function(creep) {
        // 获取所有 Harvester 和 Source
        const sources = creep.room.find(FIND_SOURCES);

        // 强制分配 Source[1]
        creep.memory.sourceIndex = 1;
        const assignedSource = sources[1];

        // 如果 Creep 有空余容量，采集能量
        if (creep.store.getFreeCapacity() > 0) {
            // 检查分配的 Source 是否有能量
            if (assignedSource && assignedSource.energy > 0) {
                if (creep.harvest(assignedSource) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(assignedSource, { visualizePathStyle: { stroke: '#ffaa00' } });
                    creep.say('🚶 → 源1');
                } else {
                    creep.say('⛏️ 挖源1');
                }
                // 记录当前采集的 Source（用于后续选择对应的 SourceLink）
                creep.memory.currentSource = assignedSource.id;
            }
            // 如果分配的 Source 能量耗尽，不再切换到其他 Source
            else {
                console.log(`Source ${creep.memory.sourceIndex} 能量耗尽，等待恢复。`);
                creep.say('⏳ 等待源1');
            }
        }
        // 如果 Creep 已满，向对应 Source 的 SourceLink传输能量
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
                    creep.say('🚶 → Link');
                } else {
                    creep.say('🔗 → Link');
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
                        creep.say('🚶 → 存储');
                    } else {
                        const targetType = closestEnergy.structureType === STRUCTURE_STORAGE ? 'Storage' : 'Container';
                        creep.say(`📦 → ${targetType}`);
                    }
                } else {
                    creep.say('💤 无目标');
                }
            }
        }
    }
};

module.exports = roleHarvester_1;
