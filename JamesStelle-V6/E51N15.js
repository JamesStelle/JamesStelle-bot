module.exports = {
    run: function() {
        // Define the target room (E51N15)
        const targetRoom = 'E51N15';

        // Count creeps by role (only in E51N15)
        const creepCount = {
            harvester_0: _.filter(Game.creeps, c => c.memory.role === 'harvester_0' && c.room.name === targetRoom).length,
            harvester_1: _.filter(Game.creeps, c => c.memory.role === 'harvester_1' && c.room.name === targetRoom).length,
            harvesterPro: _.filter(Game.creeps, c => c.memory.role === 'harvesterPro' && c.room.name === targetRoom).length,
            builder: _.filter(Game.creeps, c => c.memory.role === 'builder' && c.room.name === targetRoom).length,
            upgrader: _.filter(Game.creeps, c => c.memory.role === 'upgrader' && c.room.name === targetRoom).length,
            carrier: _.filter(Game.creeps, c => c.memory.role === 'carrier' && c.room.name === targetRoom).length,
            carrierT: _.filter(Game.creeps, c => c.memory.role === 'carrierT' && c.room.name === targetRoom).length,
            outbuilder: _.filter(Game.creeps, c => c.memory.role === 'outbuilder').length
        };

        // Log current creep counts (for E51N15)
        /*
        console.log(`[${targetRoom}] Harvesters: ${creepCount.harvester}`);
        console.log(`[${targetRoom}] HarvesterPros: ${creepCount.harvesterPro}`);
        console.log(`[${targetRoom}] Builders: ${creepCount.builder}`);
        console.log(`[${targetRoom}] Upgraders: ${creepCount.upgrader}`);
        console.log(`[${targetRoom}] Carriers: ${creepCount.carrier}`);
        console.log(`[${targetRoom}] CarrierTs: ${creepCount.carrierT}`);
        */
        // Spawn new creeps based on role counts (only for E51N15)
        const spawn = Game.spawns['E51N15'];

        // Minimum number of creeps per role (customizable)
        const minCreeps = {
            harvester_0: 1,  // 优先级1: 采集器0
            carrier: 2,      // 优先级2: 搬运工 (增加数量)
            harvester_1: 1,  // 优先级3: 采集器1
            builder: 1,      // 优先级4: 建造工
            upgrader: 1,     // 优先级5: 升级工
            harvesterPro: 0, // 优先级6: 专业采集器
            carrierT: 1,     // 优先级7: 终端搬运工
            outbuilder: 0
        };

        // Determine which role to spawn next
        let roleToSpawn;
        let creepBody;

        // Prioritize spawning based on role shortages
        switch (true) {
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
                creepBody = [WORK, WORK, WORK, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE];
                break;
            // 优先级5: upgrader
            case creepCount.upgrader < minCreeps.upgrader:
                roleToSpawn = 'upgrader';
                creepBody = [WORK, WORK, CARRY, CARRY, MOVE, MOVE];
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
            case creepCount.outbuilder < minCreeps.outbuilder:
                roleToSpawn = 'outbuilder';
                creepBody = [WORK, WORK, WORK, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE];
                break;
        }

        // Spawn the creep if a role is determined (in E39N8)
        if (roleToSpawn) {
            this.spawnCreep(spawn, roleToSpawn, creepBody);
        }

        // Display spawning status
        this.showSpawningStatus(spawn);
    },

    // Function to spawn a creep
    spawnCreep(spawn, role, body) {
        const newName = `${role.charAt(0).toUpperCase() + role.slice(1)}${Game.time}`;
        //console.log(`Spawning new ${role}: ${newName}`);
        spawn.spawnCreep(body, newName, { memory: { role } });
    },

    // Function to display spawning status
    showSpawningStatus(spawn) {
        if (spawn.spawning) {
            const creep = Game.creeps[spawn.spawning.name];
            spawn.room.visual.text(
                `🛠️${creep.memory.role}`,
                spawn.pos.x + 1,
                spawn.pos.y,
                { align: 'left', opacity: 0.8 }
            );
        }
    }
};
