module.exports = {
    run: function() {
        // Count creeps by role
        const creepCount = {
            harvester: _.filter(Game.creeps, c => c.memory.role === 'harvester').length,
            harvesterPro: _.filter(Game.creeps, c => c.memory.role === 'harvesterPro').length,
            builder: _.filter(Game.creeps, c => c.memory.role === 'builder').length,
            upgrader: _.filter(Game.creeps, c => c.memory.role === 'upgrader').length,
            carrier: _.filter(Game.creeps, c => c.memory.role === 'carrier').length
        };

        // Log current creep counts
        console.log(`Harvesters: ${creepCount.harvester}`);
        console.log(`HarvesterPros: ${creepCount.harvesterPro}`);
        console.log(`Builders: ${creepCount.builder}`);
        console.log(`Upgraders: ${creepCount.upgrader}`);
        console.log(`Carriers: ${creepCount.carrier}`);

        // Spawn new creeps based on role counts
        const spawn = Game.spawns['Spawn1'];

        // Minimum number of creeps per role (customizable)
        const minCreeps = {
            harvester: 2,  // Harvester 的最小数量
            harvesterPro: 1, //HarvesterPro 的最小数量
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
                creepBody = [WORK, WORK, CARRY, MOVE];
                break;
            case creepCount.harvesterPro < minCreeps.harvesterPro:
                roleToSpawn = 'harvesterPro';
                creepBody = [WORK, WORK, CARRY, MOVE];
                break;
            case creepCount.builder < minCreeps.builder:
                roleToSpawn = 'builder';
                creepBody = [WORK, CARRY, MOVE, MOVE];
                break;
            case creepCount.upgrader < minCreeps.upgrader:
                roleToSpawn = 'upgrader';
                creepBody = [WORK, CARRY, MOVE];
                break;
            case creepCount.carrier < minCreeps.carrier:
                roleToSpawn = 'carrier';
                creepBody = [CARRY, CARRY, MOVE, MOVE];
                break;
            
        }

        // Spawn the creep if a role is determined
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
