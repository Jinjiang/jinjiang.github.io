var icon;

function init() {
    // create a new stage and point it at our canvas
    var stage = new Stage(document.getElementById('canvas'));
    
    // create a SpriteSheet using "sprites.png" with a frame size of 100x100
    var spriteSheet  = new SpriteSheet({
        images: ["sprites.png"],
        frames: {width: 100, height: 100}
    });

    // create a BitmapAnimation to display frames from the sprite sheet
    icon = new BitmapAnimation(spriteSheet);

    // append into stage and start animations
    stage.addChild(icon);
    icon.gotoAndPlay(0);
    Ticker.addListener(stage);

    // bind animation events
    icon.tick = tick;
}

function tick() {
    if (icon.currentFrame == 18) {
        icon.currentFrame = 0;
    }
}

init();
