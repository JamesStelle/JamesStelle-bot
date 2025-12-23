const BasicRoom = require('./BasicRoom');
const PremiumRoom = require('./PremiumRoom');

module.exports = {
    // 定义要遍历的固定房间列表
    My_Rooms: [
        'E39N8',
        'E45N9',
        'E51N15',
    ],

    run: function() {
        for (const roomName of this.My_Rooms) {
            const room = Game.rooms[roomName];
            if (room) {
                // 调用房间管理模块
                this.manageRoom(room);
            } else {
                console.log(`Room ${roomName} is not visible.`);
            }
        }
    },

    manageRoom: function(room) {
        // 房间管理逻辑
        this.manageSpawns(room);
    },

    manageSpawns: function(room) {
        const spawns = room.find(FIND_MY_SPAWNS);
        if (spawns.length > 0) {
            // 添加 spawn 管理逻辑
            //根据房间等级调整spawn行为
            for (const spawn of spawns) {
                if (room.controller.level <= 6) {
                    // 基础房间逻辑
                    BasicRoom.manage(room);
                } else {
                    // 高级房间逻辑
                    PremiumRoom.manage(room);
                }
            }
        } else {
            console.log(`Room ${room.name} has no spawns.`);
        }
    }
};
