var roleClaimer = {
    /** @param {Creep} creep **/
    run: function(creep) {
        // 记录当前房间信息
        recordRoomInfo(creep.room.name);
        
        // 输出当前房间信息
        console.log(`Claimer ${creep.name} 当前房间: ${creep.room.name}`);
        
        // 如果没有设置目标房间，设置默认目标房间
        if (!creep.memory.targetRoom) {
            creep.memory.targetRoom = 'E49N13';
        }

        // 如果不在目标房间，移动到目标房间
        if (creep.room.name !== creep.memory.targetRoom) {
            this.moveToTargetRoom(creep);
            return;
        }

        // 已经在目标房间，寻找控制器
        const controller = creep.room.controller;
        if (!controller) {
            console.log(`房间 ${creep.room.name} 没有控制器`);
            return;
        }

        // 检查控制器状态
        if (controller.owner && controller.owner.username === creep.owner.username) {
            // 已经是自己的控制器
            creep.say('✅ 已占领');
            console.log(`Claimer ${creep.name} 已成功占领房间 ${creep.room.name}`);
            return;
        }

        // 尝试占领控制器
        if (creep.claimController(controller) === ERR_NOT_IN_RANGE) {
            creep.moveTo(controller, {visualizePathStyle: {stroke: '#ffffff'}});
        }
        creep.say('🏴 占领中');
    },

    // 智能寻路到目标房间
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
    }
};

module.exports = roleClaimer;

// 辅助函数：记录房间信息到内存
function recordRoomInfo(roomName) {
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

module.exports = roleClaimer;