//var roleHarvester = require('role.harvester');
//var roleBuilder = require('role.builder');
//var roleUpgrader = require('role.upgrader');
var runCreep = require('runCreep');
var memoryCleaner = require('memoryCleaner');
var spawnManager = require('spawnManager');
var Tower = require('Tower');
module.exports.loop = function () {

    runCreep.run();
    memoryCleaner.run();
    spawnManager.run();
    Tower.run();
    
}

