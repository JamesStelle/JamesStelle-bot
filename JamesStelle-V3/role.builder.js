var roleBuilder = {
    /** @param {Creep} creep **/
    run: function(creep) {
        // Switch to harvesting if empty while building
        if (creep.memory.building && creep.store[RESOURCE_ENERGY] == 0) {
            creep.memory.building = false;
 creep.say('🔄 harvest');
        }
        // Switch to building if full while harvesting
        if (!creep.memory.building && creep.store.getFreeCapacity() == 0) {
            creep.memory.building = true;
            creep.say('🚧 build');
        }

        // Building logic
        if (creep.memory.building) {
            var targets = creep.room.find(FIND_CONSTRUCTION_SITES);
            if (targets.length) {
                if (creep.build(targets[0]) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(targets[0], { visualizePathStyle: { stroke: '#ffffff' } });
                }
            }
        }
        // Harvesting logic (from StorageLink, Container, Storage, or Extension)
        else {
            /*
            // Priority 1: StorageLink (Link closest to Storage)
            const links = creep.room.find(FIND_STRUCTURES, {
                filter: (s) => s.structureType == STRUCTURE_LINK
            });
            let storageLink = null;
            if (links.length > 0 && creep.room.storage) {
                storageLink = _.min(links, link => link.pos.getRangeTo(creep.room.storage));
            }
            */
            // Priority 2: Containers, Storage, or Extensions with energy
            const energySources = creep.room.find(FIND_STRUCTURES, {
                filter: (s) => (s.structureType == STRUCTURE_CONTAINER ||
                               s.structureType == STRUCTURE_STORAGE) &&
                               s.store.getUsedCapacity(RESOURCE_ENERGY) > 0
            });
            /*
            // Try StorageLink first
            if (storageLink) {
                if (creep.withdraw(storageLink, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(storageLink, { visualizePathStyle: { stroke: '#ffaa00' } });
                }
            }
            */
            // Fallback to other energy sources
            if (energySources.length > 0) {
                const closestSource = creep.pos.findClosestByPath(energySources);
                if (creep.withdraw(closestSource, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(closestSource, { visualizePathStyle: { stroke: '#ffaa00' } });
                }
            }
            // Fallback to harvesting from sources if no structures have energy
            else {
                var sources = creep.room.find(FIND_SOURCES);
                if (creep.harvest(sources[0]) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(sources[0], { visualizePathStyle: { stroke: '#ffaa00' } });
                }
            }
        }
    }
};

module.exports = roleBuilder;
