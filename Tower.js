module.exports = {
    run: function() {
        // 获取房间内所有防御塔
        var towers = _.filter(Game.structures, s => s.structureType === STRUCTURE_TOWER);
        
        // 遍历每个防御塔
        for (var i = 0; i < towers.length; i++) {
            var tower = towers[i];
            
            // 攻击最近的敌对爬虫（优先级最高）
            var closestHostile = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
            if (closestHostile) {
                tower.attack(closestHostile);
                continue; // 跳过后续逻辑，优先攻击
            }
            
            // Tower能量在50%以上时修复受损结构
            if (tower.store[RESOURCE_ENERGY] > tower.store.getCapacity(RESOURCE_ENERGY) * 0.9) {
                var closestDamagedStructure = tower.pos.findClosestByRange(FIND_STRUCTURES, {
                    filter: (structure) => structure.hits < structure.hitsMax
                });
                if (closestDamagedStructure) {
                    tower.repair(closestDamagedStructure);
                }
            }
        }
    }
};
