//behaviors.js

/*
  ONE TICK JOBS - Run the gauntlet here ONLY ONCE PER BEHAVIOR TICK - i.e., once every 5 game frames(?)

  Meta-behavior functions:
  each entity type has a different way of behaving based on status/properties
  but maybe I should be building types as characteristics and setting them up
  as modules? Hmm. 'Dave is male and mature and has these various other traits.'
  'Jane is female and mature and has these other traits...'. Hmmm...

  NO. Create single path behaviors with minor adjustments based on traits, personality, and status.
  Diverge in behavior methods AFTER those work.
*/

/*
    JOBS TREE


    SATISFY NEED
        - FIND FOOD
          - Check Inventory for Food
*/




//Prioritize Jobs and Needs

function act(object)
{
  if(object.status.hunger < 50) { return findHungerSatisfaction(object); }
  return 0;
}

//Find Sources for Need Satisfaction

/*

	Above: weigh needs and prioritize high-need jobs
	Below:
		- a) Check own memories and knowledge
		- b) Check area and, if successful, add to own memories and knowledge

*/

function findHungerSatisfaction(object)
{

  /*
    - Find an item of a certain type (tag 'edible').
      - look in inventory.
      - look in immediate vicinity.
    - If seen but not in inventory and not within reach, move towards it.
    - If within reach but not in inventory, put it in inventory.
    - If within inventory, eat it.

  */
  var haveEdible = checkArrayForMemberWithProperty(object, "edible", object.inventory),
  seeEdible      = checkArrayForMemberWithProperty(object, "edible", object.objectsSeen);
  if(haveEdible)
  {
    eatEdibleObject(object, haveEdible);
    return 1;
  }
  if(seeEdible)
  {
    var ediblesInSight = [];
    for(var x = 0; x < object.objectsSeen.length; x++)
    {
      if(object.objectsSeen[x].edible && objects.indexOf(object.objectsSeen[x]) > -1)
      {
        ediblesInSight.push(object.objectsSeen[x]);
      }
    }
    var seeEdible = findNearestObject(object, ediblesInSight);
    if(moveToward(object, seeEdible))
    {
      object.printableStatus = "Getting food item.";
      object.addToInventory(seeEdible);
    }
    else if(!seeEdible) { object.printableStatus = "Hungry, but can't see any food."; }
    else { object.printableStatus = "Moving to grab " + seeEdible.printableName; }
    return 1;
  }
  else
  {
    object.printableStatus = "Hungry, but can't see any food.";
  }
  return 0;
}

function findEnergySatisfaction(object)
{

}

function findThirstSatisfaction(object)
{

}

function eatEdibleObject(object, food)
{
  var curHunger = object.status.hunger;
  object.status.hunger += food.hungerSatiation;
  console.log(object.printableName + " just ate " + food.printableName);
  object.deleteFromInventory(food);
}

//Perform basic actions

function seeLocalObjects(object, dist)
{
  if(!object.buckets) { debugger; }
  let minBucketX  = getBucketCoords(object.buckets[0]).x,
  maxBucketX  = getBucketCoords(object.buckets[object.buckets.length - 1]).x,
  minBucketY  = getBucketCoords(object.buckets[0]).y,
  maxBucketY  = getBucketCoords(object.buckets[object.buckets.length - 1]).y,
  objectsSeen = [],
  curBucket, x, y, w, z;

  for(x = minBucketX - dist + 0; x <= maxBucketX + dist + 0; x++)
  {
    for(y = minBucketY - dist + 0; y <= maxBucketY + dist + 0; y++)
    {
      curBucket = x + "," + y;
      if(engine.ht.buckets[curBucket] === undefined) { continue; }
      else
      {
        for(w = 0; w < engine.ht.buckets[curBucket].length; w++)
        {
          if( objectsSeen.indexOf(engine.ht.buckets[curBucket][w]) < 0 &&
              engine.ht.buckets[curBucket][w].index !== object.index)
          {
            objectsSeen.push(engine.ht.buckets[curBucket][w]);
          }
        }
      }
    }
  }
  object.objectsSeen = objectsSeen;
  var seenList = [];
  for(z = 0; z < objectsSeen.length; z++) { seenList.push(objectsSeen[z].index); }
}

function lengthOfDirectPath(distX, distY, objA, objB){ return Math.sqrt((distX*distX)+(distY*distY)); }

//objA needs speed property
function pathDirectlyTo(objA, objB){
    var distX = objB.x - objA.x;
    var distY = objB.y - objA.y;
    var adistX = Math.abs(distX);
    var adistY = Math.abs(distY);

    var lengthPath = lengthOfDirectPath(distX, distY, objA, objB);
    var nX = (objA.speed / lengthPath) * distX;
    var nY = (objA.speed / lengthPath) * distY;

    return [nX, nY, lengthPath];
}

function findDistance(objA, objB){
    if(objA !== objB) {
        var pathObject = pathDirectlyTo(objA, objB);
        return pathObject[2];
    }
    return false;
}

function findNearestObject(object, array){
    var distance = 0;
    var closest = 0;
    for (var a = 0; a < array.length; a++)
    {
      var length = findDistance(array[a], object);
      if(distance === 0)
      {
          distance = length;
          closest = array[a];
      }
      else if(distance > length)
      {
          distance = length;
          closest = array[a];
      }
    }
    return closest;
}

function moveToward(mover, dest)
{
  if(objects.indexOf(dest) < 0) { return 0; }
  var moveX, moveY;
  if(mover.x > dest.x)
  {
    if(mover.x - mover.traits.speed <= dest.x) { moveX = dest.x - mover.x; }
    else { moveX = -mover.traits.speed; }
  }
  else
  {
    if(mover.x + mover.traits.speed >= dest.x) { moveX = dest.x - mover.x; }
    else { moveX = mover.traits.speed; }
  }

  if(mover.y > dest.y)
  {
    if(mover.y - mover.traits.speed <= dest.y) { moveY = dest.y - mover.y; }
    else { moveY = -mover.traits.speed; }
  }
  else
  {
    if(mover.y + mover.traits.speed >= dest.y) { moveY = dest.y - mover.y; }
    else { moveY = mover.traits.speed; }
  }

  mover.move(moveX, moveY);
  collisionObjectsToUpdate.push(mover);

  for(let i = 0; i < mover.collisions.length; i++ )
  {
    if(mover.collisions[i].index == dest.index) { console.log("Object touching!"); return true; }
  }
  return false;
}

function dropObjectFromInventory(object, index)
{
  objects.push(object);
  object.inventory.splice(index, 1);
}

function spiralHunt(originCoords, object, iterations)
{
  /*

    variables to work out:
      1. object view diameter
      2. number of iterations before giving up
      3.

  */
}

function deteriorateTraits(object)
{
  if(object.isSentient)
  {
    if(object.status.hunger > 0)
    {
      if(object.characterType === "baby")
      {
        object.status.hunger -= 3;
      }else if (object.characterType === "davey")
      {
        object.status.hunger -= 2;
      }else if(object.characterType === "jane")
      {
        object.status.hunger -= 1;
      }
    }
  }
}

function getMemoryObject(object, memoryObject, reason)
{
  if(reason == "edible")
  {
    {
      object.memory.edible.push(
      {
        index: memoryObject.index,
        x: memoryObject.x,
        y: memoryObject.y,
        time: engine.frame
      });
    }
  }
  else if(reason == "sentient")
  {

  }
}

function findMemoryByIndex(object, memoryIndex)
{

}

let wokeDaveyBehaviorMap = 
{

};