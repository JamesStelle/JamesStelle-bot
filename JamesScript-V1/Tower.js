module.exports = {
    run:function(){
    // 控制防御塔
        var tower = Game.getObjectById('68ea8e587e3d3a020818c7f1');
        if(tower) {
            var closestDamagedStructure = tower.pos.findClosestByRange(FIND_STRUCTURES, {
                filter: (structure) => structure.hits < structure.hitsMax
            });
            // 修复受损结构
            if(closestDamagedStructure) {
                tower.repair(closestDamagedStructure);
            }
            // 攻击最近的敌对爬虫
            var closestHostile = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
            if(closestHostile) {
                tower.attack(closestHostile);
            }
        }
    }
};