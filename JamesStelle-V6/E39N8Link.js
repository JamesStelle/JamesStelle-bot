module.exports = function E39N8Link() {
    const roomName = 'E39N8';  // 指定房间
    
    // 如果当前 tick 不是该房间，直接返回
    if (!Game.rooms[roomName]) {
        return;
    }

    // 源 Link IDs（仅限 E39N8 房间）
    const sourceLinkIds = [
        '67db9df4a4e426160bd1cf72',
        '67e5b1226959f56539874c6b'
    ];
    
    // 目标 Link IDs（仅限 E39N8房间）
    const targetLinkIds = [
        '67fbd97710e84dee9bb89021',
        '6809ed41ddbf628d120b035b'
    ];

    // 1. 获取所有有效的源 Link 和目标 Link
    const sourceLinks = sourceLinkIds
        .map(id => Game.getObjectById(id))
        .filter(link => link && link.store[RESOURCE_ENERGY] >= 200);  // 确保至少有 800 能量

    const targetLinks = targetLinkIds
        .map(id => Game.getObjectById(id))
        .filter(link => link && link.store.getFreeCapacity(RESOURCE_ENERGY) >= 100);  

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
                    //console.log(`❌ [${roomName}] 传输失败 (${transferResult})：${sourceLink.id} → ${targetLink.id}`);
                }
            }
        }
    }
};
