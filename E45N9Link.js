module.exports = function E45N9Link() {
    const roomName = 'E45N9';  // 指定房间
    
    // 如果当前 tick 不是该房间，直接返回
    if (!Game.rooms[roomName]) {
        return;
    }

    // 源 Link IDs（仅限 E45N9 房间）
    const sourceLinkIds = [
        '680687d4ad436b7dd600c5ce',
        '67ea650b88d9ab8f23f0fcec'
    ];
    
    // 目标 Link IDs（仅限 E45N9 房间）
    const targetLinkIds = [
        '680686184ce6e564d2c47f1b',
        '67ea5c3465d30b85a1babf7f'
    ];

    // 1. 获取所有有效的源 Link 和目标 Link
    const sourceLinks = sourceLinkIds
        .map(id => Game.getObjectById(id))
        .filter(link => link && link.store[RESOURCE_ENERGY] >= 200);  // 确保至少有 00 能量

    const targetLinks = targetLinkIds
        .map(id => Game.getObjectById(id))
        .filter(link => link && link.store.getFreeCapacity(RESOURCE_ENERGY) >= 0);  // 确保至少能接收 800 能量

    // 2. 如果没有可用的源或目标 Link，直接返回
    if (sourceLinks.length === 0 || targetLinks.length === 0) {
        return;
    }

    // 3. 对目标 Link 按能量升序排序（优先向能量少的传输）
    targetLinks.sort((a, b) => a.store[RESOURCE_ENERGY] - b.store[RESOURCE_ENERGY]);

    // 4. 遍历所有源 Link，尝试向排序后的目标 Link 传输能量
    for (const sourceLink of sourceLinks) {
        if (sourceLink.cooldown === 0) {  // 检查冷却时间
            for (const targetLink of targetLinks) {
                const transferResult = sourceLink.transferEnergy(targetLink);
                
                if (transferResult === OK) {
                    //console.log(`✅ [${roomName}] 能量从 ${sourceLink.id} 传输到 ${targetLink.id}`);
                    break; // 成功传输后，跳出当前目标循环，避免重复传输
                } else {
                    //console.log(`❌ [${roomington}] 传输失败 (${transferResult})：${sourceLink.id} → ${targetLink.id}`);
                }
            }
        }
    }
};
