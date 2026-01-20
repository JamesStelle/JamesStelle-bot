var roleUpgrader = {
    /** @param {Creep} creep **/
    run: function(creep) {
        // 如果 Creep 没有能量，从 ControllerLink 取能量
        if (creep.store[RESOURCE_ENERGY] === 0) {
            // 找到所有有能量的 Link
            const links = creep.room.find(FIND_STRUCTURES, {
                filter: (s) => s.structureType == STRUCTURE_LINK &&
                               s.store[RESOURCE_ENERGY] > 0
            });

            // 优先选择距离 Controller 最近的 Link（即 ControllerLink）
            let controllerLink = null;
            if (links.length > 0) {
                const controller = creep.room.controller;
                controllerLink = _.min(links, link => link.pos.getRangeTo(controller));
            }

            // 如果有可用的 ControllerLink，取能量
            if (controllerLink) {
                if (creep.withdraw(controllerLink, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(controllerLink);
                    creep.say('🚶 → Link');
                } else {
                    creep.say('🔗 取能量');
                }
            } else {
                creep.say('⏳ 等Link');
            }
        }
        // 如果 Creep 有能量，升级控制器
        else {
            if (creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
                creep.moveTo(creep.room.controller);
                creep.say('🚶 → 控制器');
            } else {
                creep.say('⚡ 升级中');
            }
        }
    }
};

module.exports = roleUpgrader;
