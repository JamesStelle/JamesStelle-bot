var roleHarvester = require('role.harvester');
var roleHarvesterPro = require('role.harvesterPro');
var roleBuilder = require('role.builder');
var roleUpgrader = require('role.upgrader');    
var roleCarrier = require('role.carrier');
var roleCarrierT = require('role.carrierT')
// Map roles to their corresponding modules
// 中文: 将角色映射到其对应的模块
const roleFunc = {
    harvester: roleHarvester,
    harvesterPro: roleHarvesterPro,
    upgrader: roleUpgrader,
    builder: roleBuilder,
    carrier: roleCarrier,
    carrierT: roleCarrierT
};

// Main run function to execute each creep's role
// 中文: 主运行函数以执行每个爬虫的角色
var runCreep = {
    run: function(creep) {
        for(var name in Game.creeps) {
            var creep = Game.creeps[name];
            var role = creep.memory.role;
            if(roleFunc[role]) {
                roleFunc[role].run(creep);
            }
        }
    }
};
module.exports = runCreep;