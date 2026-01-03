module.exports = {
    run: function() {
        // 收集所有房间的终端信息
        const terminals = [];
        for (const roomName in Game.rooms) {
            const terminal = Game.rooms[roomName].find(FIND_STRUCTURES, {
                filter: s => s.structureType === STRUCTURE_TERMINAL
            })[0];
            if (terminal) terminals.push(terminal);
        }

        // 如果没有终端，直接返回
        if (terminals.length === 0) return;

        // 定义需要平衡的资源类型（Energy 和所有 Mineral）
        const resourceTypes = [RESOURCE_ENERGY];
        // 手动列出所有矿物资源类型
        const mineralResources = [
            RESOURCE_KEANIUM,
            RESOURCE_UTRIUM,
            RESOURCE_LEMERGIUM,
            RESOURCE_ZYNTHIUM,
            RESOURCE_OXYGEN,
            RESOURCE_HYDROGEN,
            RESOURCE_CATALYST,
            RESOURCE_GHODIUM
        ];
        resourceTypes.push(...mineralResources);

        // 遍历每种资源类型
        for (const resourceType of resourceTypes) {
            // 计算所有终端中该资源的平均值
            const totalResource = _.sum(terminals, t => t.store[resourceType] || 0);
            const averageResource = totalResource / terminals.length;

            // 平衡该资源
            for (const terminal of terminals) {
                const currentResource = terminal.store[resourceType] || 0;
                const resourceDifference = currentResource - averageResource;

                // 如果当前终端的资源高于平均值，尝试将多余的资源分配给其他终端
                if (resourceDifference > 0) {
                    const amountToSend = Math.min(
                        resourceDifference,
                        terminal.store[resourceType]
                    );

                    // 查找资源低于平均值的终端
                    const needyTerminals = _.filter(terminals, t => 
                        (t.store[resourceType] || 0) < averageResource && 
                        t.id !== terminal.id
                    );

                    // 分配资源
                    for (const targetTerminal of needyTerminals) {
                        const amount = Math.min(
                            amountToSend,
                            targetTerminal.store.getFreeCapacity(resourceType)
                        );
                        if (amount > 0) {
                            terminal.send(resourceType, amount, targetTerminal.room.name);
                            break; // 每次只分配一次，避免频繁操作
                        }
                    }
                }
            }
        }
    }
};
