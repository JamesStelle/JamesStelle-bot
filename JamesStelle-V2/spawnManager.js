module.exports = {
    run:function() {
        // Count creeps by role
        // 中文: 统计各角色的爬虫数量
        const creepCount = {
            harvester: _.filter(Game.creeps, c => c.memory.role === 'harvester').length,
            builder: _.filter(Game.creeps, c => c.memory.role === 'builder').length,
            upgrader: _.filter(Game.creeps, c => c.memory.role === 'upgrader').length,
            carrier: _.filter(Game.creeps, c => c.memory.role === 'carrier').length
        };
        // Log current creep counts
        // 中文: 输出当前各角色爬虫数量
        console.log(`Harvesters: ${creepCount.harvester}`);
        console.log(`Builders: ${creepCount.builder}`);
        console.log(`Upgraders: ${creepCount.upgrader}`);
        console.log(`Carriers: ${creepCount.carrier}`);
        // Spawn new creeps based on role counts
        // 中文: 根据角色数量生成新的爬虫
        const spawn = Game.spawns['Spawn1'];
        // Minimum number of creeps per role
        // 中文: 每个角色的最小爬虫数量
        const minCreeps = 2;
        // Determine which role to spawn next
        // 中文: 确定下一个要生成的角色
        let roleToSpawn;
        // Define body configurations for each role
        // 中文: 定义每个角色的身体配置
        let creepBody;
        // Prioritize spawning based on role shortages
        // 中文: 根据角色短缺优先生成
        switch (true) {
            case creepCount.harvester < minCreeps:
                roleToSpawn = 'harvester';
                creepBody = [WORK, WORK, CARRY, MOVE];
                break;
            case creepCount.builder < minCreeps:
                roleToSpawn = 'builder';
                creepBody = [WORK, CARRY, MOVE, MOVE];
                break;
            case creepCount.upgrader < minCreeps:
                roleToSpawn = 'upgrader';
                creepBody = [WORK, CARRY, MOVE];
                break;
            case creepCount.carrier < minCreeps:
                roleToSpawn = 'carrier';
                creepBody = [CARRY, CARRY, MOVE, MOVE];
                break;
        }
        // Spawn the creep if a role is determined
        // 中文: 如果确定了角色则生成爬虫
        if (roleToSpawn) {
            this.spawnCreep(spawn, roleToSpawn, creepBody);
        }
        // Display spawning status
        // 中文: 显示生成状态
        this.showSpawningStatus(spawn);
    },
    // Function to spawn a creep
    // 中文: 生成爬虫的函数
    spawnCreep(spawn, role, body) {
        const newName = `${role.charAt(0).toUpperCase() + role.slice(1)}${Game.time}`;
        console.log(`Spawning new ${role}: ${newName}`);
        spawn.spawnCreep(body, newName, { memory: { role } });
    },
    // Function to display spawning status
    // 中文: 显示生成状态的函数
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
