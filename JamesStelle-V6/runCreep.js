var roleHarvester = require('role.harvester');
var roleHarvester_0 = require('role.harvester_0');
var roleHarvester_1 = require('role.harvester_1');
var roleHarvesterPro = require('role.harvesterPro');
var roleBuilder = require('role.builder');
var roleUpgrader = require('role.upgrader');    
var roleCarrier = require('role.carrier');
var roleCarrierT = require('role.carrierT');
var roleClaimer = require('role.claimer');
var roleTransfer = require('role.transfer');
var roleoutbuilder = require('role.outbuilder');

var roleOldupgrader = require('role.oldupgrader');

// Map roles to their corresponding modules
// 中文: 将角色映射到其对应的模块
const roleFunc = {
    harvester : roleHarvester,
    harvester_0: roleHarvester_0,
    harvester_1: roleHarvester_1,
    harvesterPro: roleHarvesterPro,
    upgrader: roleUpgrader,
    builder: roleBuilder,
    carrier: roleCarrier,
    carrierT: roleCarrierT,
    claimer: roleClaimer,
    //transfer: roleTransfer,
    outbuilder: roleoutbuilder,
    //outupgrader: roleOutupgrader,
    oldupgrader: roleOldupgrader,
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