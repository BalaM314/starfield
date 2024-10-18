import { Starfield } from "./starfield.js";
import { getElement, Rand } from "./utils.js";

const canvas = getElement("canvas", HTMLCanvasElement);

const field = new Starfield(canvas);

declare global {
  var cancel: number;
}


function loop(){
  if(canvas.width != document.body.clientWidth) canvas.width = document.body.clientWidth;
  if(canvas.height != document.body.clientHeight) canvas.height = document.body.clientHeight;
  
  if(field.stars.length == 0) field.generate();

  field.draw();
  // field.scrollWrap(4, 1);

  window.cancel = requestAnimationFrame(loop);
}

addEventListener("keydown", e => {
  if(!e.altKey && !e.shiftKey && !e.ctrlKey && !["tab", "capslock", "ctrl", "shift", "alt"].includes(e.key.toLowerCase()))
    field.generate();
});

Object.assign(window, { field, Rand });

loop();
