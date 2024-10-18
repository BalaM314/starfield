import { Starfield } from "./starfield.js";
import { getElement } from "./utils.js";
const canvas = getElement("canvas", HTMLCanvasElement);
const field = new Starfield(canvas);
function loop() {
    if (canvas.width != document.body.clientWidth)
        canvas.width = document.body.clientWidth;
    if (canvas.height != document.body.clientHeight)
        canvas.height = document.body.clientHeight;
    field.draw();
    window.cancel = requestAnimationFrame(loop);
}
loop();
