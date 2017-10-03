//entity.js

for(let x = 0; x < 350; x++)
{
    var nS = newSquareEntity( Math.floor(Math.random()*(el.width-100)) - map.focusPoint.x,
                        Math.floor(Math.random()*(el.height-100)) - map.focusPoint.y,
                        50,50);
    nS.maxX = nS.x + nS.width;
    nS.maxY = nS.y + nS.height;
    nS.type = "square";
    objects.push(nS);
    addObjectToTable(nS);
}

for(let y = 0; y < objects.length; y++)
{
    collisionObjectsToUpdate.push(objects[y]);
}

const entity =
{
	
};