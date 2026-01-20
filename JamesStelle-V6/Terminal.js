module.exports = {
    run: function() {
        // 收集所有房间的终端信息
        const terminals = [];
        for (const roomName in Game.rooms) {
            const room = Game.rooms[roomName];
            if (room.controller && room.controller.my) {  // 只处理自己的房间
                const terminal = room.terminal;
                if (terminal && terminal.my) {
                    terminals.push(terminal);
                }
            }
        }

        // 如果终端数量少于2个，无需平衡
        if (terminals.length < 2) {
            return;
        }

        // 定义需要平衡的资源类型
        const resourceTypes = [
            RESOURCE_ENERGY,
            // 基础矿物
            RESOURCE_HYDROGEN,
            RESOURCE_OXYGEN,
            RESOURCE_UTRIUM,
            RESOURCE_KEANIUM,
            RESOURCE_LEMERGIUM,
            RESOURCE_ZYNTHIUM,
            RESOURCE_CATALYST,
            // 高级矿物
            RESOURCE_GHODIUM,
            // 化合物（可选，根据需要添加）
            RESOURCE_HYDROXIDE,
            RESOURCE_ZYNTHIUM_KEANITE,
            RESOURCE_UTRIUM_LEMERGITE,
            RESOURCE_GHODIUM_OXIDE
        ];

        // 每tick只处理一种资源，避免CPU过载
        if (!Memory.terminalBalancer) {
            Memory.terminalBalancer = { currentResourceIndex: 0 };
        }

        const currentResourceType = resourceTypes[Memory.terminalBalancer.currentResourceIndex];
        if (!currentResourceType) {
            Memory.terminalBalancer.currentResourceIndex = 0;
            return;
        }

        // 移动到下一个资源类型
        Memory.terminalBalancer.currentResourceIndex = 
            (Memory.terminalBalancer.currentResourceIndex + 1) % resourceTypes.length;

        this.balanceResource(terminals, currentResourceType);
    },

    balanceResource: function(terminals, resourceType) {
        // 计算总资源和平均值
        const totalResource = _.sum(terminals, t => t.store[resourceType] || 0);
        const averageResource = Math.floor(totalResource / terminals.length);

        // 如果平均值太小，跳过
        if (averageResource < 100) {
            return;
        }

        console.log(`🔄 平衡资源 ${resourceType}，平均值: ${averageResource}`);

        // 找到资源过多和过少的终端
        const richTerminals = [];
        const poorTerminals = [];

        terminals.forEach(terminal => {
            const currentAmount = terminal.store[resourceType] || 0;
            const difference = currentAmount - averageResource;

            if (difference > 500) {  // 阈值：超过平均值500才转移
                richTerminals.push({
                    terminal: terminal,
                    excess: difference
                });
            } else if (difference < -500) {  // 阈值：低于平均值500才接收
                poorTerminals.push({
                    terminal: terminal,
                    deficit: Math.abs(difference)
                });
            }
        });

        // 执行资源转移
        for (const rich of richTerminals) {
            if (poorTerminals.length === 0) break;

            const poor = poorTerminals[0];  // 选择第一个需要资源的终端
            
            // 计算转移数量
            const transferAmount = Math.min(
                rich.excess,
                poor.deficit,
                rich.terminal.store[resourceType],
                poor.terminal.store.getFreeCapacity()
            );

            // 确保转移数量合理
            if (transferAmount >= 100) {  // 最小转移量
                const result = rich.terminal.send(
                    resourceType, 
                    transferAmount, 
                    poor.terminal.room.name
                );

                if (result === OK) {
                    console.log(`✅ 转移成功: ${rich.terminal.room.name} → ${poor.terminal.room.name} (${transferAmount} ${resourceType})`);
                    
                    // 更新数量
                    rich.excess -= transferAmount;
                    poor.deficit -= transferAmount;
                    
                    // 如果目标终端已满足，移除
                    if (poor.deficit <= 0) {
                        poorTerminals.shift();
                    }
                } else {
                    console.log(`❌ 转移失败: ${rich.terminal.room.name} → ${poor.terminal.room.name} (错误: ${result})`);
                }
                
                // 每tick只执行一次转移，避免CPU过载
                break;
            }
        }
    },

    // 获取所有房间资源统计（可选调用）
    getResourceStats: function() {
        const stats = {};
        for (const roomName in Game.rooms) {
            const room = Game.rooms[roomName];
            if (room.controller && room.controller.my && room.terminal) {
                stats[roomName] = {};
                for (const resourceType in room.terminal.store) {
                    stats[roomName][resourceType] = room.terminal.store[resourceType];
                }
            }
        }
        return stats;
    }
};
