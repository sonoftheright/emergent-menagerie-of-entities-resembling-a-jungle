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

canvasCache['bluesquare'] = makeCachedImage(objects[0].width, objects[0].height, blueSquare);
canvasCache['redsquare'] = makeCachedImage(objects[0].width, objects[0].height, redSquare);
canvasCache['greensquare'] = makeCachedImage(objects[0].width, objects[0].height, greenSquare);
canvasCache['wokedavey'] = makeCachedImage(50, 50, wokeDavey);
