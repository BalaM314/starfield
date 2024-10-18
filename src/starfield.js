import { crash, Rand, Random } from "./utils.js";
export class Starfield {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = this.canvas.getContext("2d") ?? crash(`HTML5 canvas not supported`);
        this.background = "#000";
        this.starDensity = 0.015;
        this.starColors = Random.weightedPool([
            ["#FFF", 90],
            ["#F77", 18],
            ["#F84", 8],
            ["#FF7", 15],
            ["#4AF", 1],
            ["#22A", 12],
            ["#F4F", 1],
        ]);
        this.largeStarSize = 5;
        this.starSize = Random.weightedPool([
            [0.2, 160],
            [0.4, 120],
            [0.6, 80],
            [0.8, 60],
            [1.0, 60],
            [1.3, 40],
            [1.7, 20],
            [2.8, 5],
            [5.5, 1],
        ]);
        this.starBrightness = Random.weightedPool([
            [0.2, 15],
            [0.4, 40],
            [0.6, 20],
            [0.8, 50],
            [1.0, 50],
        ]);
        this.stars = [];
    }
    generate() {
        const { width, height } = this.canvas;
        const starCount = width * height * this.starDensity;
        this.stars = Array.from({ length: starCount }, () => ({
            color: Rand.item(this.starColors),
            size: Rand.item(this.starSize),
            x: Rand.num(0, width),
            y: Rand.num(0, height),
            brightness: Rand.item(this.starBrightness),
        }));
    }
    draw() {
        this.ctx.globalAlpha = 1;
        this.ctx.fillStyle = this.background;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        for (let i = 0; i < this.stars.length; i++) {
            const star = this.stars[i];
            this.ctx.fillStyle = star.color;
            this.ctx.globalAlpha = star.brightness;
            this.ctx.beginPath();
            if (star.size > this.largeStarSize) {
                this.ctx.moveTo(star.x + star.size / 2, star.y);
                this.ctx.lineTo(star.x, star.y + star.size / 2);
                this.ctx.lineTo(star.x - star.size / 2, star.y);
                this.ctx.lineTo(star.x, star.y - star.size / 2);
                this.ctx.lineTo(star.x + star.size / 2, star.y);
            }
            else {
                this.ctx.ellipse(star.x, star.y, star.size / 2, star.size / 2, 0, 0, Math.PI * 2);
            }
            this.ctx.fill();
        }
    }
    scrollWrap(x, y) {
        this.stars.forEach(s => {
            s.x = (s.x + x) % this.canvas.width;
            s.y = (s.y + y) % this.canvas.height;
        });
    }
}
