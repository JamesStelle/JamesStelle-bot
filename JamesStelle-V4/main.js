var runCreep = require('runCreep');
var memoryCleaner = require('memoryCleaner');
var runRoom = require('runRoom');
var Tower = require('Tower');
var Link = require('Link');
var terminalManager = require('Terminal');
const pixelGenerator = require('pixelGenerator');


module.exports.loop = function () {

    runCreep.run();
    memoryCleaner.run();
    runRoom.run();
    Tower.run();
    Link.run();
    terminalManager.run();
    pixelGenerator.generatePixel();
}
