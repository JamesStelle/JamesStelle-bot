module.exports = function E51N15Link() {
    const roomName = 'E51N15';  // 指定房间
    
    // 如果当前 tick 不是该房间，直接返回
    if (!Game.rooms[roomName]) {
        return;
    }

    // 源 Link IDs（仅限 E51N15 房间）
    const sourceLinkIds = [
        '67f601f0b6de60014c2209f1',
        '67f60bd7757a897fa4e52aba',
        '696bbd21f98d69001217b7e6'
    ];
    
    // 目标 Link IDs（仅限 E51N15 房间）
    const targetLinkIds = [
        '6806d469d9b195604522d95c',
        '696ba9b2eba3cb495c8e5e94'
    ];

    // 1. 获取所有有效的源 Link 和目标 Link
    const sourceLinks = sourceLinkIds
        .map(id => Game.getObjectById(id))
        .filter(link => link && link.store[RESOURCE_ENERGY] >= 200);  // 确保至少有 800 能量

    const targetLinks = targetLinkIds
        .map(id => Game.getObjectById(id))
        .filter(link => link && link.store.getFreeCapacity(RESOURCE_ENERGY) >= 100)  // 确保至少能接收 800 能量
        .sort((a, b) => a.store[RESOURCE_ENERGY] - b.store[RESOURCE_ENERGY]);  // 按能量升序排序

    // 2. 如果没有可用的源或目标 Link，直接返回
    if (sourceLinks.length === 0 || targetLinks.length === 0) {
        return;
    }

    // 3. 遍历所有源 Link，尝试向排序后的目标 Link 传输能量
    for (const sourceLink of sourceLinks) {
        if (sourceLink.cooldown === 0) {  // 检查冷却时间
            for (const targetLink of targetLinks) {
                const transferResult = sourceLink.transferEnergy(targetLink);
                
                if (transferResult === OK) {
                    //console.log(`✅ [${roomName}] 能量从 ${sourceLink.id} 传输到 ${targetLink.id}`);
                    break; // 成功传输后，跳出当前目标循环
                } else {
                    //console.log(`❌ [${roomName}] 传输失败 (${transferResult})：${sourceLink.id} → ${targetLink.id}`);
                }
            }
        }
    }
};
