//assets.js

let wokedaveysrc    = 'img/wokedavey.png',
    wokejanesrc     = 'img/wokejezebel.png',
    wokebabysrc     = 'img/wokebaby.png',
    applesrc        = 'img/apple.png',
    treesrc         = 'img/tree.png';

var getImage = function(width, height, context, src)
{
    var img = new Image(width, height);
    img.onload = function()
    {
        img.width = width;
        img.height = height;
        context.drawImage(img, 0, 0, width, height);
    }
    img.src = src;
    return img;
}

function coloredSquare (color)
{
    return function(context, width, height)
    {
        context.beginPath();
        context.lineWidth = 2.0;
        context.strokeStyle = color;
        context.rect(0, 0, width, height);
        context.stroke();
    }
}

canvasCache['bluesquare'] = makeCachedImage(50, 50, coloredSquare('blue'));
canvasCache['redsquare'] = makeCachedImage(50, 50, coloredSquare('red'));
canvasCache['greensquare'] = makeCachedImage(50, 50, coloredSquare('green'));
canvasCache['wokedavey'] = makeCachedImage(50, 50, wokedaveysrc);
canvasCache['wokejezebel'] = makeCachedImage(50, 50, wokejanesrc);
canvasCache['wokebaby'] = makeCachedImage(50, 50, wokebabysrc);
canvasCache['apple'] = makeCachedImage(10, 10, applesrc);
