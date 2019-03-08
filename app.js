/***************************************/
/* */
/**/
/**/
/**/
/**/
/**/
/**/
/***************************************/

/*#####################################*/
/*   I N I T I T I A L I Z A T I O N   */
/*#####################################*/

var el = document.getElementById("canvas");
var ctx = el.getContext('2d');
var debugging = false;
/*###############*/
/*   I N P U T   */
/*###############*/

var state =
{
    input: [],
    controls:
    {
        mouse:
        {
            x: 0,
            y: 0,
            wheel:
            {
                delta: 0
            },
            clicked: 0
        }
    },
    inactive: 0
};

function createEventListeners()
{
	//find absolute position based on the el referenced and its relative position
    el.setAttribute("oncontextmenu", "return false");
    /* window resizing */
    window.addEventListener('resize', function (event)
    {
    	state.input.push("resize");
    }, false);
    /* mouse movement listeners */
    window.addEventListener('mousemove', function (event)
    {
        var pos = findPos(el);
        state.controls.mouse.x = event.pageX - pos.x;
        state.controls.mouse.y = event.pageY - pos.y;
        state.controls.mouse.hash = hash(getEngCoordsX(state.controls.mouse.x), getEngCoordsY(state.controls.mouse.y));
    }, false);
    /*TODO: (Ben) Set up a zoom function with graphics scale to match.*/
    window.addEventListener('wheel', function (event)
    {
        if(event.deltaY > 0)
        {
            state.controls.mouse.wheel.delta = event.deltaY;
            state.input.push("mousewheelup");
        }
        else
        {
            state.controls.mouse.wheel.delta = -event.deltaX;
            state.input.push("mousewheeldown");
        }
    }, {passive: true});
    //more widely supported event listener linked to canvas rather than window
    //TODO: (Ben) Figure out how to establish right-click functionality
    el.addEventListener('mousedown', function (event)
    {
        var keyPressed = event.which;
        //NOTE: event.keyCode for left mouse button is 1, middle 2, right 3
        if (keyPressed === 3)
        {
            state.input.push("rightmousedown");
            state.controls.mouse.rightmousedown = true;
        }
        else if (keyPressed === 1)
        {
            //TODO: (Ben) Do something real here.
            state.input.push("leftmousedown");
            state.controls.mouse.leftmousedown = true;
        }
    }, false);
    el.addEventListener('touchstart', function (event)
    {
        var pos = findPos(el);
        state.input.push('leftmousedown');
        state.controls.mouse.leftmousedown = true;
        state.controls.mouse.x = event.changedTouches[0].pageX - pos.x;
        state.controls.mouse.y = event.changedTouches[0].pageY - pos.y;
    }, {passive: true});
    el.addEventListener('touchmove', function (event)
    {
        var pos = findPos(el);
        for(var x = 0; x < event.changedTouches.length; x++)
        {
            state.controls.mouse.x = event.changedTouches[x].pageX - pos.x;
            state.controls.mouse.y = event.changedTouches[x].pageY - pos.y;
        }
    },  {passive: true});
    el.addEventListener('mouseup', function (event)
    {
        var keyPressed = event.which;
        if (keyPressed === 1)
        {
            //TODO: (Ben) Do something real here.
            state.input.push("leftmouseup");
            state.controls.mouse.leftmousedown = false;
        }
        if (keyPressed === 3)
        {
            state.input.push("rightmouseup");
            state.controls.mouse.rightmousedown = false;
        }
    }, false);
    el.addEventListener('touchend', function (event)
    {
        var pos = findPos(el);
        state.input.push("leftmouseup");
        state.controls.mouse.leftmousedown = false;
        state.controls.mouse.x = event.changedTouches[event.changedTouches.length - 1].pageX - pos.x;
        state.controls.mouse.y = event.changedTouches[event.changedTouches.length - 1].pageY - pos.y;
        console.log("x: " + state.controls.mouse.x);
    }, false);
    /* keyboard listener */
    window.addEventListener('keydown', function (event)
    {
        var keyPressed = event.keyCode;
        if (keyPressed === 32)
            {state.input.push("spacedown");} //space down
        /* For these: if the current state of the controls ISN'T already in the same state, it won't repeat.
            Since these inputs are set to boolean values (effectively, in terms of the engine), there won't be
            any break in the flow. Now, once the key is picked up again, the bools are changed and everything
            is happy. These fixes the initial stutter after first listener, only then to continue the stream.*/
        if (!state.controls.leftdown && (keyPressed === 37 || keyPressed === 65))
            {state.input.push("leftdown"); state.controls.leftdown = true;} //left button down
        if (!state.controls.updown && (keyPressed === 38 || keyPressed === 87))
            {state.input.push("updown"); state.controls.updown = true;} //up button down
        if (!state.controls.rightdown && (keyPressed === 39 || keyPressed === 68))
            {state.input.push("rightdown"); state.controls.rightdown = true;} //right button down
        if (!state.controls.downdown && (keyPressed === 40 || keyPressed === 83))
            {state.input.push("downdown"); state.controls.downdown = true;} //down button down
        if (keyPressed === 16)
            {state.input.push("shiftdown"); state.controls.shiftdown = true;} //shift down
        if (keyPressed === 27)
            {state.input.push("escapedown");} //escape down
    }, false);
    window.addEventListener('keyup', function (event)
    {
        var keyPressed = event.keyCode;
        if (keyPressed === 32)
            {state.input.push("spaceup");} //space up
        if (keyPressed === 37 || keyPressed === 65)
            {state.input.push("leftup"); state.controls.leftdown = false;} //left button up
        if (keyPressed === 38 || keyPressed === 87)
            {state.input.push("upup"); state.controls.updown = false;} //up button up
        if (keyPressed === 39 || keyPressed === 68)
            {state.input.push("rightup"); state.controls.rightdown = false;} //right button up
        if (keyPressed === 40 || keyPressed === 83)
            {state.input.push("downup"); state.controls.downdown = false;} //down button up
        if (keyPressed === 16)
            {state.input.push("shiftup"); state.controls.shiftdown = false;} //shift up
        if (keyPressed === 27)
            {state.input.push("escapeup");} //escape up
    }, false);
}

/*###########*/
/*   M A P   */
/*###########*/

var map = {};

function initializeMap()
{
    map.focusPoint      = {};
    map.focusPoint.x    = 0.0;
    map.focusPoint.y    = 0.0;
    map.moveSpeedX      = 5;
    map.moveSpeedY      = 5;
    map.scale           = 1.0;
    map.scaleDifference = 0;
}

initializeMap();

function setFocusPoint(unitsX, unitsY)
{
    map.focusPoint.x = unitsX;
    map.focusPoint.y = unitsY;
}

function moveFocusPointInGraphics(unitsX, unitsY)
{
    map.focusPoint.x += unitsX;
    map.focusPoint.y += unitsY;
}

function moveFocusPointInEngine(unitsX, unitsY)
{
    map.focusPoint.x += unitsX / map.scale;
    map.focusPoint.y += unitsY / map.scale;
}

function resetMap()
{
    setFocusPoint(el.middleX + hud.buffer, el.middleY + hud.buffer);
    map.engineX    = (el.width  / 2);
    map.engineY    = (el.height / 2);
    map.scale = 1.0;
}

function getGfxCoordsX(engineX) { return Math.round(map.focusPoint.x + (engineX * map.scale)); }
function getGfxCoordsY(engineY) { return Math.round(map.focusPoint.y + (engineY * map.scale)); }

function getEngCoordsX(gfxX) { return Math.round((gfxX - map.focusPoint.x) / map.scale); }
function getEngCoordsY(gfxY) { return Math.round((gfxY - map.focusPoint.y) / map.scale); }

function updateMap()
{

}

/*#####################*/
/*   G R A P H I C S   */
/*#####################*/
/*
    - setup
    - heads up display
    - drawing

*/

/*   S E T U P   */

var hud = {};
var objects = [];
var deadObjects = [];

function findPos(obj)
{
    ctx.exLeft = 0;
    ctx.exTop = 0;
    if (obj.offsetParent)
    {
        do { ctx.exLeft += obj.offsetLeft; ctx.exTop += obj.offsetTop; }
        while (obj === obj.offsetParent);
        return {x: ctx.exLeft, y: ctx.exTop};
    }
    return {x: 0, y: 0};
}

function fitElementSize()
{
    el.offset = 10;
    el.width = window.innerWidth - el.offset;
    el.height = window.innerHeight - el.offset;
    el.middleX = el.width / 2;
    el.middleY = el.height / 2;
    el.style.top = ((window.innerHeight - el.height)/2) + "px";
    el.style.left = ((window.innerWidth - el.width)/2) + "px";
    el.style.position = "absolute";
    return 1;
};

/*   H E A D S   U P   D I S P L A Y   */

hud.enabled = true;
hud.disable = function(){ hud.enabled = false; }
hud.enable =  function(){ hud.enabled = true; }

function refreshHUD()
{
    hud.statMaxFontSize = 16;
    hud.statFont = 10;
    //positioning relative to el
    hud.buffer = 5;

    //left border
    hud.leftBorderX1 =      hud.buffer;
    hud.leftBorderY1 =      hud.buffer;
    hud.leftBorderX2 =      hud.buffer;
    hud.leftBorderY2 =      el.height - hud.buffer;

    //bottom border
    hud.bottomBorderX1 =    hud.buffer;
    hud.bottomBorderY1 =    el.height - hud.buffer;
    hud.bottomBorderX2 =    el.width - hud.buffer;
    hud.bottomBorderY2 =    el.height - hud.buffer;

    //right border
    hud.rightBorderX1 =     el.width - hud.buffer;
    hud.rightBorderY1 =     el.height - hud.buffer;
    hud.rightBorderX2 =     el.width - hud.buffer;
    hud.rightBorderY2 =     hud.buffer;

    //top border
    hud.topBorderX1 =       el.width - hud.buffer;
    hud.topBorderY1 =       hud.buffer;
    hud.topBorderX2 =       hud.buffer;
    hud.topBorderY2 =       hud.buffer;

    //stat positioning
    hud.statColumns = el.width > 600 ? 3 : el.width > 300 ? 2 : 1;
    hud.statColumnSpacing = 3;
    hud.statColumnWidth = (el.width - hud.buffer - hud.buffer + hud.statColumnSpacing) / hud.statColumns;

    hud.statRowSpacing = 5;

    hud.statRowHeight = hud.statMaxFontSize + hud.statRowSpacing;
    hud.statNumRows = (el.height - hud.buffer - hud.buffer) / hud.statRowHeight;
    hud.statMaxLabels = hud.statNumRows * hud.statColumns;

}

function drawBorders()
{
    ctx.beginPath();
    ctx.lineWidth = 1.0;
    ctx.strokeStyle = 'black';
    //draw borders
    // left border
    ctx.moveTo(hud.leftBorderX1,    hud.leftBorderY1);
    ctx.lineTo(hud.leftBorderX2,    hud.leftBorderY2);
    // bottom border
    ctx.moveTo(hud.bottomBorderX1,  hud.bottomBorderY1);
    ctx.lineTo(hud.bottomBorderX2,  hud.bottomBorderY2);
    // right border
    ctx.moveTo(hud.rightBorderX1,   hud.rightBorderY1);
    ctx.lineTo(hud.rightBorderX2,   hud.rightBorderY2);
    // top border
    ctx.moveTo(hud.topBorderX1,     hud.topBorderY1);
    ctx.lineTo(hud.topBorderX2,     hud.topBorderY2);
    ctx.stroke();
}

function drawStatistics()
{
    var row = 0;

    ctx.lineCap       = hud.lineCap;
    ctx.lineJoin      = hud.lineJoin;
    ctx.lineWidth     = hud.lineWidth;
    ctx.textBaseline  = hud.statTextBaseline;
    ctx.textAlign     = hud.statTextAlign;
    ctx.font          = hud.statFont;

    for(var x = 0; x < hud.statLabels.length; x++)
    {
        row = x % hud.statNumRows;
        col = Math.floor(x / hud.statNumRows);
        if(hud.statLabels[x].style == "header")
        {
            ctx.font = hud.statHeaderFont;
            ctx.fillText(
                hud.statLabels[x].text + hud.statLabels[x].value(),               //text
                hud.buffer + (col * hud.statColumnWidth) + hud.statColumnSpacing, //x position
                hud.buffer + (row * hud.statRowHeight),                           //y position
                hud.statColumnWidth - hud.statColumnSpacing                       //max column width
            );
        }
        if(hud.statLabels[x].style == "item")
        {
            ctx.font = hud.statItemFont;
            ctx.fillText(
                hud.statLabels[x].text + hud.statLabels[x].value(),               //text
                hud.buffer + (col * hud.statColumnWidth) + hud.statColumnSpacing, //x position
                hud.buffer + (row * hud.statRowHeight),                           //y position
                hud.statColumnWidth - hud.statColumnSpacing                       //max column width
            );
        }
        if(hud.statLabels[x].style == "subheader")
        {
            ctx.font = hud.statSubHeaderFont;
            ctx.fillText(
                hud.statLabels[x].text + hud.statLabels[x].value(),               //text
                hud.buffer + (col * hud.statColumnWidth) + hud.statColumnSpacing, //x position
                hud.buffer + (row * hud.statRowHeight),                           //y position
                hud.statColumnWidth - hud.statColumnSpacing                       //max column width
            );
        }
    }
}

//need object with references to text and value
function addStatToHud( stat )
{
    if(hud.statLabels.length < hud.statMaxLabels - 1)
    {
        hud.statLabels.push(stat);
    }
    else
    {
        console.log(JSON.stringify(stat) + " " + stat.value() + " not added.");
        console.log("statLabels.length: " + hud.statLabels.length);
        console.log("statMaxLabels: " + hud.statMaxLabels - 1);
    }
}

function drawHUD()
{
    if(hud.menu.open === true)
    {

    }

    hud.menu.button.lineWidth = 2;
    hud.menu.button.buffer = hud.menu.button.lineWidth + Math.floor(hud.menu.button.height * 0.5);
    hud.menu.button.x = hud.menu.button.buffer;
    hud.menu.button.y = el.height - hud.menu.button.buffer - hud.menu.button.height;
    ctx.beginPath();
    ctx.strokeStyle = "black";
    ctx.lineWidth = hud.menu.button.lineWidth;
    ctx.rect(
        hud.menu.button.x,    // convert engine coords to graphics context
        hud.menu.button.y,
        hud.menu.button.width,  // scale the object's subjective size
        hud.menu.button.height
    );
    //item font settings
    hud.menu.fontSize = 14;
    hud.menu.fontStyle = "sans-serif ";
    ctx.font = "Bold " + hud.menu.fontSize + "px " + hud.menu.fontStyle;
    ctx.textAlign = "center";
    ctx.fillText(
        "Pause",              //text
        hud.menu.button.x + (hud.menu.button.width / 2),   //x position
        hud.menu.button.y,   //y position
        4 * hud.menu.fontSize//max column width
    );

    if(hud.menu.rightClickMenu)
    {
        for(var x = 0; x < hud.menu.items.length; x++)
        {
            if(hud.menu.items[x].type === "button")
            {
                ctx.rect(
                    hud.menu.items[x].x,
                    hud.menu.items[x].y,
                    150,
                    hud.menu.fontSize
                    );
                ctx.fillText(
                    hud.menu.items[x].name,              //text
                    hud.menu.items[x].x + (hud.menu.items[x].width / 2),   //x position
                    hud.menu.items[x].y,   //y position
                    4 * hud.menu.fontSize//max column width
    );
            }
        }
    }

    ctx.stroke();
}

/*   D R A W I N G   */

var canvasCache = {};

function makeCachedImage(width, height, imgsrc)
{
    var c = document.createElement('canvas');
    c.width = width + 2;
    c.height = height + 2;
    var canv = c.getContext('2d');
    if (typeof imgsrc === "function")
    {
        imgsrc(canv, width, height);
    }
    else if(typeof imgsrc === "string")
    {
        var img = getImage(width, height, canv, imgsrc);
    }

    return c;
}

function newEntity ( x, y, w, h )
{
    var square = {
        printableName: null,
        index: undefined,
        x: x,
        y: y,
        height: h,
        width: w,
        moving: false,
        collisions: [],
        clicked: false,
        draggedX: 0,
        draggedY: 0,
        buckets: [],
        boundingBoxStyle: 'greensquare',
        boundingBoxOn: true,
        bucketLabelOn: false,
        cachedImage: 0,
        printableStatus: null,
        drawBoundingBox: function()
        {
            if(this.clicked) { this.boundingBoxStyle = "bluesquare"; }
            else if(this.collisions.length > 0) { this.boundingBoxStyle = "redsquare"; }
            else { this.boundingBoxStyle = "greensquare"; }
        },
        move: function(xDist, yDist)
        {
            this.x += xDist;
            this.y += yDist;
        },
        drawStatus: function(object)
        {
            this.statusSize = ctx.measureText(this.printableStatus);
            ctx.font = 8;
            ctx.fillText(
                object.printableStatus,                                               //text
                getGfxCoordsX(object.x + (object.width / 2) - (this.statusSize.width / 2)),  //x position
                getGfxCoordsY(object.y + object.height + 5),                                           //y position
                object.printableStatus.length * 8                                              //max column width
            );
        },
        drawName: function(object)
        {
            this.nameSize = ctx.measureText(this.printableName);
            ctx.font = 8;
            ctx.fillText(
                this.printableName,                                               //text
                getGfxCoordsX(object.x + (object.width / 2) - (object.nameSize.width / 2)),  //x position
                getGfxCoordsY(object.y - 20),                                           //y position
                object.printableName.length * 8                                              //max column width
            );
            if(this.bucketLabelOn)
            {
                this.bucketLabel = "buckets: " + this.buckets.toString();
                this.bucketLabelSize = ctx.measureText(this.bucketLabel);
                ctx.fillText(
                    this.bucketLabel,                                               //text
                    getGfxCoordsX(object.x + (object.width / 2) - (object.bucketLabelSize.width / 2)),  //x position
                    getGfxCoordsY(object.y - 40),                                           //y position
                    this.bucketLabel.length * 8                                              //max column width
                );
            }
        },
        performCurrentAction: function()
        {

        }
    };
    return square;
}

function drawObjects(obs)
{
    ctx.strokeStyle='black';
    //don't multiply the el width by map scale too, unless you want things to shift to the upper left/lower right
    var objectsToDraw = objects;

    for(var x = 0; x < objectsToDraw.length; x++)
    {
        if(objectsToDraw[x].boundingBoxOn){
            objectsToDraw[x].drawBoundingBox();
            ctx.drawImage(canvasCache[objectsToDraw[x].boundingBoxStyle], 0, 0, objectsToDraw[x].width, objectsToDraw[x].height,
                            getGfxCoordsX(objectsToDraw[x].x),    // convert
                            getGfxCoordsY(objectsToDraw[x].y),
                            Math.floor(objectsToDraw[x].width  * map.scale),
                            Math.floor(objectsToDraw[x].height * map.scale));

        }
        ctx.drawImage(canvasCache[objectsToDraw[x].cachedImage], 0, 0, objectsToDraw[x].width - 1, objectsToDraw[x].height - 1,
                                getGfxCoordsX(objectsToDraw[x].x),    // convert
                                getGfxCoordsY(objectsToDraw[x].y),
                                Math.floor(objectsToDraw[x].width  * map.scale),
                                Math.floor(objectsToDraw[x].height * map.scale));
        ctx.beginPath();
        if(objectsToDraw[x].sentient)
        {
            objectsToDraw[x].drawStatus(objectsToDraw[x]);
        }
        objectsToDraw[x].drawName(objectsToDraw[x]);
    }
    ctx.stroke();
    drawHUD();
}

function updateGraphics()
{
    ctx.clearRect(0, 0, el.width, el.height);
    //initialize HUD variables
    refreshHUD();
    //save context now
    ctx.save();
    ctx.beginPath();
    ctx.rect(hud.leftBorderX1, hud.leftBorderY1, el.width - hud.buffer*2, el.height - hud.buffer*2);
    ctx.clip();
    drawBorders();
    drawObjects(); // squares

    if(hud.enabled){drawStatistics();};
}


/*#################*/
/*   E N G I N E   */
/*#################*/
/*
    -input
    -HUD variables
    -spatial hash table
    -loop
*/
/* I N P U T */

function objectsIdentical(object1, object2)
{
    var keys1 = Object.keys(object1);
    for(var x = 0; x < keys1.length; x++)
    {
        if(object1[keys1[x]] === object2[keys1[x]])
        {
            continue;
        }
        else
        {
            return false;
        }
    }
}

function switchWithLastIndex(array, index)
{
    if(index < array.length - 1){ array.push(array.splice(index, 1)[0]); }
    for(var x = index; x < array.length; x++)
    {
        array[x].index = x;
    }
}

function leftMouseUp()
{
    var clickedObject = detectObjectClicked();
    if(state.controls.mouse.clicked !== 0)
    {
        state.controls.mouse.clicked.draggedX = 0;
        state.controls.mouse.clicked.draggedY = 0;
        state.controls.mouse.clicked.clicked  = false;
        state.controls.mouse.clicked.moving   = false;
        state.controls.mouse.clicked.moved    = false;
        if(clickedObject) { updateObjectInTable(clickedObject); }
        state.controls.mouse.clicked = 0;
    }

    //do something here when we have object tracking data structure set up
    return 1;
}

function deleteSpawnMenu()
{

    for (var x = 0; x < hud.menu.items.length; x++)
    {
        removeObjectFromTable(hud.menu.items[x]);
    }

    hud.menu.items = [];
    hud.menu.rightClickMenu = 0;
}

function leftMouseDown()
{
    if(state.controls.mouse.clicked == 0)
    {
        state.controls.mouse.clicked = detectObjectClicked();
        if(state.controls.mouse.clicked.type === "square")
        {
            if(state.controls.mouse.clicked.characterType)
            {
                switchWithLastIndex(objects, state.controls.mouse.clicked.index);
            }
            else
            {
                switchWithLastIndex(objects.inanimate, state.controls.mouse.clicked.index);
            }
        }
        else if (state.controls.mouse.clicked.type === "button")
        {
            state.controls.mouse.clicked.action();
        }
    }
    if(state.controls.mouse.clicked !== 0)
    {
        state.controls.mouse.clicked.clicked = true;
    }
    if(hud.menu.items.length > 0) { deleteSpawnMenu(); }
    return 1;
}

function rightMouseDown()
{
    // console.log(JSON.stringify(detectObjectClicked()));
    if(hud.menu.items.length > 1) { deleteSpawnMenu(); }
    var monkey = detectObjectClicked();
    if(monkey.entitified)
    {
        printEntityInfo(monkey);
        print = "object#"+monkey.index;
    }
    else
    {
        var print = monkey !== 0 ? "object#" + monkey.index : "nothing."
    }
    // console.log("Clicked: " + print);
    return 1;
}

function spaceUp()
{
    togglePause();
    return 1;
}

function escUp()
{
    printHTMembers();
    printHTBuckets();
    return 1;
}

function handleInput()
{
    state.x = 0;
    for(var i = 0; i < state.input.length; i++)
    {
        var activity = state.inactive;
        //functions here must return an integer (1 or 0 are preferred) for activity tracking purposes
        state.x +=
            state.input[i] == "resize"         ? fitElementSize() :
            state.input[i] == "leftmouseup"    ? leftMouseUp()        :
            state.input[i] == "leftmousedown"  ? leftMouseDown() :
            state.input[i] == "rightmouseup"   ? 1 :
            state.input[i] == "rightmousedown" ? rightMouseDown() :
            state.input[i] == "mousewheelup"   ? 1 /*zoomOut() */  :
            state.input[i] == "mousewheeldown" ? 1 /*zoomIn()*/    :
            state.input[i] == "mousewheelup"   ? 1 /*zoomOut()*/        :
            state.input[i] == "mousewheeldown" ? 1 /*zoomIn()*/         :
            state.input[i] == "leftdown"       ? 1 :
            state.input[i] == "leftup"         ? 1 :
            state.input[i] == "rightdown"      ? 1 :
            state.input[i] == "rightup"        ? 1 :
            state.input[i] == "downdown"       ? 1 :
            state.input[i] == "downup"         ? 1 :
            state.input[i] == "upup"           ? 1 :
            state.input[i] == "updown"         ? 1 :
            state.input[i] == "spacedown"      ? 1 :
            state.input[i] == "spaceup"        ? spaceUp() :
            state.input[i] == "escup"          ? 1 :
            state.input[i] == "escdown"        ? 1 :
            state.input[i] == "touchdown"      ? leftMouseDown() :
            state.input[i] == "touchup"        ? leftMouseUp() :
            state.input[i] == "shiftup"        ? escUp() :
            state.input[i] == "shiftdown"      ? 1 : 0;
    }

    state.objectClicked = state.controls.mouse.clicked && state.controls.mouse.clicked.type === "square" && state.controls.mouse.leftmousedown;
    state.menuClicked = state.controls.mouse.clicked && state.controls.mouse.clicked.type === "button" && state.controls.mouse.leftmousedown;
    state.mapClicked = state.controls.mouse.clicked === undefined || state.controls.mouse.clicked === 0 && state.controls.mouse.leftmousedown;
    if(state.input.includes("leftmousedown") && state.controls.mouse.leftmousedown)
    {
        if(state.objectClicked)
        {
            state.controls.mouse.clicked.draggedX = getEngCoordsX(state.controls.mouse.x);
            state.controls.mouse.clicked.draggedY = getEngCoordsY(state.controls.mouse.y);
        }
        else if(state.mapClicked)
        {
            map.draggedX = state.controls.mouse.x;
            map.draggedY = state.controls.mouse.y;
            state.x++;
        }
    }

    else if (state.controls.mouse.leftmousedown)
    {
        if(state.objectClicked)
        {
            state.controls.mouse.clicked.x -= Math.floor(state.controls.mouse.clicked.draggedX - getEngCoordsX(state.controls.mouse.x));
            state.controls.mouse.clicked.draggedX = getEngCoordsX(state.controls.mouse.x);
            state.controls.mouse.clicked.y -= Math.floor(state.controls.mouse.clicked.draggedY - getEngCoordsY(state.controls.mouse.y));
            state.controls.mouse.clicked.draggedY = getEngCoordsY(state.controls.mouse.y);
            state.controls.mouse.clicked.moving = true;
            state.controls.mouse.clicked.moved  = true;
            updateObjectInTable(state.controls.mouse.clicked);
        }
        else if(state.mapClicked)
        {
            map.focusPoint.x   -= Math.floor(map.draggedX - state.controls.mouse.x);
            map.draggedX        = state.controls.mouse.x;
            map.focusPoint.y   -= Math.floor(map.draggedY - state.controls.mouse.y);
            map.draggedY        = state.controls.mouse.y;
        }
        state.x++;
    }

    if(state.input.includes("leftmouseup"))
    {
        map.draggedX = 0;
        map.draggedY = 0;
        state.objectClicked = false;
        state.mapClicked = false;
        state.menuClicked = false;
    }

    if(state.input.includes("rightmouseup"))
    {
        if(hud.menu.rightClickMenu)
        {
            deleteSpawnMenu();
        }
        else
        {
            makeSpawnMenu();
        }
    }

    if(state.controls.rightdown){ map.focusPoint.x -= Math.floor(map.moveSpeedX / map.scale); state.x++; }
    if(state.controls.leftdown) { map.focusPoint.x += Math.floor(map.moveSpeedX / map.scale); state.x++; }
    if(state.controls.updown)   { map.focusPoint.y += Math.floor(map.moveSpeedY / map.scale); state.x++; }
    if(state.controls.downdown) { map.focusPoint.y -= Math.floor(map.moveSpeedY / map.scale); state.x++; }

    if(state.x > 0) { state.inactive = 0; } else {state.inactive++;}
    state.input = [];
}

var engine = {};


function makeSpawnMenu()
{
    var menuY = state.controls.mouse.y,
    menuX = state.controls.mouse.x;
    hud.menu.rightClickMenu = {};
    hud.menu.rightClickMenu.x = getEngCoordsX(state.controls.mouse.x);
    hud.menu.rightClickMenu.y = getEngCoordsY(state.controls.mouse.y);
    hud.menu.rightClickMenu.person = {
            type: "button",
            name: "Spawn Davey",
            x: menuX,
            y: menuY,
            width: 100,
            height: 20,
            action: function() {
                makePlacedDavey(hud.menu.rightClickMenu.x,
                                hud.menu.rightClickMenu.y);
            }
        };
    hud.menu.rightClickMenu.apple = {x: menuX,
        type: "button",
        name: "Spawn Apple",
        y: menuY + hud.menu.fontSize,
        width: 100,
        height: 20,
        action: function()
        { makePlacedApple(hud.menu.rightClickMenu.x,
                          hud.menu.rightClickMenu.y);
        }
    };
    addObjectToTable(hud.menu.rightClickMenu.apple);
    addObjectToTable(hud.menu.rightClickMenu.person);

    hud.menu.items.push(hud.menu.rightClickMenu.apple);
    hud.menu.items.push(hud.menu.rightClickMenu.person);
}

function togglePause() { if(engine.paused) { engine.paused = false; } else { engine.paused = true; } }

function refreshEngineVariables()
{
    engine.running = true;
    engine.frame = 0;
    engine.framerate = 0;
    engine.framepoll = 0;
    engine.framepollperiod = 5;
    engine.frameratereporting = true;
    engine.pause = false;
}

function calculateFrameRate()
{
    if(engine.frame % engine.framepollperiod == 0)
    {
        engine.framerate = 1000 / (engine.framepoll / engine.framepollperiod);
        engine.framepoll = 0;
    }
    else
    {
        engine.framepoll += engine.frameLength;
    }
}
/* H U D */
function initializeHUD()
{
    hud.statLabels = [];

    //line attributes
    hud.lineCap =   "round";
    hud.lineJoin =  "round";
    hud.lineWidth = 3.0;

    //item font settings
    hud.statItemFontSize = 14;
    hud.statItemFontStyle = "sans-serif"
    hud.statItemFont = hud.statItemFontSize + "px " + hud.statItemFontStyle;
    //header font settings
    hud.statHeaderFontSize = 18;
    hud.statHeaderFontStyle = "sans-serif"
    hud.statHeaderFont = "bold " + hud.statHeaderFontSize + "px " + hud.statHeaderFontStyle;
    //subheader font settings
    hud.statSubHeaderFontSize = 16;
    hud.statSubHeaderFontStyle = "sans-serif"
    hud.statSubHeaderFont = "italic " + hud.statHeaderFontSize + "px " + hud.statHeaderFontStyle;

    hud.statTextAlign = "left";
    hud.statTextBaseline = "top";

    fitElementSize();
    refreshHUD();

    //set labels
    addStatToHud({"text": "     E N G I N E", "value": function() {return "";}, style: "subheader"});
    addStatToHud({"text": "framerate: ", "value": function() {return engine.framerate + " FPS";}, style: "item" });
    addStatToHud({"text": "Frames inactive: ", "value": function() {return state.inactive + " frames";}, style: "item" });
    addStatToHud({"text": "state.x: ", "value": function() {return state.x;}, style: "item" });
    addStatToHud({"text": "paused: ", "value": function() {return engine.paused;}, style: "item" });
    addStatToHud({"text": "     I N P U T", "value": function() {return "";}, style: "subheader" });
    addStatToHud({"text": "focusPointXGfx:", "value": function() {return getGfxCoordsX(map.focusPoint.x);}, style: "item" });
    addStatToHud({"text": "focusPointYGfx:", "value": function() {return getGfxCoordsY(map.focusPoint.y);}, style: "item" });
    addStatToHud({"text": "      M A P", "value": function() {return "";}, style: "subheader" });
    addStatToHud({"text": "focusX: ", "value": function() {return map.focusPoint.x;}, style: "item" });
    addStatToHud({"text": "focusY: ", "value": function() {return map.focusPoint.y;}, style: "item" });
    addStatToHud({"text": "el.middleX: ", "value": function() {return el.middleX;}, style: "item" });
    addStatToHud({"text": "el.middleY: ", "value": function() {return el.middleY;}, style: "item" });
    addStatToHud({"text": "map.scale: ", "value": function() {return map.scale;}, style: "item" });
    addStatToHud({"text": "mouse.x: ", "value": function() {return state.controls.mouse.x;}, style: "item" });
    addStatToHud({"text": "engineMouseX: ", "value": function() {return getEngCoordsX(state.controls.mouse.x);}, style: "item" });
    addStatToHud({"text": "mouse.y: ", "value": function() {return state.controls.mouse.y;}, style: "item" });
    addStatToHud({"text": "engineMouseY: ", "value": function() {return getEngCoordsY(state.controls.mouse.y);}, style: "item" });
    addStatToHud({"text": "mouseHash: ", "value": function() {return state.controls.mouse.hash;}, style: "item" });

    hud.menu = {};
    hud.menu.button = {x: 0, y: 0, width: 100, height: 20 };
    hud.menu.open = false;
    hud.menu.button.type = "button";

    hud.menu.items = [];                    //for storing HUD button references to check clicks
}

/* S P A T I A L  H A S H  T A B L E */

/*
    - REQUIRED OBJECTS AND PROPERTIES -

*/
var collisionObjectsToUpdate = [];

function updateCollisionObjects()
{
    var updated = [];
    for(var x = 0; x < collisionObjectsToUpdate.length; x++)
    {
        collisionObjectsToUpdate[x].collisions = getCollisions(collisionObjectsToUpdate[x]);
        updateObjectInTable(collisionObjectsToUpdate[x]);
        updated.push(collisionObjectsToUpdate[x].index);
    }

    collisionObjectsToUpdate = [];
    return updated;
}

function initializeHashTable()
{
    engine.ht = {};
    let ht = engine.ht;
    ht.cellsize = 100;
    ht.buckets = [];
    ht.members = [];
    updateTable();
}

function hash(x, y){ return Math.round(x/engine.ht.cellsize) + "," + Math.round(y/engine.ht.cellsize); }

function updateObjectInTable(object)
{
    var oldArray = object.buckets,
        newArray = getObjectBuckets(object);
    if(!arraysIdentical(oldArray, newArray))
    {
        removeObjectFromTable(object);
        addObjectToTable(object);
    }
    var bucketsToUpdate = oldArray;
    bucketsToUpdate = bucketsToUpdate.concat(newArray.filter( x => oldArray.indexOf(x) == -1 ));
    for(var x = 0; x < bucketsToUpdate.length; x++) { flagBucketForUpdate(bucketsToUpdate[x]); }
}

function updateTable()
{
    //for all tracked objects, check to see if they've moved

    //if they have, reassign hash values and reinsert into hashtable
}

function getObjectBuckets(object)
{
    object.minX = object.x,
    object.minY = object.y,
    object.maxX = object.x + object.width,
    object.maxY = object.y + object.height,
        buckets = [];
    for(; object.minX <= object.maxX; object.minX += engine.ht.cellsize)
    {
        for(var y = object.minY; y <= object.maxY; y += engine.ht.cellsize)
        {
            var h = hash(object.minX, y);
            if(buckets.indexOf(h) < 0)
            {
                buckets.push(h);
            }
        }
        var h = hash(object.minX, object.maxY);
        if(buckets.indexOf(h) < 0)
        {
            buckets.push(h);
        }
    }
    for(; object.minY < object.maxY; object.minY += engine.ht.cellsize)
    {
        var h = hash(object.maxX, object.minY);
        if(buckets.indexOf(h) < 0)
        {
            buckets.push(h);
        }
    }
    var h = hash(object.maxX, object.maxY);
    if(buckets.indexOf(h) < 0)
    {
        buckets.push(h);
    }
    return buckets;
}

function arraysIdentical(array1, array2)
{
    if(array1.length === array2.length)
    {
        for(var x = 0; x < array1.length; x++)
        {
            if(array1[x] !== array2[x])
            {
                return false;
            }
        }
    }
    else
    {
        return false;
    }
    return true;
}

function addObjectToTable(object)
{
    //NOTE: A LOT of expensive work here for no reason.
    //What does this really need to do?
    //a) get minX and minY
    //b) get maxX and maxY
    //c) divide each by hashtable cellsize and round
    //d) for each possible bucket between min and max, insert the hash
    var buckets = getObjectBuckets(object);
    if(engine.ht.members.indexOf(object) < 0) { engine.ht.members.push(object); }
    for(var z = 0; z < buckets.length; z++)
    {
        if(engine.ht.buckets[buckets[z]] === undefined)
        {
            engine.ht.buckets[buckets[z]] = [];
            engine.ht.buckets[buckets[z]].push(object);
        }
        else if(engine.ht.buckets[buckets[z]])
        {
            //if the bucket already contains the object reference, don't add a duplicate
            var duplicate = false;
            for (var x = 0; x < engine.ht.buckets[buckets[z]].length; x++)
            {
                if( engine.ht.buckets[buckets[z]][x] === object) {duplicate = true; break; }
            }
            if(!duplicate)
            {
                engine.ht.buckets[buckets[z]].push(object);
            }
        }
    }
    object.buckets = buckets;
    return { "buckets": object.buckets };
}

function printHTMembers() { console.log(engine.ht.members); }
function printHTBuckets() { console.log(engine.ht.buckets); }

function removeObjectFromTable(object)
{
    engine.ht.members.splice(engine.ht.members.indexOf(object), 1);
    for(var x = 0; x < object.buckets.length; x++)
    {
        let len = engine.ht.buckets[object.buckets[x]].length;
        for(var y = 0; y < len; y++)
        {
            if(engine.ht.buckets[object.buckets[x]][y] === object)
            {
                engine.ht.buckets[object.buckets[x]].splice(y, 1);
                flagBucketForUpdate(object.buckets[x]);
            }
        }
    }

    var oldBuckets = object.buckets.slice();
    var oldCollisions;
    if(object.collisions) { oldCollisions = object.collisions.slice();}
    object.buckets = [];
    object.collisions = [];
    return {'buckets': oldBuckets };
}

function detectCollision(object1, object2)
{
    return (object1.x <= object2.x + object2.width &&
            object1.x + object1.width >= object2.x &&     //minX coord is in range
            object1.y <= object2.y + object2.height &&
            object1.y + object1.height >= object2.y);        //minY coord is in range
}

function hasCollision(object, a)
{
    for(var x = 0; x < object.collisions.length; x++)
    {
        if(object.collisions[x][0] === a[0] && object.collisions[x][1] === a[1])
        {
            return true;
        }
    }
    return false;
}

function detectObjectClicked()
{
    // debugger;
    var h = state.controls.mouse.hash;

    var result;
    var potentials = hud.menu.items;
    // console.log("Mouse coords: " + state.controls.mouse.x + ", " + state.controls.mouse.y);
    // console.log("Potentials: " + JSON.stringify(potentials));
    for(let x = 0; x < hud.menu.items.length; x++)
    {
        if(
            state.controls.mouse.x >= potentials[x].x &&
            state.controls.mouse.x <= potentials[x].x + potentials[x].width &&
            state.controls.mouse.y >= potentials[x].y &&
            state.controls.mouse.y <= potentials[x].y + potentials[x].height
        )
        {
            return hud.menu.items[x];
            // console.log("Result found: " + JSON.stringify(result));
            //togglePause();
        }
    }

    if(engine.ht.buckets[h] === undefined) { return 0; }
    potentials = engine.ht.buckets[h];

    for(let x = 0; x < potentials.length; x++)
    {
        if( getEngCoordsX(state.controls.mouse.x) >= potentials[x].x &&
            getEngCoordsX(state.controls.mouse.x) <= potentials[x].maxX &&
            getEngCoordsY(state.controls.mouse.y) >= potentials[x].y &&
            getEngCoordsY(state.controls.mouse.y) <= potentials[x].maxY)
        {
            result = potentials[x];
        }
    }
    if(result === undefined){ return 0; }
    else { return result; }
}

function checkArrayForMemberWithProperty(type, array)
{
    for(var x = 0; x < array.length; x++)
    {
      if(array[x][type])
      {
        return array[x];
      }
    }
    return 0;
}

function resetArrayMemberIndexes(array) { for(x = 0; x < array.length; x++) { array[x].index = x; } }
// function deleteArrayMemberByIndex(object, array)
// {
//     array.splice(object.index, 1);
//     resetArrayMemberIndexes(array);
// }

function flagBucketForUpdate(hash)
{
    var toUpdate = engine.ht.buckets[hash];
    if(toUpdate !== undefined)
    {
        for(var x = 0; x < toUpdate.length; x++)
        {
            if(collisionObjectsToUpdate.indexOf(toUpdate[x]) < 0)
            {
                collisionObjectsToUpdate.push(toUpdate[x]);
            }
        }
    }
    else { return false; }
    return true;
}

function getCollisions(object)
{
    var neighbors = [];
    var collisions = [];
    var currentlyColliding = false;
    for(var bucket = 0; bucket < object["buckets"].length; bucket++)
    {
        let bucketNeighbors = engine.ht.buckets[object.buckets[bucket]];
        if(!bucketNeighbors.length)
        {
            continue;
        }
        for(var friend = 0; friend < bucketNeighbors.length; friend++)
        {
            if(bucketNeighbors[friend] !== object && neighbors.indexOf(bucketNeighbors[friend]) < 0)
            {
                neighbors.push(bucketNeighbors[friend]);
            }
        }
    }

    for(var x = 0; x < neighbors.length; x++)
    {
        var rect = neighbors[x];
        var hit = rect.index;
        if (detectCollision(object, rect))
        {
            currentlyColliding = true;
            if(object.collisions.indexOf(hit) < 0)
            {
                object.collisions.push(hit);
                collisions.push(rect);
            }
        }
    }

    if(!currentlyColliding) { object.collisions = []; }
    return collisions;
}

//returns integer version of the bucket coords built into an object
function getBucketCoords(/*string*/bucket) { return {x: bucket.split(",")[0] * 1, y: bucket.split(",")[1] * 1 }; }

/* L O O P */

function initializeEngine()
{
    initializeMap();
    initializeHUD();
    initializeHashTable();
    refreshEngineVariables();
    createEventListeners();
    engine.frameLengthPreferred = 20;
    engine.timer = window.setTimeout(loop, engine.frameLength);
}

function letEntitiesThink(number)
{
    for (x = 0; x < objects.length; x++)
    {
        if(objects[x].sentient)
        {
            seeLocalObjects(objects[x], objects[x].viewDistance);
            if(engine.frame % 300 == 0) { deteriorateTraits(objects[x]); }
        }
    }
}

function letEntitiesAct(number)
{
    for(x = 0; x < objects.length; x++)
    {
        if(objects[x].sentient)
        {
            if(!act(objects[x]))
            {
                objects[x].printableStatus = "Idle";
            }
        }
    }
}

function updateEntities(number)
{
    var flagForDeath = [];
    for(x = 0; x < objects.length; x++)
    {
        if(objects[x].sentient && objects[x].status.hunger < 1)
        {
            console.log(objects[x].printableName + " has died of starvation.");
            flagForDeath.push(objects[x]);
        }
    }

    for(var y = 0; y < flagForDeath.length; y++)
    {
        killEntity(flagForDeath[y]);
    }
}

function spawnRandomApples()
{
    if(numApples < 30)
   { let apples = 0;
       for(var num = Math.floor(Math.random() * 5); num > 0; num--)
       {
           makeApple();
           apples++;
       }
       numApples += apples;
   }
   else
   {
        console.log("Too many apples. Cancelling apple spawn.")
   }
}

function loop()
{
    engine.beginning = new Date().getTime();
    handleInput();
    if(!engine.paused)
    {
        engine.frame++;
        updateEntities(10);
        letEntitiesThink(10);
        letEntitiesAct(10);
        if(engine.frame % 500 === 0) { spawnRandomApples(); }
    }
    if(collisionObjectsToUpdate[0]) { updateCollisionObjects(); }
    updateGraphics();
    if(engine.running)
    {
        engine.diff = new Date().getTime() - engine.beginning - engine.frameLengthPreferred;
        engine.frameLength = engine.diff < 0 ? engine.frameLengthPreferred : engine.frameLengthPreferred + engine.diff;
        calculateFrameRate();
        window.setTimeout(loop, engine.frameLength);
    }
};

initializeEngine();
resetMap();