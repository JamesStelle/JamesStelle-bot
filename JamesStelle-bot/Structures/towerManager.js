module.exports = {
    run: function () {
        const towers = _.filter(Game.structures, (structure) => structure.structureType === STRUCTURE_TOWER);
        for (const tower of towers) {
            // 如果 Tower 能量不足，则跳过
            if (tower.store[RESOURCE_ENERGY] === 0) {
                console.log(`Tower at ${tower.pos} has no energy.`);
                continue;
            }

            // 检测最近的敌对 Creep
            const enemy = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);

            if (enemy) {
                console.log(`Tower at ${tower.pos} attacking enemy at ${enemy.pos}`);
                tower.attack(enemy);
            }
        }
    }
};
