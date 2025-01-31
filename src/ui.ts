import { Starfield } from "./starfield.js";
import { getElement, match, Rand, Random } from "./utils.js";

const canvas = getElement("canvas", HTMLCanvasElement);

const field = new Starfield(canvas);
const search = new URLSearchParams(location.search);
const scrollSpeed = match(search.get("scroll") ?? "none", {
  none: 0,
  low: 0.08,
  medium: 0.14,
  high: 0.24,
}, 0);
const bigStars = search.has("size-high");
switch(search.get("color")){
  case "none":
    field.starColors = Random.weightedPool([
      ["#FFF", 1],
    ]);
    break;
  case "low":
    field.starColors = Random.weightedPool([
      ["#FFF", 90],
      ["#FF7", 30],
      ["#F66", 10],
      ["#F84", 2],
      ["#22A", 1],
    ]);
    break;
  case "medium":
    field.starColors = Random.weightedPool([
      ["#FFF", 90],
      ["#F77", 18],
      ["#F84", 8],
      ["#FF7", 15],
      ["#4AF", 1],
      ["#22A", 12],
      ["#F4F", 1],
    ]);
    break;
  case "high":
    field.starColors = Random.weightedPool([
      ["#FFF", 20],
      ["#F77", 6],
      ["#F84", 3],
      ["#FF7", 5],
      ["#4AF", 1],
      ["#22A", 4],
      ["#F4F", 1],
    ]);
    break;
  case "very-high":
    field.starColors = Random.weightedPool([
      ["#F66", 90],
      ["#AA6", 90],
      ["#FFF", 90],
      ["#6AA", 90],
      ["#66F", 90],
      ["#A6A", 90],
    ]);
    break;
}
switch(search.get("density")){
  case "very-low":
    field.starDensity = 0.003;
    break;
  case "low":
    field.starDensity = 0.007;
    break;
  case "medium":
    field.starDensity = 0.015;
    break;
  case "high":
    field.starDensity = 0.05;
    break;
  case "very-high":
    field.starDensity = 0.08;
    break;
}
if(bigStars){
  field.starSize = Random.weightedPool([
    [0.2, 160],
    [0.4, 120],
    [0.6, 80],
    [0.8, 60],
    [1.0, 60],
    [1.3, 40],
    [1.7, 20],
    [2.8, 5],
    [8, 1],
    [14, 1],
  ]);
}


declare global {
  var cancel: number;
}

let frame = 0;
let needsRedraw = false;
function loop(){
  frame ++;
  
  if(canvas.width != document.body.clientWidth){
    canvas.width = document.body.clientWidth;
    needsRedraw = true;
  }
  if(canvas.height != document.body.clientHeight){
    canvas.height = document.body.clientHeight;
    needsRedraw = true;
  }
  
  if(field.stars.length == 0){
    field.generate();
    needsRedraw = true;
  }
  if(frame % 4 == 0 && scrollSpeed != 0){
    let scaledScrollSpeed = (canvas.width / 1920) * scrollSpeed;
    field.scrollWrap(3 * scaledScrollSpeed, 1 * scaledScrollSpeed);
    needsRedraw = true;
  }
  if(needsRedraw){
    field.draw();
    needsRedraw = false;
  }
  
  window.cancel = requestAnimationFrame(loop);
}


addEventListener("keydown", e => {
  if(!e.altKey && !e.shiftKey && !e.ctrlKey && !["tab", "capslock", "ctrl", "shift", "alt", "f12"].includes(e.key.toLowerCase())){
    field.generate();
    needsRedraw = true;
  }
});
addEventListener("click", e => {
  if(e.button == 0){
    field.generate();
    needsRedraw = true;
  }
});

Object.assign(window, { field, Rand });

loop();
