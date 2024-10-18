import { crash } from "./utils.js";
export class Starfield {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = this.canvas.getContext("2d") ?? crash(`HTML5 canvas not supported`);
        this.background = "#000";
    }
    draw() {
        this.ctx.fillStyle = this.background;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
}
