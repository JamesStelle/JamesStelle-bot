module.exports = {
    run: function() {
        // Define the target room (E39N8)
        const targetRoom = 'E39N8';

        // Count creeps by role (only in E39N8)
        const creepCount = {
            harvester: _.filter(Game.creeps, c => c.memory.role === 'harvester' && c.room.name === targetRoom).length,
            harvesterPro: _.filter(Game.creeps, c => c.memory.role === 'harvesterPro' && c.room.name === targetRoom).length,
            builder: _.filter(Game.creeps, c => c.memory.role === 'builder' && c.room.name === targetRoom).length,
            upgrader: _.filter(Game.creeps, c => c.memory.role === 'upgrader' && c.room.name === targetRoom).length,
            carrier: _.filter(Game.creeps, c => c.memory.role === 'carrier' && c.room.name ===targetRoom).length
        };

        // Log current creep counts (for E39N8)
        console.log(`[${targetRoom}] Harvesters: ${creepCount.harvester}`);
        console.log(`[${targetRoom}] HarvesterPros: ${creepCount.harvesterPro}`);
        console.log(`[${targetRoom}] Builders: ${creepCount.builder}`);
        console.log(`[${targetRoom}] Upgraders: ${creepCount.upgrader}`);
        console.log(`[${targetRoom}] Carriers: ${creepCount.carrier}`);

        // Spawn new creeps based on role counts (only for E39N8)
        const spawn = Game.spawns['Jim'];

        // Minimum number of creeps per role (customizable)
        const minCreeps = {
            harvester: 2,  // Harvester 的最小数量
            harvesterPro: 0, // HarvesterPro 的最小数量
            builder: 2,    // Builder 的最小数量
            upgrader: 1,   // Upgrader 的最小数量
            carrier: 1     // Carrier 的最小数量
        };

        // Determine which role to spawn next
        let roleToSpawn;
        let creepBody;

        // Prioritize spawning based on role shortages
        switch (true) {
            case creepCount.harvester < minCreeps.harvester:
                roleToSpawn = 'harvester';
                creepBody = [WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE];
                //100*5+50*6=800
                break;
            case creepCount.harvesterPro < minCreeps.harvesterPro:
                roleToSpawn = 'harvesterPro';
                creepBody = [WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE];
                break;
            case creepCount.builder < minCreeps.builder:
                roleToSpawn = 'builder';
                creepBody = [WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE];
                break;
            case creepCount.upgrader < minCreeps.upgrader:
                roleToSpawn = 'upgrader';
                creepBody = [WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE];
                break;
            case creepCount.carrier < minCreeps.carrier:
                roleToSpawn = 'carrier';
                creepBody = [CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE];
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
        console.log(`Spawning new ${role}: ${newName}`);
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
