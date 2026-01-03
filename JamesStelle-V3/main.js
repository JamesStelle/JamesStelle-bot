var runCreep = require('runCreep');
var memoryCleaner = require('memoryCleaner');
var spawnManager = require('spawnManager');
var Tower = require('Tower');
var Link = require('Link');
module.exports.loop = function () {

    runCreep.run();
    memoryCleaner.run();
    spawnManager.run();
    Tower.run();
    Link.run();
    
}

