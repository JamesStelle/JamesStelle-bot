module.exports = {
    run: function() {
        // 清理不存在的creep内存
        for(const name in Memory.creeps) {
            if(!Game.creeps[name]) {
                delete Memory.creeps[name];
                console.log('清理不存在的creep内存:', name);
            }
        }
        
        
    }
};
