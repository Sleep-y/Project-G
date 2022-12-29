const canvas = document.getElementById("gameCanvas");
let ctx = canvas.getContext("2d");
canvas.width = 512
canvas.height = 770
let canvasPos = getPosition(canvas)

let gameOn = 1

let mouse = { //For mouse tracking
    x: canvas.width / 2,
    y: canvas.height / 1.25
}


class Game {
    constructor(width, height){
        this.width=width
        this.height=height
        this.playerBullets = []
        this.enemyBullets = []
        this.enemies = []
        this.playerScore= 0,
        this.gameOver= false,
        this.spawnCD = 0
        this.player = new Player(this)
        this.ui = new UI(this)
        this.bgIMG = new Image()
        this.bgIMG.src = "assets/darkPurple.png"
        //console.log("Game", this) //JSON.stringify(this)
    }
    update(){
        this.spawnCD++

        if(!this.player.defeated){
            this.playerScore++
        }

        if(this.spawnCD >= 60 && this.enemies.length < 16)
        {
            this.spawnEnemy()
        }

        this.player.update()

        this.playerBullets.forEach(pbullet => {
            pbullet.update()
            this.enemies.forEach(enemInstance => {
                if(this.collisionCheckRect(pbullet, enemInstance)){
                    enemInstance.health -= 1
                    enemInstance.defeatAction()
                    pbullet.deleteFlag = true
                }
            });
        })
        this.playerBullets = this.playerBullets.filter(plbullet => !plbullet.deleteFlag)

        this.enemies.forEach (enemy => {
            enemy.update()
            if(this.collisionCheckCircRect(this.player.hitBox, enemy)){
                enemy.defeated = true
                this.player.getHit()
                //console.log("CircRect Collision: ", this.player.hitBox, enemy)
            }
        })
        this.enemies = this.enemies.filter(enInstances => !enInstances.defeated)

        this.enemyBullets.forEach(ebullet => {
            ebullet.update()
            if(this.collisionCheckCircRect(this.player.hitBox, ebullet)){
                ebullet.deleteFlag = true
                this.player.getHit()
            }
        })
        this.enemyBullets = this.enemyBullets.filter(enbullets => !enbullets.deleteFlag)
    }
    draw(context){
        context.drawImage(this.bgIMG,0,0,this.width,this.height)
        this.ui.draw(context)
        this.player.draw(context)
        this.playerBullets.forEach (pbullet => {
            pbullet.draw(context)
        })
        this.enemies.forEach (enemy => {
            enemy.draw(context)
        })
        this.enemyBullets.forEach (ebullet => {
            ebullet.draw(context)
        })
        if(this.player.defeated) {
            this.ui.drawDefeat(context)
        }
    }
    spawnEnemy(){
        this.randomPick = (Math.random()*100)
        this.randomX = Math.abs((Math.random()*canvas.width+5)-(Math.random()*canvas.width-5))
        this.randomY = -(Math.random()*100)
        this.spawnCD = 0
        if(this.randomPick <= 50)
        {
            this.enemies.push(new Fly(this, this.randomX, this.randomY))
        }
        else if(this.randomPick >= 51 && this.randomPick < 80)
        {
            this.enemies.push(new Dragonfly(this, this.randomX, this.randomY))
        }
        else
        {
            this.enemies.push(new Butterfly(this, this.randomX, this.randomY))
        }
        //console.log("Enemies:", this.enemies)
    }
    collisionCheckRect(ent1, ent2){
        return (
            ent1.x < ent2.x + ent2.width && 
            ent1.x + ent1.width > ent2.x && 
            ent1.y < ent2.y + ent2.height && 
            ent1.y + ent1.height > ent2.y)
    }
    collisionCheckCircRect(circle, rect){
        //let distX = circle.x - (rect.x)
        //let distY = circle.y - (rect.y)

        //Following code is from https://www.jeffreythompson.org/collision-detection/circle-rect.php
        let testX = circle.x;
        let testY = circle.y;

        
        if (circle.x < rect.x){
            testX = rect.x; 
        }               
        else if (circle.x > rect.x+rect.width){
            testX = rect.x + rect.width; 
        }    
        if (circle.y < rect.y){
            testY = rect.y; 
        }              
        else if (circle.y > rect.y+rect.height){
            testY = rect.y + rect.height; 
        }   

        
        let distX = circle.x-testX;
        let distY = circle.y-testY;
        let distance = Math.sqrt( (distX*distX) + (distY*distY) );

        
        if (distance <= circle.radius) {
            //console.log("Collision Check: ", circle, rect, {distX, distY, distance})
            return true;
        }
        return false;

        //console.log("Collision Check: ", circle, rect, {distX, distY})
    }
    newGame(){
        this.player = undefined
        this.ui = undefined

        this.playerBullets = []
        this.enemyBullets = []
        this.enemies = []
        this.playerScore= 0,
        this.gameOver= false,
        this.spawnCD = 0
        this.player = new Player(this)
        this.ui = new UI(this)
    }
}

class UI {
    constructor(game){
        this.game = game
        this.fontSize = 32
        this.fontFamily = "Helvetica"
        this.color = "white"
        this.healthIMG = new Image()
        this.healthIMG.src = "assets/pill_red.png"
    }
    draw(context){
        context.fillStyle = "black"
        context.fillRect(0, 0, canvas.width, 50)

        context.fillStyle = this.color
        context.font = this.fontSize + "px " + this.fontFamily
        context.fillText('Score: ' + this.game.playerScore, 10, 40)

        context.fillStyle = this.color
        context.font = this.fontSize + "px " + this.fontFamily
        context.fillText('Health: ', this.game.width-200, 40)
        context.fillStyle = "blue"
        this.healthX = this.game.width-90
        for (let i = 0; i < this.game.player.health; i++){
            //context.fillRect(this.healthX+28*i, 16, 22, 21)
            context.drawImage(this.healthIMG, this.healthX+28*i, 16)
        }

        //console.log("Drawing UI", {context})
    }
    drawDefeat(context){
        context.fillStyle = "black"
        context.fillRect(0, this.game.height / 2 - 40, this.game.width, 120)
        context.fillStyle = this.color
        context.fillText("Game Over", this.game.width / 2 -80, this.game.height / 2+15)
        context.fillText("Press Spacebar to restart", this.game.width / 2 -170, this.game.height / 2+50)
    }
    drawPause(){
        context.fillStyle = "black"
        context.fillRect(0, this.game.height / 2 - 40, this.game.width, 120)
        context.fillStyle = this.color
        context.fillText("Paused", this.game.width / 2 -80, this.game.height / 2+15)
    }
}

class Player { //Player char
    constructor(game){
        this.game= game
        this.width= 112
        this.height= 75 
        this.sprite = new Image()
        this.sprite.src = "assets/playerShip.png"
        this.x= 0
        this.y= 0
        this.widthBox = this.x + this.width
        this.heighthBox = this.y + this.height
        this.hitBox = { //for hitbox
            x: this.x + this.width,
            y: this.y + this.height,
            radius: 10,
            sAngle: 0,
            eAngle: 2*Math.PI
        }
        this.health = 3
        this.speed = 0.3
        this.shootCD = 0
        this.score = 0
        this.defeated = false
        console.log("Player", this)
    }
    
    update(){
        if(!this.defeated){
            //console.log({mouse, this: this})
            this.shootCD++
            this.dx = mouse.x - this.x
            this.dy = mouse.y - this.y 
            this.distance = Math.sqrt(this.dx*this.dx + this.dy*this.dy)

            if(this.x != mouse.x || this.y != mouse.y){
                this.x += (this.dx - this.width/2) * this.speed
                this.y += (this.dy - this.height/2) * this.speed
                this.hitBox.x = mouse.x
                this.hitBox.y = mouse.y
            }
            if(this.shootCD >= 45){
                this.shoot();
            }
        }
    }
    draw(context){
        if(!this.defeated){
            //console.log("Drawing Player...")
            //context.fillStyle="blue"
            //context.fillRect(this.x,this.y,this.width,this.height)
            context.drawImage(this.sprite, this.x, this.y)
            this.drawHitbox(context)
        }
    }
    drawHitbox(context){
        context.beginPath();
        context.arc(this.x + this.width/2, this.y + this.height/2, this.hitBox.radius,
                    this.hitBox.sAngle, this.hitBox.eAngle);
        context.lineWidth = 5;
        context.strokeStyle = "#FF0000"
        context.stroke();
    }
    shoot(){
        this.shootCD = 0
        //console.log("Player is shooting...", this, this.game.playerBullets)
        this.game.playerBullets.push(new PBullet(this.game, 4,(this.x + (this.width/2)), this.y))
    }
    clickAction(){
        //console.log("Mouse was clicked...")
    }
    getHit(){
        this.health -= 1
        if(this.health<=0){
            this.defeatAction()
        }
        //console.log("You're hit! Health:", this.health)
    }
    defeatAction(){
        this.defeated = true
        this.hitBox.x = -100
        this.hitBox.y = -100
    }
}

//Enemies
class Enemy {
    constructor(game, x, y){
        this.x= 0
        this.y= 0
        this.sprite = new Image()
        this.shootCD = 0
        this.defeated = false
        //console.log({this: game.enemyBullets})
        //console.log("Enemies:", this.game.enemies)
    }
    draw(context){
        //context.fillStyle = "orange"
        //context.fillRect(this.x, this.y, this.width, this.height)
        context.drawImage(this.sprite, this.x, this.y)
    }
    defeatAction(){
        if(this.health <= 0)
        {
            this.defeated = true
            this.game.playerScore += this.score
        }
    }
    deleteSelf(){
        this.defeated = true
    }
}
class Fly extends Enemy { 
    constructor(game, x, y){
        super()
        this.x= x
        this.y= y
        this.game= game
        this.width= 103
        this.height= 84
        this.sprite.src = "assets/fly.png"
        this.health = 1
        this.speed = 2
        this.score = 300
        this.defeated = false
        //console.log("Enemy Stat", this)
        //console.log("Enemies:", this.game.enemies)
    }
    update(){
        this.shootCD++
        this.y += this.speed
        if(this.shootCD >= 3000 && this.game.enemyBullets.length <= 80){
            this.shoot()
        }
        if(this.y > this.game.height){
            this.defeated = true
        }
    }
    shoot(){
        this.shootCD = 0
        //console\.log\("Enemy is shooting\.\.\.", this, this\.game\.enemyBullets\)
        this.game.enemyBullets.push(new EBullet(this.game, 2,(this.x + (this.width/2)), (this.y + (this.height/2))))
    }
}

class Dragonfly extends Enemy  { 
    constructor(game, x, y){
        super()
        this.x= x
        this.y= y
        this.game= game
        this.width= 104
        this.height= 84
        this.sprite.src = "assets/dragonfly.png"
        this.health = 2
        this.speed = 0.75
        this.score = 1500
        //console.log("Enemy Stat", this)
        //console.log("Enemies:", this.game.enemies)
    }
    update(){
        this.shootCD++
        this.y += this.speed
        if(this.shootCD >= 300 && this.game.enemyBullets.length <= 80){
            this.shoot()
        }
        if(this.y > this.game.height){
            this.defeated = true
        }
    }
    shoot(){
        this.shootCD = 0
        //console\.log\("Enemy is shooting\.\.\.", this, this\.game\.enemyBullets\)
        this.game.enemyBullets.push(new EBullet(this.game, 1.15,(this.x + (this.width/2)), (this.y + (this.height/2))))
    }
}

class Butterfly extends Enemy  {
    constructor(game, x, y){
        super()
        this.x= x
        this.y= y
        this.game= game
        this.width= 93
        this.height= 84
        this.sprite.src = "assets/butterfly.png"
        this.health = 3
        this.speed = 0.4
        this.score = 3000
        //console.log("Enemy Stat", this)
        //console.log("Enemies:", this.game.enemies)
    }
    update(){
        this.shootCD++
        this.y += this.speed
        if(this.shootCD >= 350 && this.game.enemyBullets.length <= 80){
            this.shoot()
        }
        if(this.y > this.game.height){
            this.defeated = true
        }
    }
    shoot(){
        this.shootCD = 0
        //console\.log\("Enemy is shooting\.\.\.", this, this\.game\.enemyBullets\)
        this.game.enemyBullets.push(new EBullet(this.game, 0.9,(this.x + (this.width/2)), (this.y + (this.height/2))))
    }
}

//Bullet template
class Bullet {
    constructor(game, x, y){
        this.width = 9
        this.height = 54
        this.hitObject = false
        this.x = x
        this.y = y
        this.sprite = new Image()
        this.deleteFlag = false
    }
    update(){
        this.y += this.speed
        if((this.y > this.game.height && (this.y + this.width) > this.game.height) || (this.y < 0 && (this.y + this.width) < 0))
        {
            this.deleteFlag = true
        }
    }
    draw(context){
        context.drawImage(this.sprite, this.x, this.y)
    }
}

//Affiliations: 0 for strays, 1 for player's, 2 for enemy's
class PBullet extends Bullet {
    constructor(game, speed, x, y){
        super()
        this.sprite.src = "assets/laserBlue.png"
        this.x = x - (this.width/2)
        this.y = y - (this.height/2)
        this.game= game
        this.affiliation = 1
        this.speed = -speed
    }
    /*
    draw(context){
        context.fillStyle="blue"
        context.fillRect(this.x, this.y, this.width, this.height)
    }
    */
}

class EBullet extends Bullet {
    constructor(game, speed, x, y){
        super()
        this.sprite.src = "assets/laserRed.png"
        this.x = x - (this.width/2)
        this.y = y
        this.game= game
        this.affiliation = 2
        this.speed = speed
    }
    /*
    draw(context){
        context.fillStyle="red"
        context.fillRect(this.x, this.y, this.width, this.height)
        //console.log("Drawing Enemy Bullet..", this.game.enemyBullets)
    }
    */
    draw(context){
        //context.save()
        //ctx.rotate(180 * Math.PI / 180) Doesn't work???
        context.drawImage(this.sprite, this.x, this.y)
        //context.restore()
    }
}

//function that helps us get the real position of our mouse in canvas
//Obtains the position of the canvas in our body
//Borrowed from: https://www.kirupa.com/canvas/working_with_the_mouse.htm by Kirupa
function getPosition(el) {
    let xPosition = 0;
    let yPosition = 0;
   
    while (el) {
      if (el.tagName == "BODY") {
        let xScrollPos = el.scrollLeft || document.documentElement.scrollLeft;
        let yScrollPos = el.scrollTop || document.documentElement.scrollTop;
   
        xPosition += (el.offsetLeft - xScrollPos + el.clientLeft);
        yPosition += (el.offsetTop - yScrollPos + el.clientTop);
      } else {
        xPosition += (el.offsetLeft - el.scrollLeft + el.clientLeft);
        yPosition += (el.offsetTop - el.scrollTop + el.clientTop);
      }
   
      el = el.offsetParent;
    }
    return {
      x: xPosition,
      y: yPosition
    };
}


function mouseMove(event){
    //console.log("Tracking mouse... ", {mouse})
    mouse.x = event.clientX - canvasPos.x
    mouse.y = event.clientY - canvasPos.y
}


//canvas.addEventListener("mousemove", mouseMove, false)

function newGame(){

}


const gameInstance = new Game(canvas.width, canvas.height)
function main(){
    
    //console.log("Drawing...")
    ctx.clearRect(0,0,canvas.width,canvas.height)
    canvas.onmousemove = mouseMove
    //canvas.onclick = gameInstance.player.clickAction
    document.addEventListener("keyup", (e) => {
        if(e.code == "Escape" && gameOn == 1){
           gameOn = 2
        }
        else{
            gameOn = 1
        }
        if(e.code == "Space" && gameInstance.player.defeated)
        {
            gameInstance.newGame();   
        }
        console.log(e)
    })

    if(gameOn == 1){
        gameInstance.update()
    }
    
    gameInstance.draw(ctx)
    requestAnimationFrame(main)
}

main()
