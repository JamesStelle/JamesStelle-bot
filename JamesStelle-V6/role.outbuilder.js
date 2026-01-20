var roleOutbuilder = {
    /** @param {Creep} creep **/
    run: function(creep) {
        // 记录当前房间信息
        this.recordRoomInfo(creep.room.name);
        
        // 输出当前房间信息
        console.log(`Outbuilder ${creep.name} 当前房间: ${creep.room.name}`);
        
        // 如果没有设置目标房间，设置默认目标房间
        if (!creep.memory.targetRoom) {
            creep.memory.targetRoom = 'E49N13';
        }

        // 如果不在目标房间，移动到目标房间
        if (creep.room.name !== creep.memory.targetRoom) {
            this.moveToTargetRoom(creep);
            return;
        }

        // 已经在目标房间，执行建造工作
        this.doBuilderWork(creep);
    },

    // 智能寻路到目标房间（来自claimer）
    moveToTargetRoom: function(creep) {
        const targetRoom = creep.memory.targetRoom;
        
        // 检查是否有缓存的路径且仍然有效
        if (creep.memory.route && creep.memory.routeIndex !== undefined) {
            const currentRouteStep = creep.memory.route[creep.memory.routeIndex];
            
            // 如果已经到达当前路径步骤的房间，移动到下一步
            if (currentRouteStep && creep.room.name === currentRouteStep.room) {
                creep.memory.routeIndex++;
                
                // 如果路径完成，清除缓存
                if (creep.memory.routeIndex >= creep.memory.route.length) {
                    delete creep.memory.route;
                    delete creep.memory.routeIndex;
                    return;
                }
            }
        }
        
        // 如果没有缓存路径或路径无效，重新计算
        if (!creep.memory.route || creep.memory.routeIndex === undefined) {
            const route = Game.map.findRoute(creep.room.name, targetRoom, {
                routeCallback: function(roomName, fromRoomName) {
                    // 检查房间状态
                    const roomStatus = Game.map.getRoomStatus(roomName);
                    
                    // 如果房间关闭，跳过
                    if (roomStatus && roomStatus.status === 'closed') {
                        return Infinity;
                    }
                    
                    // 尝试从内存获取房间控制器信息
                    if (Memory.rooms && Memory.rooms[roomName]) {
                        const roomMemory = Memory.rooms[roomName];
                        
                        // 如果是过道房间（无控制器），优先选择
                        if (roomMemory.isHighway || roomMemory.noController) {
                            return 1;
                        }
                        
                        // 如果控制器未被占领，次优选择
                        if (roomMemory.controllerOwner === undefined) {
                            return 2;
                        }
                        
                        // 如果被敌对玩家占领，避免
                        if (roomMemory.controllerOwner && roomMemory.controllerOwner !== creep.owner.username) {
                            return 10;
                        }
                    }
                    
                    // 检查房间名称判断是否为过道房间
                    const parsed = /^[WE]([0-9]+)[NS]([0-9]+)$/.exec(roomName);
                    if (parsed) {
                        const x = parseInt(parsed[1]);
                        const y = parseInt(parsed[2]);
                        
                        // 过道房间坐标特征：x或y能被10整除
                        if (x % 10 === 0 || y % 10 === 0) {
                            return 1; // 过道房间，优先选择
                        }
                    }
                    
                    // 默认权重
                    return 2.5;
                }
            });

            if (route === ERR_NO_PATH) {
                console.log(`无法找到从 ${creep.room.name} 到 ${targetRoom} 的路径`);
                return;
            }
            
            // 缓存路径
            creep.memory.route = route;
            creep.memory.routeIndex = 0;
        }
        
        // 获取当前应该前往的房间
        const currentStep = creep.memory.route[creep.memory.routeIndex];
        if (!currentStep) {
            // 路径完成，清除缓存
            delete creep.memory.route;
            delete creep.memory.routeIndex;
            return;
        }
        
        const nextRoom = currentStep.room;
        
        // 如果已经在目标房间，移动到下一步
        if (creep.room.name === nextRoom) {
            creep.memory.routeIndex++;
            return;
        }
        
        // 移动到下一个房间的出口
        const exitDir = creep.room.findExitTo(nextRoom);
        if (exitDir === ERR_NO_PATH || exitDir === ERR_INVALID_ARGS) {
            console.log(`无法找到从 ${creep.room.name} 到 ${nextRoom} 的出口`);
            // 清除缓存路径，下次重新计算
            delete creep.memory.route;
            delete creep.memory.routeIndex;
            return;
        }
        
        const exit = creep.pos.findClosestByRange(exitDir);
        if (exit) {
            // 使用更稳定的移动选项
            const moveResult = creep.moveTo(exit, {
                visualizePathStyle: {stroke: '#ffffff'},
                reusePath: 5,  // 减少路径重用时间，避免卡住
                serializeMemory: true,
                maxRooms: 1  // 限制在当前房间内寻路
            });
            
            // 如果移动失败，清除路径缓存
            if (moveResult === ERR_NO_PATH) {
                delete creep.memory.route;
                delete creep.memory.routeIndex;
                delete creep.memory._move;  // 清除移动缓存
            }
            
            creep.say(`🚶 → ${nextRoom}`);
        }
    },

    // 建造工作逻辑（来自builder）
    doBuilderWork: function(creep) {
        // 状态切换逻辑
        if(creep.memory.working && creep.store[RESOURCE_ENERGY] == 0) {
            creep.memory.working = false;
            creep.say('🔄 挖能量');
        }
        if(!creep.memory.working && creep.store.getFreeCapacity() == 0) {
            creep.memory.working = true;
            creep.say('🚧 工作中');
        }

        if(creep.memory.working) {
            // 工作模式：优先建造，其次修复
            this.doWork(creep);
        }
        else {
            // 采集模式：从Source获取能量
            this.harvestEnergy(creep);
        }
    },

    doWork: function(creep) {
        // 优先级1: 建造任务
        const constructionSites = creep.room.find(FIND_CONSTRUCTION_SITES);
        if(constructionSites.length > 0) {
            // 选择最近的建造点
            const target = creep.pos.findClosestByPath(constructionSites);
            if(target) {
                if(creep.build(target) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}});
                }
                creep.say('🚧 建造');
                return;
            }
        }

        // 优先级2: 修复任务（没有建造任务时）
        const damagedStructures = creep.room.find(FIND_STRUCTURES, {
            filter: (structure) => {
                return structure.hits < structure.hitsMax && 
                       structure.structureType != STRUCTURE_WALL &&
                       structure.structureType != STRUCTURE_RAMPART;
            }
        });

        if(damagedStructures.length > 0) {
            // 按损坏程度排序，优先修复损坏严重的
            damagedStructures.sort((a, b) => {
                const damageA = (a.hitsMax - a.hits) / a.hitsMax;
                const damageB = (b.hitsMax - b.hits) / b.hitsMax;
                return damageB - damageA;
            });

            const target = damagedStructures[0];
            if(creep.repair(target) == ERR_NOT_IN_RANGE) {
                creep.moveTo(target, {visualizePathStyle: {stroke: '#00ff00'}});
            }
            creep.say('🔧 修复');
            return;
        }

        // 优先级3: 升级控制器（没有建造和修复任务时）
        const controller = creep.room.controller;
        if(controller) {
            // 检查控制器是否可以升级
            if(controller.my || !controller.owner) {
                if(creep.upgradeController(controller) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(controller, {visualizePathStyle: {stroke: '#0000ff'}});
                }
                creep.say('⚡ 升级');
                return;
            } else {
                // 如果控制器被其他玩家占领，显示信息
                creep.say('❌ 敌控制器');
                return;
            }
        }

        // 没有任务时，待机
        creep.say('💤 待机');
    },

    harvestEnergy: function(creep) {
        // 直接从Source挖取能量
        const sources = creep.room.find(FIND_SOURCES);
        if(sources.length > 0) {
            const target = creep.pos.findClosestByPath(sources);
            if(target) {
                if(creep.harvest(target) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(target, {visualizePathStyle: {stroke: '#ffaa00'}});
                }
                creep.say('⛏️ 挖矿');
            }
        }
    },

    // 记录房间信息到内存（来自claimer）
    recordRoomInfo: function(roomName) {
        if (!Memory.rooms) {
            Memory.rooms = {};
        }
        
        if (!Memory.rooms[roomName]) {
            Memory.rooms[roomName] = {};
        }
        
        const room = Game.rooms[roomName];
        if (room) {
            const controller = room.controller;
            
            if (!controller) {
                Memory.rooms[roomName].noController = true;
            } else {
                Memory.rooms[roomName].noController = false;
                if (controller.owner) {
                    Memory.rooms[roomName].controllerOwner = controller.owner.username;
                } else {
                    Memory.rooms[roomName].controllerOwner = undefined;
                }
            }
            
            // 检查是否为过道房间
            const parsed = /^[WE]([0-9]+)[NS]([0-9]+)$/.exec(roomName);
            if (parsed) {
                const x = parseInt(parsed[1]);
                const y = parseInt(parsed[2]);
                Memory.rooms[roomName].isHighway = (x % 10 === 0 || y % 10 === 0);
            }
        }
    }
};

module.exports = roleOutbuilder;