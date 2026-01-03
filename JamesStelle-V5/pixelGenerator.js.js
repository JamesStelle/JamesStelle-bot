// pixelGenerator.js
module.exports = {
    run: function() {
        if (Game.cpu.bucket >= 10000) {
            const result = Game.cpu.generatePixel();
            if (result === OK) {
                console.log(`[Pixel] Generated 1 PIXEL. CPU Bucket: ${Game.cpu.bucket}`);
            }
        }
    }
};
