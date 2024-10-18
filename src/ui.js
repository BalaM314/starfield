import { Starfield } from "./starfield.js";
import { getElement, Rand } from "./utils.js";
const canvas = getElement("canvas", HTMLCanvasElement);
const field = new Starfield(canvas);
const shouldScroll = new URLSearchParams(location.search).has("scroll");
let frame = 0;
let needsRedraw = false;
function loop() {
    frame++;
    if (canvas.width != document.body.clientWidth) {
        canvas.width = document.body.clientWidth;
        needsRedraw = true;
    }
    if (canvas.height != document.body.clientHeight) {
        canvas.height = document.body.clientHeight;
        needsRedraw = true;
    }
    if (field.stars.length == 0) {
        field.generate();
        needsRedraw = true;
    }
    if (frame % 4 == 0 && shouldScroll) {
        field.scrollWrap(0.3, 0.1);
        needsRedraw = true;
    }
    if (needsRedraw) {
        field.draw();
        needsRedraw = false;
    }
    window.cancel = requestAnimationFrame(loop);
}
addEventListener("keydown", e => {
    if (!e.altKey && !e.shiftKey && !e.ctrlKey && !["tab", "capslock", "ctrl", "shift", "alt", "f12"].includes(e.key.toLowerCase())) {
        field.generate();
        needsRedraw = true;
    }
});
Object.assign(window, { field, Rand });
loop();
