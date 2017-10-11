//assets.js

var blueSquare = function(context, width, height)
{
    context.beginPath();
    context.lineWidth = 2.0;
    context.strokeStyle = 'blue';
    context.rect(0, 0, width, height);
    context.stroke();
}

var greenSquare = function(context, width, height)
{
    context.beginPath();
    context.lineWidth = 2.0;
    context.strokeStyle = 'green';
    context.rect(0, 0, width, height);
    context.stroke();
}

var redSquare = function(context, width, height)
{
    context.beginPath();
    context.lineWidth = 2.0;
    context.strokeStyle = 'red';
    context.rect(0, 0, width, height);
    context.stroke();
}

var wokeDavey = function(context, width, height)
{
    var img = new Image(width, height);
    img.onload = function()
    {
        img.width = width;
        img.height = height;
        context.drawImage(img, 0, 0, width, height);
    }
    img.src = 'img/wokedavey.png';
}

var wokeJane = function(context, width, height)
{
    var img = new Image(width, height);
    img.onload = function()
    {
        img.width = width;
        img.height = height;
        context.drawImage(img, 0, 0, width, height);
    }
    img.src = 'img/wokejezebel.png';
}

var wokeBaby = function(context, width, height)
{
    var img = new Image(width, height);
    img.onload = function()
    {
        img.width = width;
        img.height = height;
        context.drawImage(img, 0, 0, width, height);
    }
    img.src = 'img/wokebaby.png';
}

var apple = function(context, width, height)
{
    var img = new Image(width, height);
    img.onload = function()
    {
        img.width = width;
        img.height = height;
        context.drawImage(img, 0, 0, width, height);
    }
    img.src = 'img/wokebaby.png';
}

canvasCache['bluesquare'] = makeCachedImage(50, 50, blueSquare);
canvasCache['redsquare'] = makeCachedImage(50, 50, redSquare);
canvasCache['greensquare'] = makeCachedImage(50, 50, greenSquare);
canvasCache['wokedavey'] = makeCachedImage(50, 50, wokeDavey);
canvasCache['wokejezebel'] = makeCachedImage(50, 50, wokeJane);
canvasCache['wokebaby'] = makeCachedImage(50, 50, wokeBaby);
canvasCache['apple'] = makeCachedImage(10, 10, apple);
