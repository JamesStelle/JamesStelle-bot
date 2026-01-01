// 在main.js中调用此模块以生成像素
// const rolePixelGenerator = require('role.pixelGenerator');
// rolePixelGenerator.run();

const rolePixelGenerator = {
    run: function() {
        // 生成像素所需的 CPU 成本
        const pixelCost = 10000;

        // 检查 CPU 桶中的 CPU 数量
        if (Game.cpu.bucket >= pixelCost) {
            // 尝试生成像素
            const result = Game.cpu.generatePixel();
            if (result === OK) {
                //console.log(`[PixelGenerator] 像素生成成功！当前像素数量: ${Game.resources['pixel'] || 0}`);
            } else {
                //console.log(`[PixelGenerator] 生成像素失败，错误代码: ${result}`);
            }
        } else {
            if (Game.time % 10 === 0) { // 每 10 个 tick 输出一次
                //console.log(`[PixelGenerator] CPU 不足，无法生成像素。当前 CPU 桶: ${Game.cpu.bucket},当前像素数量: ${Game.resources['pixel'] || 0}`);
            }
        }
    }
};


module.exports = rolePixelGenerator;

