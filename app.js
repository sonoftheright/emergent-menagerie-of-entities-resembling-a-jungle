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
        mouse: {
            x: 0,
            y: 0,
            wheel: {
                delta: 0
            }
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
    });
    /* mouse movement listeners */
    window.addEventListener('mousemove', function (event)
    {
        var pos = findPos(el);
        state.controls.mouse.x = event.pageX - pos.x - hud.buffer;
        state.controls.mouse.y = event.pageY - pos.y - hud.buffer;
        // console.log("mouse.x: " + state.controls.mouse.x);
        // console.log("mouse.y: " + state.controls.mouse.y);
    });
    /*TODO: (Ben) Set up a zoom function with graphics scale to match.*/
    window.addEventListener('wheel', function (event)
    {
        //console.log(event.deltaY);
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
    });
    //more widely supported event listener linked to canvas rather than window
    //TODO: (Ben) Figure out how to establish right-click functionality
    el.addEventListener('mousedown', function (event)
    {
        var keyPressed = event.which;
        //NOTE: event.keyCode for left mouse button is 1, middle 2, right 3
        if (keyPressed === 1)
        {
            //TODO: (Ben) Do something real here.
            state.input.push("leftmousedown");
            state.controls.mouse.leftmousedown = true;
        }
        if (keyPressed === 3)
        {
            state.input.push("rightmousedown");
            state.controls.mouse.rightmousedown = true;
        }
    });
    window.addEventListener('mouseup', function (event)
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
    });
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
    });
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
    });
}

/*###########*/
/*   M A P   */
/*###########*/

var map = {};

function initializeMap()
{
    map.focusPoint   = {};
    map.focusPoint.x = 0.0;
    map.focusPoint.y = 0.0;
    map.moveSpeedX   = 5;
    map.moveSpeedY   = 5;
    map.scale = 1.0;
}
initializeMap();

function refreshMap()
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
hud.disable = function(){hud.enabled = false;}
hud.enable = function(){hud.enabled = true;}

function refreshHUD()
{
    fitElementSize();
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

function newSquare (){
return {
    x: 0,
    y: 0,
    height: 10,
    width: 10
    };
}
function newSquare2(){
return {
    x: 20,
    y: 20,
    height: 10,
    width: 10
    };
}

objects.push(newSquare());
objects.push(newSquare2());

function drawObjects(obs)
{
    ctx.strokeStyle="black";
    //if(!)
    //don't multiply the el width by map scale too, unless you want things to shift to the upper left/lower right
    for(var x = 0; x < objects.length; x++)
    {
        ctx.rect(
            el.middleX + (map.focusPoint.x + objects[x].x) * map.scale,
            el.middleY + (objects[x].x + map.focusPoint.y) * map.scale,
            objects[x].width  * map.scale,
            objects[x].height * map.scale);
    }
}

function drawScene()
{
    //initialize HUD variables
    refreshHUD();
    //draw the objects first so other things overlap them
    ctx.beginPath();
    drawObjects(); // squares
    ctx.stroke();
    //begin path for all hud
    ctx.beginPath();
    drawBorders();
    //stroke all line based hud els
    ctx.stroke();


    if(hud.enabled){drawStatistics()};

}

function updateGraphics()
{
    ctx.clearRect(0, 0, el.width, el.height);
    drawScene();
}


/*#################*/
/*   E N G I N E   */
/*#################*/

/* I N P U T */

function mouseUp()
{
	//do something here when we have object tracking data structure set up
	return 1;
}

function zoomIn()
{
    var factor = 1.05;// * state.controls.mouse.wheel.delta;
    map.scale *= factor;
    //map.focusPoint.x *= factor;
    //map.focusPoint.x += (el.middleX - state.controls.mouse.x) / (map.scale * map.scale);
    //map.focusPoint.y *= factor;
    //map.focusPoint.y += (el.middleY - state.controls.mouse.y) / (map.scale * map.scale);
    return 1;
}

function zoomOut()
{
    if(map.scale > 0.005)
    {
        var factor = 0.95;// state.controls.mouse.wheel.delta;
        map.scale *= factor;
        //map.focusPoint.x *= factor;
        //map.focusPoint.x += (el.middleX - state.controls.mouse.x) / (map.scale);
        //map.focusPoint.y *= factor;
        //map.focusPoint.y += (el.middleY - state.controls.mouse.y) / (map.scale);
    }
    else
    {
        map.scale = 0.005;
    }

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
        	state.input[i] == "resize" ? 			fitElementSize() :
        	state.input[i] == "leftmouseup" ?   	mouseUp() :
        	state.input[i] == "leftmousedown" ? 	1 :
        	state.input[i] == "rightmouseup" ?  	1 :
        	state.input[i] == "rightmousedown" ?	1 :
        	state.input[i] == "mousewheelup" ?  	zoomOut():
        	state.input[i] == "mousewheeldown" ?	zoomIn():
        	state.input[i] == "leftdown" ?        	1 :
        	state.input[i] == "leftup" ?      		1 :
        	state.input[i] == "rightdown" ?       	1 :
        	state.input[i] == "rightup" ?     		1 :
        	state.input[i] == "downdown" ?        	1 :
        	state.input[i] == "downup" ?      		1 :
        	state.input[i] == "upup" ?            	1 :
        	state.input[i] == "updown" ?      		1 :
        	state.input[i] == "spacedown" ?     	1 :
        	state.input[i] == "spaceup" ?       	1 :
        	state.input[i] == "escup" ?         	1 :
        	state.input[i] == "escdown" ?       	1 :
        	state.input[i] == "shiftup" ?			1 :
        	state.input[i] == "shiftdown" ?     	1 : 0;

	}


    if(state.input.includes("leftmousedown") && state.controls.mouse.leftmousedown)
    {
        map.draggedX = state.controls.mouse.x;
        map.draggedY = state.controls.mouse.y;
        state.x++;
    }

    else if (state.controls.mouse.leftmousedown)
    {
        map.focusPoint.x   -= (map.draggedX - state.controls.mouse.x) / map.scale;
        map.draggedX        = state.controls.mouse.x;
        map.focusPoint.y   -= (map.draggedY - state.controls.mouse.y) / map.scale;
        map.draggedY        = state.controls.mouse.y;
        state.x++;
    }

    if(state.input.includes("leftmouseup"))
    {
        map.draggedX = 0;
        map.draggedY = 0;
    }

    if(state.controls.rightdown){ map.focusPoint.x -= map.moveSpeedX / map.scale; state.x++;}
    if(state.controls.leftdown) { map.focusPoint.x += map.moveSpeedX / map.scale; state.x++;}
    if(state.controls.updown)   { map.focusPoint.y += map.moveSpeedY / map.scale; state.x++;}
    if(state.controls.downdown) { map.focusPoint.y -= map.moveSpeedY / map.scale; state.x++;}

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
    // if(engine.frame % 100 == 0 && engine.frameratereporting)
    // {
    // 	console.log("Engine is running at " + engine.framerate + " frames per second.");
    // }
}

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

    refreshHUD();

    //set labels
    addStatToHud({"text": "     E N G I N E", "value": function() {return "";}, style: "subheader"});
    addStatToHud({"text": "framerate: ", "value": function() {return engine.framerate + " FPS";}, style: "item" });
    addStatToHud({"text": "Frames inactive: ", "value": function() {return state.inactive + " frames";}, style: "item" });
    addStatToHud({"text": "state.x: ", "value": function() {return state.x;}, style: "item" });
    addStatToHud({"text": "      H U D", "value": function() {return "";}, style: "subheader" });
    addStatToHud({"text": "columns: ", "value": function() {return hud.statColumns;}, style: "item" });
    addStatToHud({"text": "column width: ", "value": function() {return hud.statColumnWidth.toFixed(2);}, style: "item"});
    addStatToHud({"text": "      M A P", "value": function() {return "";}, style: "subheader" });
    addStatToHud({"text": "focusX: ", "value": function() {return map.focusPoint.x;}, style: "item" });
    addStatToHud({"text": "focusY: ", "value": function() {return map.focusPoint.y;}, style: "item" });
    addStatToHud({"text": "el.middleX: ", "value": function() {return el.middleX;}, style: "item" });
    addStatToHud({"text": "el.middleY: ", "value": function() {return el.middleY;}, style: "item" });
    addStatToHud({"text": "map.scale: ", "value": function() {return map.scale;}, style: "item" });
    addStatToHud({"text": "     I N P U T", "value": function() {return "";}, style: "subheader" });
    addStatToHud({"text": "mouse.x: ", "value": function() {return state.controls.mouse.x;}, style: "item" });
    addStatToHud({"text": "mouse.y: ", "value": function() {return state.controls.mouse.y;}, style: "item" });
}

function initializeEngine()
{
    initializeMap();
    initializeHUD();
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
