module.exports = {
    run: function() {
        // 遍历所有房间
        for (const roomName in Game.rooms) {
            const room = Game.rooms[roomName];
            
            // 只处理自己的房间
            if (!room.controller || !room.controller.my) {
                continue;
            }
            
            this.runRoomFactory(room);
        }
    },

    runRoomFactory: function(room) {
        // 获取房间内的工厂
        const factory = room.find(FIND_STRUCTURES, {
            filter: s => s.structureType === STRUCTURE_FACTORY
        })[0];

        if (!factory) {
            return; // 没有工厂
        }

        // 获取工厂配置
        if (!Memory.rooms[room.name]) {
            Memory.rooms[room.name] = {};
        }
        
        if (!Memory.rooms[room.name].factoryConfig) {
            this.initializeFactoryConfig(room, factory);
        }

        const factoryConfig = Memory.rooms[room.name].factoryConfig;
        
        // 执行当前生产任务
        if (factoryConfig.currentProduction) {
            this.executeProduction(room, factory, factoryConfig);
        } else {
            // 选择下一个生产任务
            this.selectNextProduction(room, factory, factoryConfig);
        }

        // 定期清理产物
        if (Game.time % 10 === 0) {
            this.collectProducts(room, factory);
        }
    },

    initializeFactoryConfig: function(room, factory) {
        // 初始化工厂配置
        const config = {
            currentProduction: null,
            productionQueue: [],
            lastProductionTime: 0,
            level: factory.level || 0
        };

        // 根据工厂等级设置默认生产队列
        if (factory.level === 0) {
            // 0级工厂：基础商品
            config.productionQueue = [
                { product: RESOURCE_UTRIUM_BAR, amount: 100 },
                { product: RESOURCE_LEMERGIUM_BAR, amount: 100 },
                { product: RESOURCE_ZYNTHIUM_BAR, amount: 100 },
                { product: RESOURCE_KEANIUM_BAR, amount: 100 },
                { product: RESOURCE_GHODIUM_MELT, amount: 50 },
                { product: RESOURCE_OXIDANT, amount: 100 },
                { product: RESOURCE_REDUCTANT, amount: 100 },
                { product: RESOURCE_PURIFIER, amount: 100 }
            ];
        } else {
            // 高级工厂：高级商品
            config.productionQueue = [
                { product: RESOURCE_BATTERY, amount: 50 },
                { product: RESOURCE_COMPOSITE, amount: 20 },
                { product: RESOURCE_CRYSTAL, amount: 20 },
                { product: RESOURCE_LIQUID, amount: 20 }
            ];
        }

        Memory.rooms[room.name].factoryConfig = config;
        console.log(`🏭 房间 ${room.name} 工厂配置已初始化 (等级 ${factory.level})`);
    },

    selectNextProduction: function(room, factory, factoryConfig) {
        // 检查是否有待处理的生产任务
        if (factoryConfig.productionQueue.length === 0) {
            return;
        }

        // 获取下一个生产任务
        const nextProduction = factoryConfig.productionQueue[0];
        
        // 检查是否有足够的原料
        if (this.checkIngredients(room, factory, nextProduction.product)) {
            factoryConfig.currentProduction = nextProduction;
            factoryConfig.currentProduction.remainingAmount = nextProduction.amount;
            console.log(`🏭 房间 ${room.name} 开始生产: ${nextProduction.product} (${nextProduction.amount})`);
        } else {
            console.log(`⚠️ 房间 ${room.name} 原料不足，无法生产: ${nextProduction.product}`);
        }
    },

    executeProduction: function(room, factory, factoryConfig) {
        const production = factoryConfig.currentProduction;
        
        // 检查工厂冷却
        if (factory.cooldown > 0) {
            return;
        }

        // 检查工厂是否有空间
        if (factory.store.getFreeCapacity() < 50) {
            console.log(`⚠️ 房间 ${room.name} 工厂存储空间不足`);
            return;
        }

        // 执行生产
        const result = factory.produce(production.product);
        
        if (result === OK) {
            production.remainingAmount -= this.getProductionAmount(production.product);
            console.log(`🏭 房间 ${room.name} 生产成功: ${production.product}, 剩余: ${production.remainingAmount}`);
            
            // 检查生产是否完成
            if (production.remainingAmount <= 0) {
                console.log(`✅ 房间 ${room.name} 生产完成: ${production.product}`);
                
                // 移除已完成的生产任务
                factoryConfig.productionQueue.shift();
                factoryConfig.currentProduction = null;
            }
        } else {
            console.log(`❌ 房间 ${room.name} 生产失败: ${production.product}, 错误: ${result}`);
            
            // 如果是原料不足，记录需求
            if (result === ERR_NOT_ENOUGH_RESOURCES) {
                this.recordIngredientNeeds(room, production.product);
            }
        }
    },

    checkIngredients: function(room, factory, product) {
        // 获取生产配方
        const recipe = this.getRecipe(product);
        if (!recipe) return false;

        const terminal = room.terminal;
        const storage = room.storage;

        // 检查每种原料
        for (const ingredient in recipe) {
            const required = recipe[ingredient];
            let available = factory.store[ingredient] || 0;
            
            if (terminal) available += terminal.store[ingredient] || 0;
            if (storage) available += storage.store[ingredient] || 0;
            
            if (available < required) {
                return false;
            }
        }
        
        return true;
    },

    recordIngredientNeeds: function(room, product) {
        // 记录原料需求到房间内存
        if (!room.memory.factorySupplyNeeds) {
            room.memory.factorySupplyNeeds = [];
        }

        const recipe = this.getRecipe(product);
        if (!recipe) return;

        for (const ingredient in recipe) {
            const required = recipe[ingredient];
            const available = room.factory?.store[ingredient] || 0;
            
            if (available < required) {
                room.memory.factorySupplyNeeds.push({
                    factoryId: room.factory.id,
                    resourceType: ingredient,
                    amount: required - available,
                    from: 'terminal'
                });
            }
        }
    },

    collectProducts: function(room, factory) {
        const terminal = room.terminal;
        const storage = room.storage;

        // 收集所有产品到Terminal或Storage
        for (const resourceType in factory.store) {
            if (resourceType === RESOURCE_ENERGY) continue;
            
            const amount = factory.store[resourceType];
            if (amount > 0) {
                // 记录收集需求
                if (!room.memory.factoryCollectNeeds) {
                    room.memory.factoryCollectNeeds = [];
                }
                
                room.memory.factoryCollectNeeds.push({
                    factoryId: factory.id,
                    resourceType: resourceType,
                    amount: amount,
                    to: terminal ? 'terminal' : 'storage'
                });
            }
        }
    },

    getRecipe: function(product) {
        // 生产配方数据库
        const recipes = {
            // 0级工厂产品
            [RESOURCE_UTRIUM_BAR]: { [RESOURCE_UTRIUM]: 500, [RESOURCE_ENERGY]: 200 },
            [RESOURCE_LEMERGIUM_BAR]: { [RESOURCE_LEMERGIUM]: 500, [RESOURCE_ENERGY]: 200 },
            [RESOURCE_ZYNTHIUM_BAR]: { [RESOURCE_ZYNTHIUM]: 500, [RESOURCE_ENERGY]: 200 },
            [RESOURCE_KEANIUM_BAR]: { [RESOURCE_KEANIUM]: 500, [RESOURCE_ENERGY]: 200 },
            [RESOURCE_GHODIUM_MELT]: { [RESOURCE_GHODIUM]: 500, [RESOURCE_ENERGY]: 200 },
            [RESOURCE_OXIDANT]: { [RESOURCE_OXYGEN]: 500, [RESOURCE_HYDROGEN]: 500, [RESOURCE_ENERGY]: 200 },
            [RESOURCE_REDUCTANT]: { [RESOURCE_HYDROGEN]: 500, [RESOURCE_OXYGEN]: 500, [RESOURCE_ENERGY]: 200 },
            [RESOURCE_PURIFIER]: { [RESOURCE_CATALYST]: 500, [RESOURCE_ENERGY]: 200 },

            // 1级工厂产品（示例）
            [RESOURCE_BATTERY]: { 
                [RESOURCE_KEANIUM_BAR]: 50, 
                [RESOURCE_OXIDANT]: 50, 
                [RESOURCE_ENERGY]: 200 
            },
            [RESOURCE_COMPOSITE]: { 
                [RESOURCE_UTRIUM_BAR]: 50, 
                [RESOURCE_ZYNTHIUM_BAR]: 50, 
                [RESOURCE_ENERGY]: 200 
            }
        };

        return recipes[product] || null;
    },

    getProductionAmount: function(product) {
        // 每次生产的数量
        const amounts = {
            [RESOURCE_UTRIUM_BAR]: 50,
            [RESOURCE_LEMERGIUM_BAR]: 50,
            [RESOURCE_ZYNTHIUM_BAR]: 50,
            [RESOURCE_KEANIUM_BAR]: 50,
            [RESOURCE_GHODIUM_MELT]: 50,
            [RESOURCE_OXIDANT]: 50,
            [RESOURCE_REDUCTANT]: 50,
            [RESOURCE_PURIFIER]: 50,
            [RESOURCE_BATTERY]: 10,
            [RESOURCE_COMPOSITE]: 10
        };

        return amounts[product] || 10;
    },

    // 添加新生产任务到队列
    addProduction: function(roomName, product, amount) {
        if (!Memory.rooms[roomName] || !Memory.rooms[roomName].factoryConfig) {
            console.log(`❌ 房间 ${roomName} 工厂未初始化`);
            return;
        }

        const production = { product, amount };
        Memory.rooms[roomName].factoryConfig.productionQueue.push(production);
        console.log(`✅ 已添加生产任务到队列: ${product} (${amount})`);
    },

    // 清空生产队列
    clearQueue: function(roomName) {
        if (Memory.rooms[roomName] && Memory.rooms[roomName].factoryConfig) {
            Memory.rooms[roomName].factoryConfig.productionQueue = [];
            Memory.rooms[roomName].factoryConfig.currentProduction = null;
            console.log(`🗑️ 房间 ${roomName} 生产队列已清空`);
        }
    },

    // 获取工厂状态
    getStatus: function(roomName) {
        const room = Game.rooms[roomName];
        if (!room || !Memory.rooms[roomName] || !Memory.rooms[roomName].factoryConfig) {
            return null;
        }

        const factory = room.find(FIND_STRUCTURES, {
            filter: s => s.structureType === STRUCTURE_FACTORY
        })[0];

        if (!factory) return null;

        const config = Memory.rooms[roomName].factoryConfig;
        
        return {
            level: factory.level,
            cooldown: factory.cooldown,
            currentProduction: config.currentProduction,
            queueLength: config.productionQueue.length,
            nextProductions: config.productionQueue.slice(0, 3),
            storage: Object.keys(factory.store).reduce((acc, resource) => {
                if (factory.store[resource] > 0) {
                    acc[resource] = factory.store[resource];
                }
                return acc;
            }, {})
        };
    }
};