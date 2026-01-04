升到二级之后，使用StructureContainer,运用“挖运分离”的思想，提高效率。<br>
原逻辑：harvester->source->extension<br>
现逻辑：harvester->source->container<br>
&emsp;&emsp;&emsp;&emsp;carrier->container->extension<br>
在spawnManage.js中的creepBody = [WORK, WORK, CARRY, MOVE];修改creep的身体部位<br>
在const minCreeps = { harvester: 2,  // Harvester 的最小数量 };修改creep的最低数量
