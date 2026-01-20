var runCreep = require('runCreep');
var memoryCleaner = require('memoryCleaner');
var runRoom = require('runRoom');
var Tower = require('Tower');
//var terminalManager = require('Terminal');
var runLink = require('runLink');
const pixelGenerator = require('pixelGenerator');
var roleTransfer = require('role.transfer');

module.exports.loop = function () {
    runLink();
    runCreep.run();
    memoryCleaner.run();
    runRoom.run();
    //Tower.run();
    //terminalManager.run();
    pixelGenerator.generatePixel();
    

}

