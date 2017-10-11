//entity.js

/* Entity Properties and Trait Generation */

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
    object.entitified = true;
    object.personality =
    {
        agreeableness:      0,
        openness:           0,
        conscientiousness:  0,
        neuroticism:        0,
        extroversion:       0
    };
    object.status =
    {
        health:             100,
        hunger:             100,
        thirst:             100,
        energy:             100,
        temperature:        100,
        contentedness:      100,
        fear:               0
    };
    object.traits =
    {
        strength:           0,
        endurance:          0,
        intelligence:       0,
        charisma:           0,
        memory:             0
    };
    object.personality.agreeableness     = Math.trunc(Math.random() * 100) / 100;
    object.personality.openness          = Math.trunc(Math.random() * 100) / 100;
    object.personality.conscientiousness = Math.trunc(Math.random() * 100) / 100;
    object.personality.neuroticism       = Math.trunc(Math.random() * 100) / 100;
    object.personality.extroversion      = Math.trunc(Math.random() * 100) / 100;

    object.traits.strength               = Math.trunc(Math.random() * 30);
    object.traits.endurance              = Math.trunc(Math.random() * 50);
    object.traits.intelligence           = Math.floor(object.personality.openness * 100);
    object.traits.charisma               = Math.floor(((object.personality.extroversion + object.personality.openness) / 2) * 100);
    object.traits.memory                 = Math.floor(((object.personality.openness + object.personality.conscientiousness) / 2) * 100);

    if(object.characterType === "davey" || 
       object.characterType === "jane"  ||
       object.characterType === "baby")
    {
        object.sentient = true;
        object.printableStatus = "idle";
    }

    object.traits.sex = object.characterType === "davey" ? "male" : object.characterType === "jane" ? "female" : getCoinFlip("male", "female");
    object.status.age = object.characterType === "davey" ? "adult" : object.characterType === "jane" ? "adult" : "infant";
}

function printEntityInfo(object)
{
    console.log("================");
    console.log(JSON.stringify(object.personality));
    console.log(JSON.stringify(object.status));
    console.log(JSON.stringify(object.traits));
    console.log("================");
}

function foodify(object)
{
	if(!object.edible)
	{
	    object.edible = true;
	    object.flavor = Math.random() * 100;
	    object.substance = Math.random() * 100;
	}
}


/* Spawn the Entities! */


var xWidth = el.width / 2;
var yHeight = el.height / 2;

function makeDavey()
{
	var nS = newSquareEntity(
        Math.floor(0 - (Math.random() * xWidth)),
        Math.floor(0 - (Math.random() * yHeight) + yHeight),
        50,50);
    nS.maxX = nS.x + nS.width;
    nS.maxY = nS.y + nS.height;
    nS.type = "square";
    nS.cachedImage = "wokedavey";
    nS.characterType = "davey";
    nS.width = canvasCache[nS.cachedImage].width;
    nS.height = canvasCache[nS.cachedImage].height;
    entitify(nS);
    objects.push(nS);
    addObjectToTable(nS);
}
function makeJane()
{
	//Spawn bottom right quadrant
    var nS = newSquareEntity(
        Math.floor(0 - (Math.random() * xWidth) + xWidth),
        Math.floor(0 - (Math.random() * yHeight) + yHeight),
        50,50);
    nS.maxX = nS.x + nS.width;
    nS.maxY = nS.y + nS.height;
    nS.type = "square";
    nS.cachedImage = "wokejezebel";
    nS.characterType = "jane";
    nS.width = canvasCache[nS.cachedImage].width;
    nS.height = canvasCache[nS.cachedImage].height;
    entitify(nS);
    objects.push(nS);
    addObjectToTable(nS);
}

function makeBaby()
{
	//Spawn bottom right quadrant
    var nS = newSquareEntity(
        Math.floor(0 - (Math.random() * xWidth) + xWidth),
        Math.floor(0 - (Math.random() * yHeight) + yHeight),
        50,50);
    nS.maxX = nS.x + nS.width;
    nS.maxY = nS.y + nS.height;
    nS.type = "square";
    nS.cachedImage = "wokebaby";
    nS.characterType = "baby";
    nS.width = canvasCache[nS.cachedImage].width;
    nS.height = canvasCache[nS.cachedImage].height;
    entitify(nS);
    objects.push(nS);
    addObjectToTable(nS);
}

function makeApple()
{
	//Spawn upper right quadrant
    var nS = newSquareEntity(
        Math.floor(0 - (Math.random() * xWidth) + xWidth),
        Math.floor(0 - (Math.random() * yHeight)),
        50,50);
    nS.maxX = nS.x + nS.width;
    nS.maxY = nS.y + nS.height;
    nS.type = "square";
    nS.cachedImage = "apple";
    nS.width = canvasCache[nS.cachedImage].width;
    nS.height = canvasCache[nS.cachedImage].height;
    entitify(nS);
    objects.push(nS);
    addObjectToTable(nS);
}

for(let x = 0; x < 3; x++) { makeDavey(); }
for(let x = 0; x < 3; x++) { makeJane(); }
for(let x = 0; x < 3; x++) { makeBaby(); }
for(let x = 0; x < 11; x++) { makeApple(); }

for(let y = 0; y < objects.length; y++) { collisionObjectsToUpdate.push(objects[y]); }