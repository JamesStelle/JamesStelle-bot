module.exports = {
    run: function() {
        // 遍历所有房间
        for (const roomName in Game.rooms) {
            const room = Game.rooms[roomName];
            
            // 只处理自己的房间
            if (!room.controller || !room.controller.my) {
                continue;
            }
            
            this.runRoomLabs(room);
        }
    },

    runRoomLabs: function(room) {
        // 获取房间内所有实验室
        const labs = room.find(FIND_STRUCTURES, {
            filter: s => s.structureType === STRUCTURE_LAB
        });

        if (labs.length < 3) {
            return; // 至少需要3个实验室才能进行反应
        }

        // 获取房间的实验室配置
        if (!Memory.rooms[room.name]) {
            Memory.rooms[room.name] = {};
        }
        
        if (!Memory.rooms[room.name].labConfig) {
            this.initializeLabConfig(room, labs);
        }

        const labConfig = Memory.rooms[room.name].labConfig;
        
        // 执行当前反应
        if (labConfig.currentReaction) {
            this.executeReaction(room, labs, labConfig);
        } else {
            // 选择下一个反应
            this.selectNextReaction(room, labConfig);
        }
    },

    initializeLabConfig: function(room, labs) {
        // 初始化实验室配置
        const config = {
            inputLabs: labs.slice(0, 2).map(lab => lab.id), // 前两个作为输入实验室
            outputLabs: labs.slice(2).map(lab => lab.id),   // 其余作为输出实验室
            currentReaction: null,
            reactionQueue: [],
            lastReactionTime: 0
        };

        // 设置默认反应队列（可根据需要修改）
        config.reactionQueue = [
            // 基础化合物
            { input1: RESOURCE_HYDROGEN, input2: RESOURCE_OXYGEN, output: RESOURCE_HYDROXIDE, amount: 1000 },
            { input1: RESOURCE_ZYNTHIUM, input2: RESOURCE_KEANIUM, output: RESOURCE_ZYNTHIUM_KEANITE, amount: 1000 },
            { input1: RESOURCE_UTRIUM, input2: RESOURCE_LEMERGIUM, output: RESOURCE_UTRIUM_LEMERGITE, amount: 1000 },
            
            // 高级化合物
            { input1: RESOURCE_UTRIUM_LEMERGITE, input2: RESOURCE_HYDROXIDE, output: RESOURCE_UTRIUM_HYDRIDE, amount: 500 },
            { input1: RESOURCE_ZYNTHIUM_KEANITE, input2: RESOURCE_HYDROXIDE, output: RESOURCE_ZYNTHIUM_HYDRIDE, amount: 500 },
            
            // Ghodium化合物
            { input1: RESOURCE_ZYNTHIUM_HYDRIDE, input2: RESOURCE_UTRIUM_HYDRIDE, output: RESOURCE_GHODIUM_HYDRIDE, amount: 200 },
        ];

        Memory.rooms[room.name].labConfig = config;
        console.log(`🧪 房间 ${room.name} 实验室配置已初始化`);
    },

    selectNextReaction: function(room, labConfig) {
        // 检查是否有待处理的反应
        if (labConfig.reactionQueue.length === 0) {
            return;
        }

        // 获取下一个反应
        const nextReaction = labConfig.reactionQueue[0];
        
        // 检查是否有足够的原料
        const terminal = room.terminal;
        const storage = room.storage;
        
        let input1Available = 0;
        let input2Available = 0;
        
        if (terminal) {
            input1Available += terminal.store[nextReaction.input1] || 0;
            input2Available += terminal.store[nextReaction.input2] || 0;
        }
        
        if (storage) {
            input1Available += storage.store[nextReaction.input1] || 0;
            input2Available += storage.store[nextReaction.input2] || 0;
        }

        // 检查是否有足够原料
        const requiredAmount = Math.min(nextReaction.amount, 3000); // 单次最大3000
        if (input1Available >= requiredAmount && input2Available >= requiredAmount) {
            labConfig.currentReaction = nextReaction;
            labConfig.currentReaction.remainingAmount = requiredAmount;
            console.log(`🧪 房间 ${room.name} 开始反应: ${nextReaction.input1} + ${nextReaction.input2} → ${nextReaction.output}`);
        } else {
            console.log(`⚠️ 房间 ${room.name} 原料不足: 需要 ${requiredAmount} ${nextReaction.input1} 和 ${nextReaction.input2}`);
        }
    },

    executeReaction: function(room, labs, labConfig) {
        const reaction = labConfig.currentReaction;
        const inputLab1 = Game.getObjectById(labConfig.inputLabs[0]);
        const inputLab2 = Game.getObjectById(labConfig.inputLabs[1]);
        const outputLabs = labConfig.outputLabs.map(id => Game.getObjectById(id));

        // 确保输入实验室有原料
        this.supplyInputLabs(room, inputLab1, inputLab2, reaction);

        // 执行反应
        let reactionExecuted = false;
        for (const outputLab of outputLabs) {
            if (!outputLab || outputLab.cooldown > 0) continue;
            
            // 检查输出实验室是否有空间
            if (outputLab.store.getFreeCapacity(reaction.output) < 5) {
                continue;
            }

            // 执行反应
            const result = outputLab.runReaction(inputLab1, inputLab2);
            if (result === OK) {
                reactionExecuted = true;
                reaction.remainingAmount -= 5; // 每次反应产生5单位
                console.log(`⚗️ 房间 ${room.name} 反应成功，剩余: ${reaction.remainingAmount}`);
                break;
            } else if (result === ERR_NOT_ENOUGH_RESOURCES) {
                console.log(`⚠️ 房间 ${room.name} 输入实验室原料不足`);
            }
        }

        // 检查反应是否完成
        if (reaction.remainingAmount <= 0) {
            console.log(`✅ 房间 ${room.name} 反应完成: ${reaction.output}`);
            
            // 移除已完成的反应
            labConfig.reactionQueue.shift();
            labConfig.currentReaction = null;
            
            // 收集产物到存储
            this.collectProducts(room, outputLabs);
        }

        // 定期收集产物
        if (Game.time % 10 === 0) {
            this.collectProducts(room, outputLabs);
        }
    },

    supplyInputLabs: function(room, inputLab1, inputLab2, reaction) {
        if (!inputLab1 || !inputLab2) return;

        const terminal = room.terminal;
        const storage = room.storage;

        // 为输入实验室1补充原料
        if (inputLab1.store[reaction.input1] < 1000) {
            const needed = 2000 - inputLab1.store[reaction.input1];
            
            if (terminal && terminal.store[reaction.input1] >= needed) {
                // 这里需要carrier来搬运，暂时记录需求
                if (!room.memory.labSupplyNeeds) room.memory.labSupplyNeeds = [];
                room.memory.labSupplyNeeds.push({
                    labId: inputLab1.id,
                    resourceType: reaction.input1,
                    amount: needed,
                    from: 'terminal'
                });
            } else if (storage && storage.store[reaction.input1] >= needed) {
                if (!room.memory.labSupplyNeeds) room.memory.labSupplyNeeds = [];
                room.memory.labSupplyNeeds.push({
                    labId: inputLab1.id,
                    resourceType: reaction.input1,
                    amount: needed,
                    from: 'storage'
                });
            }
        }

        // 为输入实验室2补充原料
        if (inputLab2.store[reaction.input2] < 1000) {
            const needed = 2000 - inputLab2.store[reaction.input2];
            
            if (terminal && terminal.store[reaction.input2] >= needed) {
                if (!room.memory.labSupplyNeeds) room.memory.labSupplyNeeds = [];
                room.memory.labSupplyNeeds.push({
                    labId: inputLab2.id,
                    resourceType: reaction.input2,
                    amount: needed,
                    from: 'terminal'
                });
            } else if (storage && storage.store[reaction.input2] >= needed) {
                if (!room.memory.labSupplyNeeds) room.memory.labSupplyNeeds = [];
                room.memory.labSupplyNeeds.push({
                    labId: inputLab2.id,
                    resourceType: reaction.input2,
                    amount: needed,
                    from: 'storage'
                });
            }
        }
    },

    collectProducts: function(room, outputLabs) {
        const terminal = room.terminal;
        const storage = room.storage;

        for (const lab of outputLabs) {
            if (!lab) continue;

            // 收集所有非能量资源
            for (const resourceType in lab.store) {
                if (resourceType === RESOURCE_ENERGY) continue;
                
                const amount = lab.store[resourceType];
                if (amount > 0) {
                    // 记录收集需求
                    if (!room.memory.labCollectNeeds) room.memory.labCollectNeeds = [];
                    room.memory.labCollectNeeds.push({
                        labId: lab.id,
                        resourceType: resourceType,
                        amount: amount,
                        to: terminal ? 'terminal' : 'storage'
                    });
                }
            }
        }
    },

    // 添加新反应到队列
    addReaction: function(roomName, input1, input2, output, amount) {
        if (!Memory.rooms[roomName] || !Memory.rooms[roomName].labConfig) {
            console.log(`❌ 房间 ${roomName} 实验室未初始化`);
            return;
        }

        const reaction = { input1, input2, output, amount };
        Memory.rooms[roomName].labConfig.reactionQueue.push(reaction);
        console.log(`✅ 已添加反应到队列: ${input1} + ${input2} → ${output} (${amount})`);
    },

    // 清空反应队列
    clearQueue: function(roomName) {
        if (Memory.rooms[roomName] && Memory.rooms[roomName].labConfig) {
            Memory.rooms[roomName].labConfig.reactionQueue = [];
            Memory.rooms[roomName].labConfig.currentReaction = null;
            console.log(`🗑️ 房间 ${roomName} 反应队列已清空`);
        }
    },

    // 获取实验室状态
    getStatus: function(roomName) {
        const room = Game.rooms[roomName];
        if (!room || !Memory.rooms[roomName] || !Memory.rooms[roomName].labConfig) {
            return null;
        }

        const config = Memory.rooms[roomName].labConfig;
        const labs = room.find(FIND_STRUCTURES, {
            filter: s => s.structureType === STRUCTURE_LAB
        });

        return {
            totalLabs: labs.length,
            currentReaction: config.currentReaction,
            queueLength: config.reactionQueue.length,
            nextReactions: config.reactionQueue.slice(0, 3)
        };
    }
};