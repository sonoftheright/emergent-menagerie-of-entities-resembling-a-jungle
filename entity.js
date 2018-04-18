//entity.js

/* Entity Properties and Trait Generation */

var numJanes =  2,
    numBabies = 2,
    numDavies = 2,
    numApples = 30,
    numTrees = 1;

var entities =
{
    "davey":    0,
    "jane":     0,
    "baby":     0,
    "apple":    0,
    "tree": 0
}


function getCoinFlip(choice1, choice2)
{
    var r = Math.round(Math.random());
    if(r) { return choice1; } else {return choice2 ;}
}

/*
Metatraits based on personality?
Traits:
 object.status.age
  - infant
  - toddler
  - child
  - adolescant
  - youngAdult
  - adult
  - elder
 object.trait.sex
  - male
  - female
  - other
*/

function entitify(object)
{
    object.entitified   = true;
    object.sentient     = null;
    object.age          = null;
    if(object.isSentient)
    {
        object.personality  =
        {
            agreeableness:      0,
            openness:           0,
            conscientiousness:  0,
            neuroticism:        0,
            extroversion:       0
        };
        object.status       =
        {
            health:             20,
            hunger:             20,
            thirst:             20,
            energy:             20,
            temperature:        20,
            contentedness:      100,
            fear:               0
        };
        object.traits       =
        {
            strength:           0,
            endurance:          0,
            speed:              0,
            intelligence:       0,
            charisma:           0,
            memory:             0,
            sex:                null
        };

        object.personality.agreeableness     = Math.trunc(Math.random() * 100) / 100;
        object.personality.openness          = Math.trunc(Math.random() * 100) / 100;
        object.personality.conscientiousness = Math.trunc(Math.random() * 100) / 100;
        object.personality.neuroticism       = Math.trunc(Math.random() * 100) / 100;
        object.personality.extroversion      = Math.trunc(Math.random() * 100) / 100;

        object.traits.strength               = Math.trunc(Math.random() * 30);
        object.traits.endurance              = Math.trunc(Math.random() * 50);
        object.traits.speed                  = Math.trunc(Math.random() * 5) + 2;
        object.traits.intelligence           = Math.floor(object.personality.openness * 100);
        object.traits.charisma               = Math.floor(((object.personality.extroversion + object.personality.openness) / 2) * 100);
        object.traits.memory                 = Math.floor(((object.personality.openness + object.personality.conscientiousness) / 2) * 100);

        object.sentient = true;
        object.printableStatus = "idle";
        object.traits.sex = object.characterType === "davey" ? "male" : object.characterType === "jane" ? "female" : getCoinFlip("male", "female");
        object.status.age = object.characterType === "davey" ? "adult" : object.characterType === "jane" ? "adult" : "infant";

        object.inventory = [];
        object.addToInventory = function (inv)
        {
            console.log(inv.printableName + " is being picked up by " + object.printableName);
            object.inventory.push(objects.splice(objects.indexOf(inv), 1)[0]);
            collisionObjectsToUpdate.push(object);
        };
        object.deleteFromInventory = function(inv)
        {
            if(inv.characterType === "apple") { numApples--; }
            removeObjectFromTable(inv);
            object.inventory.splice(object.inventory.indexOf(inv), 1);
        };

        // for now, just remember the locations of people and edible things
        object.memory    =
        {
            edible: [],
            sentient: []
        };

        object.viewDistance = 5;

        object.thoughtProcess = function()
        {
            seeLocalObjects(this, 15);
        }
    }
    else if(object.isInanimate)
    {
        if(object.characterType === "apple")
        {
            object.edible = true;
            object.hungerSatiation = Math.round((Math.random() * 10) + 40);
        }
        else if(object.characterType === "steak")
        {
            object.edible = true;
            object.hungerSatiation = Math.round((Math.random() * 50) + 50);
        }
    }
}

function printEntityInfo(object)
{
    if(object.isSentient)
    {
        console.log("==========================");
        console.log(JSON.stringify(object.personality));
        console.log(JSON.stringify(object.status));
        console.log(JSON.stringify(object.traits));
        console.log("================");
        console.log("Objects in view: ");
        console.log(object.objectsSeen);
        console.log("================");
        console.log("Objects in inventory: ");
        console.log(object.inventory);
        console.log("=========================");
    }
    else if(object.edible)
    {
        console.log("++++++++++++++++++++++++");
        console.log("buckets: " + object.buckets);
        console.log("satiation: " + object.hungerSatiation );
        console.log("=========================");
    }
}

/* Spawn the Entities! */


var xWidth = el.width / 2;
var yHeight = el.height / 2;

function makeDavey()
{
    entities.davey++;
    var objectX = Math.floor(-(el.middleX / 4) + Math.random() * (el.middleX));
    var objectY = Math.floor(-(el.middleY / 4) + Math.random() * (el.middleY));
	var nS = newEntity(objectX, objectY, 50, 50);
    nS.maxX = nS.x + nS.width;
    nS.maxY = nS.y + nS.height;
    nS.type = "square";
    nS.cachedImage = "wokedavey";
    nS.characterType = "davey";
    nS.isSentient = true;
    nS.width = canvasCache[nS.cachedImage].width;
    nS.height = canvasCache[nS.cachedImage].height;
    entitify(nS);
    addEntity(nS);
    addObjectToTable(nS);
    collisionObjectsToUpdate.push(nS);
    var appleNumber = makeApple() - 1;
    nS.addToInventory(objects[appleNumber]);
}
function makeJane()
{
	//Spawn bottom right quadrant
    entities.jane++;
    var objectX = Math.floor(-(el.middleX / 2) + Math.random() * (el.middleX));
    var objectY = Math.floor(-(el.middleY / 2) + Math.random() * (el.middleY));
    var nS = newEntity(objectX, objectY, 50, 50);
    nS.maxX = nS.x + nS.width;
    nS.maxY = nS.y + nS.height;
    nS.type = "square";
    nS.cachedImage = "wokejezebel";
    nS.characterType = "jane";
    nS.isSentient = true;
    nS.width = canvasCache[nS.cachedImage].width;
    nS.height = canvasCache[nS.cachedImage].height;
    entitify(nS);
    addEntity(nS);
    addObjectToTable(nS);
    collisionObjectsToUpdate.push(nS);
}

function makeBaby()
{
	//Spawn bottom right quadrant
    entities.baby++;
    var objectX = Math.floor(-(el.middleX / 2) + Math.random() * (el.middleX));
    var objectY = Math.floor(-(el.middleY / 2) + Math.random() * (el.middleY));
    var nS = newEntity( objectX, objectY, 50, 50);
    nS.maxX = nS.x + nS.width;
    nS.maxY = nS.y + nS.height;
    nS.type = "square";
    nS.cachedImage = "wokebaby";
    nS.characterType = "baby";
    nS.isSentient = true;
    nS.width = canvasCache[nS.cachedImage].width;
    nS.height = canvasCache[nS.cachedImage].height;
    entitify(nS);
    addEntity(nS);
    addObjectToTable(nS);
    collisionObjectsToUpdate.push(nS);
}

function makeApple()
{
	//Spawn upper right quadrant
    entities.apple++;
    var objectX = Math.floor(-(el.middleX / 2) + Math.random() * (el.middleX));
    var objectY = Math.floor(-(el.middleY / 2) + Math.random() * (el.middleY));
    var nS = newEntity(objectX, objectY, 50, 50);
    nS.maxX = nS.x + nS.width;
    nS.maxY = nS.y + nS.height;
    nS.type = "square";
    nS.characterType = "apple";
    nS.cachedImage = "apple";
    nS.isInanimate = true;
    nS.width = canvasCache[nS.cachedImage].width;
    nS.height = canvasCache[nS.cachedImage].height;
    entitify(nS);
    addEntity(nS);
    addObjectToTable(nS);
    collisionObjectsToUpdate.push(nS);
    return objects.length;
}

function makeTree()
{
    //Spawn upper right quadrant
    entities.tree++;
    var objectX = Math.floor(el.middleX - (0.66 * el.middleX));
    var objectY = Math.floor(el.middleY - (0.66 * el.middleX));
    var nS = newEntity(objectX, objectY, 50, 50);
    nS.maxX = nS.x + nS.width;
    nS.maxY = nS.y + nS.height;
    nS.type = "square";
    nS.characterType = "tree";
    nS.cachedImage = "tree";
    nS.isInanimate = true;
    nS.width = canvasCache[nS.cachedImage].width;
    nS.height = canvasCache[nS.cachedImage].height;
    entitify(nS);
    addEntity(nS);
    addObjectToTable(nS);
    collisionObjectsToUpdate.push(nS);
    return objects.length;
}

function killEntity(object)
{
    removeObjectFromTable(object);
    deadObjects.push(object);
    objects.splice(objects.indexOf(object), 1);
}

function addEntity(object)
{
    object.index = entities[object.characterType];
    object.printableName = object.characterType + object.index;
    objects.push(object);
}

for(let x = 0; x < numJanes; x++) { makeJane(); }
for(let x = 0; x < numApples; x++) { makeApple(); }
for(let x = 0; x < numDavies; x++) { makeDavey(); }
for(let x = 0; x < numBabies; x++) { makeBaby(); }
//for(let x = 0; x < numTrees; x++) { makeTree(); }