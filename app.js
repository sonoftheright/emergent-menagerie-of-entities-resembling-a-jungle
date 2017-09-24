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
            state.controls.mouse.wheel.delta = event.deltaX;
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
        else
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
    }, false);
    el.addEventListener('touchmove', function (event)
    {
        var pos = findPos(el);
        for(var x = 0; x < event.changedTouches.length; x++)
        {
            state.controls.mouse.x = event.changedTouches[x].pageX - pos.x;
            state.controls.mouse.y = event.changedTouches[x].pageY - pos.y;
        }
    }, false);
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

function getGfxCoordsX(engineX) { return map.focusPoint.x + (engineX * map.scale); }
function getGfxCoordsY(engineY) { return map.focusPoint.y + (engineY * map.scale); }

function getEngCoordsX(gfxX) { return ((gfxX - map.focusPoint.x) / map.scale); }
function getEngCoordsY(gfxY) { return ((gfxY - map.focusPoint.y) / map.scale); }

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
var objects = []; //temporary - need more complex data structure later
var smartObjects = [];

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

/*   D R A W I N G   */

function newSquare ( x, y, w, h)
{
    var number = objects.length;
    var square = {
        index: number,
        x: x,
        y: y,
        height: h,
        width: w,
        moved: false,
        collisions: [],
        clicked: false,
        draggedX: 0,
        draggedY: 0,
        buckets: [],
        style: function()
        {
            ctx.beginPath();
            if(this.clicked)
            {
                ctx.strokeStyle = 'blue';
                ctx.lineWidth = 2.0;
            }
            else if(this.collisions.length > 0)
            {
                ctx.strokeStyle = 'red';
                ctx.lineWidth = 2.0;
            }
            else
            {
                ctx.strokeStyle = 'green';
                ctx.lineWidth = 2.0;
            }
            if(this.moved)
            {
                ctx.lineWidth = 20.0;
            }
        }
    };
    return square;
}

function newSmartSquare( x, y, w, h, d, f)
{
    return {
        x: x,
        y: y,
        height: h,
        width: w,
        coordType: d,
        f: f
    };
}

function drawObjects(obs)
{
    ctx.strokeStyle='black';
    //don't multiply the el width by map scale too, unless you want things to shift to the upper left/lower right
    for(var x = 0; x < objects.length; x++)
    {
        ctx.lineWidth = map.scale;
        objects[x].style();
        ctx.rect
        (
            getGfxCoordsX(objects[x].x),    // convert engine coords to graphics context
            getGfxCoordsY(objects[x].y),
            Math.floor(objects[x].width  * map.scale),  // scale the object's subjective size
            Math.floor(objects[x].height * map.scale)
        );
        ctx.clearRect
        (
            getGfxCoordsX(objects[x].x),
            getGfxCoordsY(objects[x].y),
            Math.floor(objects[x].width  * map.scale),  // scale the object's subjective size
            Math.floor(objects[x].height * map.scale)
        );
        ctx.stroke();
    }
    for(var x = 0; x < smartObjects.length; x++)
    {
        smartObjects[x].f();
        if(smartObjects[x].coordType == "eng")
        {
            ctx.rect
            (
                    getGfxCoordsX(smartObjects[x].x),
                    getGfxCoordsY(smartObjects[x].y),
                    Math.floor(smartObjects[x].width * map.scale),
                    Math.floor(smartObjects[x].height * map.scale)
            );
        }
        else
        {
            ctx.rect
            (
                    smartObjects[x].x,                  // draw in coordinates already adjusted to context
                    smartObjects[x].y,
                    smartObjects[x].width * map.scale,  // .. but still scale it.
                    smartObjects[x].height * map.scale
            );
        }
    }
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
    var keys2 = Object.keys(object2);
    if(keys1.length !== keys2.length) { return false; }
    for(var x = 0; x < keys1.length; x++)
    {
        for(var y = 0; y < keys2.length; y++)
        {
            if(object1[keys1[x]] !== object2[keys2[y]])
            {
                return false;
            }
        }
    }
    return true;
}

function switchWithLastIndex(array, index)
{
    if(index < array.length - 1){ array.push(array.splice(index, 1)[0]); }
    for(var x = index; x < objects.length; x++)
    {
        objects[x].index = x;
    }
}

function mouseUp()
{
    if(state.controls.mouse.clicked !== 0)
    {
        state.controls.mouse.moved = true;
        state.controls.mouse.clicked.draggedX = 0;
        state.controls.mouse.clicked.draggedY = 0;
        state.controls.mouse.clicked.clicked = false;
        updateObjectInTable(state.controls.mouse.clicked);
        state.controls.mouse.clicked = 0;
    }

    //do something here when we have object tracking data structure set up
    return 1;
}

function mouseDown()
{
    if(state.controls.mouse.clicked == 0)
    {
        state.controls.mouse.clicked = detectObjectClicked();
        switchWithLastIndex(objects, state.controls.mouse.clicked.index);
    }
    if(state.controls.mouse.clicked !== 0)
    {
        state.controls.mouse.clicked.clicked = true;
    }
}

function rightMouseDown()
{
    // console.log(JSON.stringify(detectObjectClicked()));
    var monkey = detectObjectClicked();
    var print = monkey !== 0 ? "object#" + monkey.index : "nothing."
    console.log("Clicked: " + print);
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
            state.input[i] == "leftmouseup"    ? mouseUp()        :
            state.input[i] == "leftmousedown"  ? mouseDown() :
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
            state.input[i] == "spaceup"        ? 1 :
            state.input[i] == "escup"          ? 1 :
            state.input[i] == "escdown"        ? 1 :
            state.input[i] == "touchdown"      ? mouseDown() :
            state.input[i] == "touchup"        ? mouseUp() :
            state.input[i] == "shiftup"        ? 1 :
            state.input[i] == "shiftdown"      ? 1 : 0;
    }
    if(state.input.includes("leftmousedown") && state.controls.mouse.leftmousedown)
    {
        if(state.controls.mouse.clicked)
        {
            state.controls.mouse.clicked.draggedX = getEngCoordsX(state.controls.mouse.x);
            state.controls.mouse.clicked.draggedY = getEngCoordsY(state.controls.mouse.y);
        }
        else
        {
            map.draggedX = state.controls.mouse.x;
            map.draggedY = state.controls.mouse.y;
            state.x++;
        }
    }

    else if (state.controls.mouse.leftmousedown)
    {
        if(state.controls.mouse.clicked)
        {
            state.controls.mouse.clicked.x -= Math.floor(state.controls.mouse.clicked.draggedX - getEngCoordsX(state.controls.mouse.x));
            state.controls.mouse.clicked.draggedX = getEngCoordsX(state.controls.mouse.x);
            state.controls.mouse.clicked.y -= Math.floor(state.controls.mouse.clicked.draggedY - getEngCoordsY(state.controls.mouse.y));
            state.controls.mouse.clicked.draggedY = getEngCoordsY(state.controls.mouse.y);
            updateObjectInTable(state.controls.mouse.clicked);
        }
        else
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
    }

    if(state.controls.rightdown){ map.focusPoint.x -= Math.floor(map.moveSpeedX / map.scale); state.x++; }
    if(state.controls.leftdown) { map.focusPoint.x += Math.floor(map.moveSpeedX / map.scale); state.x++; }
    if(state.controls.updown)   { map.focusPoint.y += Math.floor(map.moveSpeedY / map.scale); state.x++; }
    if(state.controls.downdown) { map.focusPoint.y -= Math.floor(map.moveSpeedY / map.scale); state.x++; }
    if(state.controls.rightdown){}
    if(state.controls.leftdown) {}
    if(state.controls.updown)   {}
    if(state.controls.downdown) {}

    if(state.x > 0) { state.inactive = 0; } else {state.inactive++;}
    state.input = [];
}

var engine = {};

function refreshEngineVariables()
{
    engine.running = true;
    engine.frame = 0;
    engine.framerate = 0;
    engine.framepoll = 0;
    engine.framepollperiod = 5;
    engine.frameratereporting = true;
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
}

/* S P A T I A L  H A S H  T A B L E */
var collisionObjectsToUpdate = [];

function updateCollisionObjects()
{
    var updated = [];
    for(var x = 0; x < collisionObjectsToUpdate.length; x++)
    {
        collisionObjectsToUpdate[x].collisions = getCollisions(collisionObjectsToUpdate[x]);
        updated.push(collisionObjectsToUpdate[x].index);
    }
    collisionObjectsToUpdate = [];
    return updated;
}

function initializeHashTable()
{
    engine.ht = {};
    let ht = engine.ht;
    ht.cellsize = 50;
    ht.contents = [];
    updateTable();
}

function hash(x, y){ return Math.round(x/engine.ht.cellsize) + "," + Math.round(y/engine.ht.cellsize); }

function updateObjectInTable(object)
{
    var oldData = removeObjectFromTable(objects[object.index]);
    var newData = addObjectToTable(objects[object.index]);
    if(!objectsIdentical(oldData, newData))
    {
        //update all the objects in old buckets
        var bucketsToUpdate = oldData["buckets"];
        bucketsToUpdate = bucketsToUpdate.concat(newData["buckets"].filter( x => oldData["buckets"].indexOf(x) == -1 ));
        for(var x = 0; x < bucketsToUpdate.length; x++)
        {
            flagBucketForUpdate(bucketsToUpdate[x]);
        }
        //update all the new buckets - i.e., all those in new that aren't in old
        // for(var nD = 0; nD < newData["buckets"].length; nD++)
        // {
        //     if(oldData["buckets"][newData["buckets"][nD]] !== undefined)
        //     {
        //         flagBucketForUpdate(newData["buckets"][nD]);
        //     }
        // }
    }
}

function updateTable()
{
    //for all tracked objects, check to see if they've moved

    //if they have, reassign hash values and reinsert into hashtable
}

function addObjectToTable(object)
{
    for(var y = 0; y < object.width; y++)
    {
        for(var z = 0; z < object.height; z++)
        {
            var h = hash(object.x + y, object.y + z);
            if(engine.ht.contents[h] === undefined)
            {
                engine.ht.contents[h] = [];
                engine.ht.contents[h].push(object);
                object.buckets.push(h);
            }
            else if(engine.ht.contents[h])
            {
                //if the bucket already contains the object reference, don't add a duplicate
                var duplicate = false;
                for (var x = 0; x < engine.ht.contents[h].length; x++)
                {
                    if( engine.ht.contents[h][x] === object) {duplicate = true; break; }
                }
                if(!duplicate)
                {
                    engine.ht.contents[h].push(object);
                    object.buckets.push(h);
                }
            }
        }
    }
    return { "buckets": object.buckets, "collisions": object.collisions };
}

function removeObjectFromTable(object)
{
    for(var x = 0; x < object.buckets.length; x++)
    {
        let len = engine.ht.contents[object.buckets[x]].length;
        for(var y = 0; y < len; y++)
        {
            if(engine.ht.contents[object.buckets[x]][y] === object)
            {
                engine.ht.contents[object.buckets[x]].splice(y, 1);
            }
        }
    }
    var oldBuckets = object.buckets.slice();
    var oldCollisions = object.collisions.slice();
    object.buckets = [];
    object.collisions = [];
    return {'buckets': oldBuckets, 'collisions': oldCollisions};
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
    let h = hash(getEngCoordsX(state.controls.mouse.x), getEngCoordsY(state.controls.mouse.y));
    if(engine.ht.contents[h] === undefined) { return 0; }

    let potentials = engine.ht.contents[h];
    let result;
    for(let x = 0; x < potentials.length; x++)
    {
        if( getEngCoordsX(state.controls.mouse.x) >= potentials[x].x &&
            getEngCoordsX(state.controls.mouse.x) <= potentials[x].x + potentials[x].width &&
            getEngCoordsY(state.controls.mouse.y) >= potentials[x].y &&
            getEngCoordsY(state.controls.mouse.y) <= potentials[x].y + potentials[x].height)
        {
            result = potentials[x];
        }
    }
    if(result === undefined){ return 0; }
    else { return result; }
}

function flagBucketForUpdate(hash)
{
    var toUpdate = engine.ht.contents[hash];
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

//TESTING PURPOSES
function getCollisions(object)
{
    var neighbors = [];
    var collisions = [];
    var currentlyColliding = false;
    for(var bucket = 0; bucket < object["buckets"].length; bucket++)
    {
        let bucketNeighbors = engine.ht.contents[object.buckets[bucket]];
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
    object.moved = false;
    return collisions;
}

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

function loop()
{
    engine.frame++;
    engine.beginning = new Date().getTime();
    handleInput();
    updateMap();
    updateTable();
    updateCollisionObjects();
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
for(let x = 0; x < 300; x++)
{
    var nS = newSquare( Math.random()*el.width - map.focusPoint.x,
                        Math.random()*el.height - map.focusPoint.y,
                        Math.floor(Math.random()*50)+5,
                        Math.floor(Math.random()*50)+5);
    nS.maxX = nS.x + nS.width;
    nS.maxY = nS.y + nS.height;
    objects.push(nS);
    addObjectToTable(nS);
}

for(let y = 0; y < objects.length; y++)
{
    collisionObjectsToUpdate.push(objects[y]);
}
