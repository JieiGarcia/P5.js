//Real Time Face Detection in p5.js from https://www.youtube.com/watch?v=3yqANLRWGLo

let faceapi;
let detections = [];
let fireworks = [];
let gravity;
let video;
let canvas;
let gameStarted = false; // ゲームが開始されたかどうかのフラグ

//絵文字-花火の玉として使用する画像
let emojiRandom = 0

function preload() {
  // 画像を読み込む
  chosenImage = loadImage("surprised.png"); // 任意の画像のパス
  sadImage = loadImage("sad.png");
  disgustedImage = loadImage("disgusted.png");
  angryImage = loadImage("angry.png");
  disgustedImage = loadImage("disgusted.png");
  fearImage = loadImage("fear.png");
  happyImage = loadImage("happy.png");
  surprisedImage = loadImage("surprised.png")
}

//雷
let lightningBolt = [];
let lightningTimer = 0;


//以下追加
let neutralG = 0; // neutralの値を保存する変数
let happyG = 0; // happinessの値を保存する変数
let angry = 0; // angerの値を保存する変数
let sadG = 0; // sadの値を保存する変数
let disgustedG = 0; // disgustedの値を保存する変数
let surprisedG = 0; // surprisedの値を保存する変数
let fearfulG = 0; // happinessの値を保存する変数
//花火の発射頻度
let shootingRate = 0.03


function setup() {
  canvas = createCanvas(windowWidth, windowHeight);
  
  colorMode(HSB);
  gravity = createVector(0, 0.1);
  stroke(255);
  strokeWeight(4);
  
  canvas.id("canvas");

  video = createCapture(VIDEO);// Create video
  video.id("video");
  video.size(width, height);

  const faceOptions = {
    withLandmarks: true,
    withExpressions: true,
    withDescriptors: true,
    minConfidence: 0.5
  };

  // Initialize the model
  faceapi = ml5.faceApi(video, faceOptions, faceReady);

  // ゲームスタートボタンを作成
  let startButton = createButton("Start Game");
  startButton.position(20, 20);
  startButton.mousePressed(() => {
    gameStarted = true; // ゲームを開始
    startButton.hide(); // ボタンを非表示にする
  });
}

//雷の関数
function createLightning() {
  let startX = random(width); // 雷のスタート位置をランダムに設定
  let startY = 0;
  let bolt = [];
  let currentX = startX;
  let currentY = startY;

  bolt.push([currentX, currentY]);

  // 雷が画面の下に到達するまで、ランダムなパターンで進む
  while (currentY < height) {
    let nextX = currentX + random(-20, 20); // 雷がランダムに左右にずれる
    let nextY = currentY + random(10, 20);  // 下にランダムに進む

    bolt.push([nextX, nextY]);
    currentX = nextX;
    currentY = nextY;
  }

  lightningBolt.push(bolt);
}

// 雷を描画する関数
function doLightning(){
  if (lightningTimer <= 0) {
    createLightning();
    lightningTimer = int(random(20, 60)); // 次の雷が発生するまでのランダムな間隔
  }
  lightningTimer--;
  
  // 雷の描画
  for (let i = 0; i < lightningBolt.length; i++) {
    drawLightning(lightningBolt[i]);
  }
  
  // 5フレームごとに雷を消して新しい雷を生成
  if (frameCount % 5 === 0) {
    lightningBolt = [];
  }
}

function drawLightning(bolt) {
  stroke(60, 255, 255); // HSBで黄色
  for (let i = 0; i < bolt.length - 1; i++) {
    let x1 = bolt[i][0];
    let y1 = bolt[i][1];
    let x2 = bolt[i + 1][0];
    let y2 = bolt[i + 1][1];
    line(x1, y1, x2, y2); // 線を引いて雷を描画
  }
}

function faceReady() {
  faceapi.detect(gotFaces);// Start detecting faces: 顔認識開始
}

// Get faces
function gotFaces(error, result) {
  if (error) {
    console.log(error);
    return;
  }

  detections = result;　//Now all the data in this detections: 

  clear();//Draw transparent background
  drawBoxs(detections);//Draw detection box:
  drawLandmarks(detections);//// Draw all the face points
  drawExpressions(detections, 20, 250, 14);//Draw face expression

  faceapi.detect(gotFaces);// Call the function again here
}

function drawBoxs(detections){
  if (detections.length > 0) {//If at least 1 face is detected: 
    for (f=0; f < detections.length; f++){
      let {_x, _y, _width, _height} = detections[f].alignedRect._box;
      stroke(44, 169, 225);
      strokeWeight(1);
      noFill();
      rect(_x, _y, _width, _height);
    }
  }
}

function drawLandmarks(detections){
  if (detections.length > 0) {//If at least 1 face is detected
    for (f=0; f < detections.length; f++){
      let points = detections[f].landmarks.positions;
      for (let i = 0; i < points.length; i++) {
        stroke(44, 169, 225);
        strokeWeight(3);
        point(points[i]._x, points[i]._y);
      }
    }
  }
}

function drawExpressions(detections, x, y, textYSpace){
  if (detections.length > 0) { // If at least 1 face is detected
    let {neutral, happy, angry, sad, disgusted, surprised, fearful} = detections[0].expressions;
    textFont('Helvetica Neue');
    textSize(14);
  
    noStroke();
    fill(0);

    text("neutral:       " + nf(neutral * 100, 2, 2) + "%", x, y);
    text("happiness: " + nf(happy * 100, 2, 2) + "%", x, y + textYSpace);
    text("anger:        " + nf(angry * 100, 2, 2) + "%", x, y + textYSpace * 2);
    text("sad:            " + nf(sad * 100, 2, 2) + "%", x, y + textYSpace * 3);
    text("disgusted: " + nf(disgusted * 100, 2, 2) + "%", x, y + textYSpace * 4);
    text("surprised:  " + nf(surprised * 100, 2, 2) + "%", x, y + textYSpace * 5);
    text("fear:           " + nf(fearful * 100, 2, 2) + "%", x, y + textYSpace * 6);

    // happiness~fearfulの値をグローバル変数に反映
    happyG = happy;
    neutralG = neutral;
    angerG = angry;
    sadG = sad;
    disgustedG = disgusted;
    surprisedG = surprised;
    fearfulG = fearful;
    
  } else { // If no faces are detected
    text("neutral: ", x, y);
    text("happiness: ", x, y + textYSpace);
    text("anger: ", x, y + textYSpace * 2);
    text("sad: ", x, y + textYSpace * 3);
    text("disgusted: ", x, y + textYSpace * 4);
    text("surprised: ", x, y + textYSpace * 5);
    text("fear: ", x, y + textYSpace * 6);
  }
}

function draw() {
  
  if (!gameStarted) return; // ゲームが開始されていない場合は何もしない

  if (random(1) < shootingRate) {
    fireworks.push(new Firework());
  }

  for (let i = fireworks.length - 1; i >= 0; i--) {
    fireworks[i].update();
    fireworks[i].show();

    if (fireworks[i].done()) {
      fireworks.splice(i, 1);
    }
  }
}

class Firework {
  constructor() {
    this.firework = new Particle(random(width), height, true);
    this.exploded = false;
    this.particles = [];
  }

  done() {
    return this.exploded && this.particles.length === 0;
  }

  update() {
    if (!this.exploded) {
      this.firework.applyForce(gravity);
      this.firework.update();
      gravity = createVector(0, 0.3);
      shootingRate = 0.03
      
      
      //表情の値で条件分岐
      if (this.firework.vel.y >= 0) {
        if(neutralG * 100 >= 0.80){ // neutralの時、花火なし
          shootingRate = 0.03;
        }else if (happyG * 100 >= 0.90) { // happyの時、花火盛大
          shootingRate = 0.12;
          this.exploded = true;
          this.explode();
        } else if (angerG * 100 >= 0.90){ // angerの時、重力なし
          shootingRate = 3;
          gravity = createVector(0, 0.0);
          doLightning();
        } else if (sadG * 100 >= 0.90){ // sadの時、重力重め
          shootingRate = 0.05;
          gravity = createVector(0, 0.3);
        } else if (disgustedG * 100 >= 0.90){ // disgustedの時、
          shootingRate = 0.03;
          this.exploded = true;
          this.explode();
        } else if (surprisedG * 100 >= 0.90){ // surprisedの時、
          shootingRate = 0.03;
          this.exploded = true;
          this.explode();
        } else if (fearfulG * 100 >= 0.90){ // fearfulの時、
          shootingRate = 0.03;
          this.exploded = true;
          this.explode();
        }else {
          shootingRate = 0.03
          this.exploded = true; // 爆発はするが、particlesを生成しない
        }
      }
    }

    for (let i = this.particles.length - 1; i >= 0; i--) {
      this.particles[i].applyForce(gravity);
      this.particles[i].update();

      if (this.particles[i].done()) {
        this.particles.splice(i, 1);
      }
    }
  }

  explode() {
    for (let i = 0; i < 100; i++) {
      let p = new Particle(this.firework.pos.x, this.firework.pos.y, false);
      this.particles.push(p);
    }
  }

  show() {
    if (!this.exploded) {
      this.firework.show();
    }

    for (let i = 0; i < this.particles.length; i++) {
      this.particles[i].show();
    }
  }
}

class Particle {
  constructor(x, y, firework) {
    this.pos = createVector(x, y);
    this.firework = firework;
    this.lifespan = 255;
    

    if (this.firework) {
      this.vel = createVector(0, random(-17, -10));
    } else {
      this.vel = p5.Vector.random2D();
      this.vel.mult(random(2, 10));
    }

    this.acc = createVector(0, 0);
    this.hu = random(255);
  }

  applyForce(force) {
    this.acc.add(force);
  }

  update() {
    if (!this.firework) {
      this.vel.mult(0.9);
      this.lifespan -= 4;
      

      
      
    }
    
    this.vel.add(this.acc);
    this.pos.add(this.vel);
    this.acc.mult(0);
  }

  done() {
    
    return this.lifespan < 0;
    
  }

  show() {

    if (!this.firework) {
      strokeWeight(2);
      stroke(this.hu, 255, 255, this.lifespan);
    } else {
      strokeWeight(4);
      stroke(this.hu, 255, 255);
      //Firework (use image)
      imageMode(CENTER);
      emojiRandom = Math.floor( Math.random() * 7 );
      if(emojiRandom == 0){
        image(sadImage, this.pos.x, this.pos.y, 30, 30); // sad
      }else if(emojiRandom == 1){
        image(surprisedImage, this.pos.x, this.pos.y, 30, 30); // surprised
      }else if(emojiRandom == 2){
        image(fearImage, this.pos.x, this.pos.y, 30, 30); // fear
      }else if(emojiRandom == 3){
        image(disgustedImage, this.pos.x, this.pos.y, 30, 30); // disgusted
      }else if(emojiRandom == 4){
        image(angryImage, this.pos.x, this.pos.y, 30, 30); // angry
      }else if(emojiRandom == 5){
        image(happyImage, this.pos.x, this.pos.y, 30, 30); // happy
      }
    }
    point(this.pos.x, this.pos.y);
  }
}
