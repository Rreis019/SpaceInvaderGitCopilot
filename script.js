window.addEventListener('DOMContentLoaded', (event) => {
    var canvas = document.getElementById("canvas");
    var ctx = canvas.getContext("2d");

    //call gameloop
    setInterval(function () { GameLoop(ctx); }, 1000 / 60);
});

//Create bullet array
var bullets = [];

//Create Enemys array
var enemys = [];


//Enum KEYS
var KeyCode = {
    W: 87,
    A: 65,
    S: 83,
    D: 68,
    SPACE: 32,
    ENTER: 13
};

//keyboard input
var keys = [];
window.addEventListener('keydown', function (event) {
    keys[event.keyCode] = true;
});

window.addEventListener('keyup', function (event) {
    keys[event.keyCode] = false;
});

function LoadImage(path)
{
    var img = new Image();
    img.src = path;
    return img;
}

class BaseEntity
{
    constructor(x, y, width, height,Image_name)
    {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.image =  LoadImage(Image_name);
    }

    Update(){}
    Draw(ctx)
    {
        //ctx.fillStyle = "red";
        //ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
    }
}


//Spawn enemys on top of the screen randomly
function SpawnEnemys()
{
    //spawn enemy on random X position and top of the screen
    var enemy = new Enemy(Math.random() * canvas.width, 0, 50, 50, "img/Enemy.png");
    enemys.push(enemy);
}


//create class enemy the intherits from baseentity
class Enemy extends BaseEntity
{
    constructor(x, y, width, height,Image_name)
    {
        super(x, y, width, height,Image_name);
        this.speed = 5;
    }

    Update()
    {
        this.y += this.speed;
    }

}

//Create class bullet the intherits from baseentity
class Bullet extends BaseEntity
{
    //constructor speeed
    constructor(x, y, width, height, direction,Image_name)
    {
        super(x, y, width, height,Image_name);
        this.speed = 10;
        this.direction = direction;
    }
    
    Update()
    {
        //kinda inutil visto que player nunca muda de direção
        switch (this.direction)
        {
            case 0:
                this.y -= this.speed;
                break;
            case 1:
                this.x -= this.speed;
                break;
            case 2:
                this.y += this.speed;
                break;
            case 3:
                this.x += this.speed;
                break;
        }
    }
}

SFX_VOLUME = 0.1;

function ToggleSound(id)
{
    //toggle image of button with id
    var img = document.getElementById(id);

    if (SFX_VOLUME == 0)
    {
        SFX_VOLUME = 0.1;
        //set image to on
        img.src = "img/sound_on.png";
    }
    else
    {
        SFX_VOLUME = 0;
        img.src = "img/sound_off.png";

    }
}


//play sound effect with name 
function PlaySound(name)
{
    var audio = new Audio(name);
    //set volume
    audio.volume = SFX_VOLUME;
    
    
    audio.play();
}


//lastshoot
var lastShot = 0;
const CooldownToShoot = 100;

//create class for player
class Player
{


    constructor(x, y, width, height,Image_name)
    {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.image =  LoadImage(Image_name);
        this.score = 0;
        this.life = 3;
    }

    Draw(ctx)
    {
        //ctx.fillStyle = "red";
        //ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
    }

    //Nao deixa o player sair fora do canvas
    OutOfScreen()
    {
        if (this.x < 0)
        {
            this.x = 0;
        }
        if (this.x > canvas.width - this.width)
        {
            this.x = canvas.width - this.width;
        }
        if (this.y < 0)
        {
            this.y = 0;
        }
        if (this.y > canvas.height - this.height)
        {
            this.y = canvas.height - this.height;
        }
    }
    WASD()
    {
        //WASD
        if (keys[KeyCode.W])
        {
            this.y -= 5;
        }
        if (keys[KeyCode.A])
        {
            this.x -= 5;
        }
        if (keys[KeyCode.S])
        {
            this.y += 5;
        }
        if (keys[KeyCode.D])
        {
            this.x += 5;
        }

        this.OutOfScreen();
    }

    Shoot()
    {
        if (keys[KeyCode.SPACE])
        {
            //Cooldown on shoot
            if (Date.now() - lastShot > CooldownToShoot)
            {
                //Create new bullet
                bullets.push(new Bullet(this.x + this.width / 2 - 4, this.y + this.height / 2, 6, 6, 0,"img/bullet.png"));
                //Play sound
                PlaySound("sounds/lasershoot.wav");

                
                
                lastShot = Date.now();
            }

        }
    }

    Update()
    {
        //Move player
        this.WASD();

        //Check if player is out of screen
        this.OutOfScreen();

        this.Shoot();
    }
}

//create player
var player = new Player(0, 0, 50, 50, "img/LocalPlayer.png");



function Update()
{
    player.Update();
    
    //check if the bullet is collinding with the enemy 
    for (var i = 0; i < bullets.length; i++)
    {
        for (var j = 0; j < enemys.length; j++)
        {
            if (bullets[i].x < enemys[j].x + enemys[j].width &&
                bullets[i].x + bullets[i].width > enemys[j].x &&
                bullets[i].y < enemys[j].y + enemys[j].height &&
                bullets[i].y + bullets[i].height > enemys[j].y)
            {
                //remove enemy
                enemys.splice(j, 1);
                //remove bullet
                bullets.splice(i, 1);
                //add score
                player.score += 10;
                //Play sound
                PlaySound("sounds/explosion.wav");
            }
        }
    }
    

    //if enemys is less than 3 spawn enemys
    if (enemys.length < 3)
    {
        SpawnEnemys();
    }
    
    //if the enemys is out of the screen remove them
    for (var i = 0; i < enemys.length; i++)
    {
        if (enemys[i].y > canvas.height)
        {
            enemys.splice(i, 1);
        }
    }

    //if the enemy is collinding with the player remove one life
    for (var i = 0; i < enemys.length; i++)
    {
        if (player.x < enemys[i].x + enemys[i].width &&
            player.x + player.width > enemys[i].x &&
            player.y < enemys[i].y + enemys[i].height &&
            player.y + player.height > enemys[i].y)
        {
            //remove enemy
            enemys.splice(i, 1);
            //remove life
            player.life -= 1;

        }
    }


    //update all bullets
    for (var i = 0; i < bullets.length; i++){
        bullets[i].Update();
    }

    //update all enemys
    for (var i = 0; i < enemys.length; i++)
    {
        enemys[i].Update();
    }


}

function Render(ctx)
{
    //draw space image as background
    ctx.drawImage(LoadImage("img/space.png"), 0, 0, canvas.width, canvas.height);


    
    //draw all bullets
    for (var i = 0; i < bullets.length; i++)
    {
        bullets[i].Draw(ctx);
    }

    //draw all enemys
    for (var i = 0; i < enemys.length; i++)
    {
        enemys[i].Draw(ctx);
    }


    player.Draw(ctx);


    //Draw text
    ctx.font = "30px Arial";
    ctx.fillStyle = "white";
    ctx.fillText("Score: " + player.score, 10, 30);

    //Draw player life
    ctx.fillText("Life: " + player.life, 10, 60);

    if (player.life <= 0)
    {
        console.log("Game Over");
        GameOver(ctx);
    }

  
}

function GameOver(ctx)
{
    ctx.fillStyle = "black";

    //clear canvas with black
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    //draw game over center of the screen
    ctx.fillStyle = "white";
    ctx.font = "50px Arial";
    ctx.fillText("Game Over", canvas.width / 2 - 130, canvas.height / 2);

    //the player score in center of screen
    ctx.font = "30px Arial";
    ctx.fillText("Score: " + player.score, canvas.width / 2 - 50, canvas.height / 2 + 50);

    //draw press enter in center of the screen
    ctx.font = "20px Arial";
    ctx.fillText("Press Enter to Restart", canvas.width / 2 - 95, canvas.height / 2 + 100);


    
    //if enter is pressed restart the game
    if (keys[KeyCode.ENTER])
    {
        //reset the game
        player.score = 0;
        player.life = 3;
        enemys = [];
        bullets = [];
        SpawnEnemys();
    }
}

function GameLoop(ctx)
{
    //Clear the screen
    //ctx.clearRect(0, 0, canvas.width, canvas.height);


    if (player.life > 0)
    {
        //update
        Update();
        //draw
        Render(ctx);
    }
    else {
        GameOver(ctx);
    }
}
