const WIDTH = 500;
const HEIGHT = 350;
const RECTWIDTH = 100;
const RECTHEIGHT = 100;
const COLORS = ['yellow', 'green', 'red']
let x = 0;
let y = 0;
let move_right = true;
let move_down = true;
let count = 0;

function setup() {
  createCanvas(WIDTH, HEIGHT);
}

function draw() {
  
  let c = COLORS[count % 3];
  fill(c);
  background('black');
  rect(x, y, RECTWIDTH, RECTHEIGHT);


  if (move_down) {
    y += 2;
    if (y > HEIGHT - RECTHEIGHT) { 
      move_down = false;
      count += 1;
    }
  } else {
    y -= 2
    if (y < 0) {
      move_down = true;
      count += 1;
    }
  }
  
  if (move_right) {
    x += 1;
    if (x > WIDTH - RECTWIDTH) { 
      move_right = false;
      count += 1;
    }
  } else {
    x -= 1
    if (x < 0) {
      move_right = true;
      count += 1;
    }
  }
}