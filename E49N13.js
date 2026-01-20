module.exports = {
    run: function() {
        // Define the target room (E39N8)
        const targetRoom = 'E49N13';

        // Count creeps by role (only in E49N13)
        const creepCount = {
            harvester: _.filter(Game.creeps, c => c.memory.role === 'harvester' && c.room.name === targetRoom).length,
            harvester_0: _.filter(Game.creeps, c => c.memory.role === 'harvester_0' && c.room.name === targetRoom).length,
            harvester_1: _.filter(Game.creeps, c => c.memory.role === 'harvester_1' && c.room.name === targetRoom).length,
            harvesterPro: _.filter(Game.creeps, c => c.memory.role === 'harvesterPro' && c.room.name === targetRoom).length,
            builder: _.filter(Game.creeps, c => c.memory.role === 'builder' && c.room.name === targetRoom).length,
            upgrader: _.filter(Game.creeps, c => c.memory.role === 'upgrader' && c.room.name === targetRoom).length,
            oldupgrader: _.filter(Game.creeps, c => c.memory.role === 'oldupgrader' && c.room.name === targetRoom).length,
            carrier: _.filter(Game.creeps, c => c.memory.role === 'carrier' && c.room.name === targetRoom).length,
            carrierT: _.filter(Game.creeps, c => c.memory.role === 'carrierT' && c.room.name === targetRoom).length,
            //transfer: _.filter(Game.creeps, c => c.memory.role === 'transfer' && c.room.name === targetRoom).length,
            claimer: _.filter(Game.creeps, c => c.memory.role === 'claimer' && c.room.name === targetRoom).length,
            outbuilder: _.filter(Game.creeps, c => c.memory.role === 'outbuilder' && c.room.name === targetRoom).length,
            outupgrader: _.filter(Game.creeps, c => c.memory.role === 'outupgrader' && c.room.name === targetRoom).length
        };

        // Log current creep counts (for E39N8)
        /*
        console.log(`[${targetRoom}] Harvesters: ${creepCount.harvester}`);
        console.log(`[${targetRoom}] HarvesterPros: ${creepCount.harvesterPro}`);
        console.log(`[${targetRoom}] Builders: ${creepCount.builder}`);
        console.log(`[${targetRoom}] Upgraders: ${creepCount.upgrader}`);
        console.log(`[${targetRoom}] Carriers: ${creepCount.carrier}`);
        console.log(`[${targetRoom}] CarrierTs: ${creepCount.carrierT}`);
        */
        // Spawn new creeps based on role counts (only for E49N13)
        const spawn = Game.spawns['E49N13'];
        
        // 容错检查：如果spawn不存在，跳过生成逻辑
        if (!spawn) {
            console.log(`⚠️ 警告: 房间 ${targetRoom} 的spawn 'E49N13' 不存在或不可用`);
            return;
        }

        // Minimum number of creeps per role (customizable)
        const minCreeps = {
            harvester: 2,    // 基础采集工
            harvester_0: 0,  // 优先级1: 采集器0
            carrier: 0,      // 优先级2: 搬运工
            harvester_1: 0,  // 优先级3: 采集器1
            builder: 1,      // 优先级4: 建造工
            upgrader: 0,     // 优先级5: 升级工
            oldupgrader: 1,  // 旧版升级工
            harvesterPro: 0, // 优先级6: 专业采集器
            carrierT: 0,     // 优先级7: 终端搬运工
            //transfer: 0,     // 转移工
            claimer: 0,      // 占领工
            outbuilder: 0,   // 远程建造工
            outupgrader: 0,  // 远程升级工
        };

        // Determine which role to spawn next
        // 中文: 确定下一个要生成的角色
        let roleToSpawn;
        let creepBody;

        // Prioritize spawning based on role shortages
        switch (true) {
            // 基础harvester优先
            case creepCount.harvester < minCreeps.harvester:
                roleToSpawn = 'harvester';
                creepBody = [WORK, CARRY, MOVE, MOVE];
                break;
            // 优先级1: harvester_0
            case creepCount.harvester_0 < minCreeps.harvester_0:
                roleToSpawn = 'harvester_0';
                creepBody = [WORK, WORK, WORK, WORK, WORK, WORK, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE];
                break;
            // 优先级2: carrier
            case creepCount.carrier < minCreeps.carrier:
                roleToSpawn = 'carrier';
                creepBody = [CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE];
                break;
            // 优先级3: harvester_1
            case creepCount.harvester_1 < minCreeps.harvester_1:
                roleToSpawn = 'harvester_1';
                creepBody = [WORK, WORK, WORK, WORK, WORK, WORK, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE];
                break;
            // 优先级4: builder
            case creepCount.builder < minCreeps.builder:
                roleToSpawn = 'builder';
                creepBody = [WORK, CARRY, MOVE];
                break;
            // 优先级5: upgrader
            case creepCount.upgrader < minCreeps.upgrader:
                roleToSpawn = 'upgrader';
                creepBody = [WORK, WORK, CARRY, CARRY, MOVE, MOVE];
                break;
            // oldupgrader (简单升级工)
            case creepCount.oldupgrader < minCreeps.oldupgrader:
                roleToSpawn = 'oldupgrader';
                creepBody = [WORK, CARRY, MOVE];
                break;
            // 优先级6: harvesterPro
            case creepCount.harvesterPro < minCreeps.harvesterPro:
                roleToSpawn = 'harvesterPro';
                creepBody = [WORK, WORK, WORK, WORK, WORK, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE];
                break;
            // 优先级7: carrierT
            case creepCount.carrierT < minCreeps.carrierT:
                roleToSpawn = 'carrierT';
                creepBody = [CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE];
                break;
            // transfer (转移工)
            /*
            case creepCount.transfer < minCreeps.transfer:
                roleToSpawn = 'transfer';
                creepBody = [CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE];
                break;
            */
            // claimer (占领工)
            case creepCount.claimer < minCreeps.claimer:
                roleToSpawn = 'claimer';
                creepBody = [CLAIM, MOVE];
                break;
            // outbuilder (远程建造工)
            case creepCount.outbuilder < minCreeps.outbuilder:
                roleToSpawn = 'outbuilder';
                creepBody = [WORK, WORK, WORK, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE];
                break;
            // outupgrader (远程升级工)
            case creepCount.outupgrader < minCreeps.outupgrader:
                roleToSpawn = 'outupgrader';
                creepBody = [WORK, WORK, WORK, WORK, CARRY, CARRY, MOVE, MOVE, MOVE];
                break;
        }

        // Spawn the creep if a role is determined and spawn exists
        if (roleToSpawn && spawn) {
            this.spawnCreep(spawn, roleToSpawn, creepBody);
        }

        // Display spawning status (only if spawn exists)
        if (spawn) {
            this.showSpawningStatus(spawn);
        }
    },

    // Function to spawn a creep
    spawnCreep(spawn, role, body) {
        // 容错检查
        if (!spawn) {
            console.log(`❌ 错误: spawn不存在，无法生成 ${role}`);
            return;
        }
        
        const newName = `${role.charAt(0).toUpperCase() + role.slice(1)}${Game.time}`;
        const result = spawn.spawnCreep(body, newName, { memory: { role } });
        
        // 检查生成结果
        if (result !== OK) {
            console.log(`⚠️ 生成 ${role} 失败，错误码: ${result}`);
        } else {
            console.log(`✅ 成功生成 ${role}: ${newName}`);
        }
    },

    // Function to display spawning status
    showSpawningStatus(spawn) {
        // 容错检查
        if (!spawn) {
            return;
        }
        
        if (spawn.spawning) {
            const creep = Game.creeps[spawn.spawning.name];
            if (creep) {
                spawn.room.visual.text(
                    `🛠️${creep.memory.role}`,
                    spawn.pos.x + 1,
                    spawn.pos.y,
                    { align: 'left', opacity: 0.8 }
                );
            }
        }
    }
};
