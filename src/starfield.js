import { perlin2 } from "./perlin.js";
import { crash, Rand, Random, rectsIntersect } from "./utils.js";
export class Starfield {
    constructor(canvas, canvas2) {
        this.canvas = canvas;
        this.canvas2 = canvas2;
        this.ctx = this.canvas.getContext("2d") ?? crash(`HTML5 canvas not supported`);
        this.ctx2 = this.canvas2.getContext("2d");
        this.background = "#000";
        this.starDensity = 0.015;
        this.nebulaCount = [
            { count: 1, data: { size: [0.12, 0.24], maxAlpha: 0.1 } },
            { count: 10, data: { size: [0.035, 0.07], maxAlpha: 0.1 } },
            { count: 6, data: { size: [0.06, 0.12], maxAlpha: 0.1 } },
        ];
        this.nebulaColors = Random.weightedPool([
            ["#FFF", 90],
            ["#F77", 18],
            ["#F84", 8],
            ["#FF7", 15],
            ["#F7F", 1],
            ["#C7F", 1],
        ]);
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
            [6, 1],
        ]);
        this.starBrightness = Random.weightedPool([
            [0.2, 15],
            [0.4, 40],
            [0.6, 20],
            [0.8, 50],
            [1.0, 50],
        ]);
        this.stars = [];
        this.nebulas = [];
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
        this.nebulas = this.nebulaCount.flatMap(({ count, data }) => Array.from({ length: count }, () => {
            const perlinW = Rand.num(2, 4);
            const canvasSize = Math.sqrt(width * height);
            return {
                x: Math.floor(Rand.num(0, width)), y: Math.floor(Rand.num(0, height)),
                radX: Math.floor(canvasSize * Rand.num(...data.size)), radY: Math.floor(canvasSize * Rand.num(...data.size)),
                color: `hsl(${Rand.int(260, 420)}, ${Rand.num(90, 100)}%, 85%)`,
                maxAlpha: Rand.num(0.03, data.maxAlpha),
                perlinW,
                perlinH: perlinW * Rand.num(0.5, 1.5),
                perlinX: Rand.num(100), perlinY: Rand.num(100),
                perlinScl: 0.4,
                perlinSclOffset: -0.1,
            };
        })).map(n => ({
            ...n,
            rect: [n.x - n.radX, n.y - n.radY, n.radX * 2, n.radY * 2]
            //Remove all nebulas that overlap a previous nebula
            //Overlapping nebulas don't look good
        })).filter((a, i, arr) => arr.slice(0, i).every(b => !rectsIntersect(a.rect, b.rect)));
    }
    draw() {
        this.ctx.globalAlpha = 1;
        this.ctx.fillStyle = this.background;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx2.fillStyle = this.background;
        this.ctx2.fillRect(0, 0, this.canvas2.width, this.canvas2.height);
        for (let i = 0; i < this.stars.length; i++) {
            const star = this.stars[i];
            this.ctx.fillStyle = star.color;
            this.ctx.globalAlpha = star.brightness;
            this.ctx.beginPath();
            if (star.size > this.largeStarSize) {
                const r = star.size / 2;
                this.ctx.moveTo(star.x, star.y - r);
                this.ctx.arc(star.x - r, star.y - r, r, 0, Math.PI / 2);
                this.ctx.arc(star.x - r, star.y + r, r, Math.PI * 3 / 2, Math.PI * 2);
                this.ctx.arc(star.x + r, star.y + r, r, Math.PI, Math.PI * 3 / 2);
                this.ctx.arc(star.x + r, star.y - r, r, Math.PI / 2, Math.PI);
                // this.ctx.moveTo(star.x + star.size / 2, star.y);
                // this.ctx.lineTo(star.x, star.y + star.size / 2);
                // this.ctx.lineTo(star.x - star.size / 2, star.y);
                // this.ctx.lineTo(star.x, star.y - star.size / 2);
                // this.ctx.lineTo(star.x + star.size / 2, star.y);
            }
            else {
                this.ctx.ellipse(star.x, star.y, star.size / 2, star.size / 2, 0, 0, Math.PI * 2);
            }
            this.ctx.fill();
        }
        for (const nebula of this.nebulas) {
            this.drawNebula(nebula);
        }
    }
    drawNebula({ x, y, radX, radY, color, maxAlpha, perlinW, perlinH, perlinX, perlinY, perlinScl, perlinSclOffset }) {
        //Use standard drawing APIs to create a rectangle of the specified color
        this.ctx2.globalAlpha = 1;
        this.ctx2.fillStyle = color;
        const width = radX * 2 + 1, height = radY * 2 + 1;
        const regionRect = [x - radX, y - radY, width, height];
        this.ctx2.fillRect(...regionRect);
        // this.ctx.strokeStyle = "#FFF";
        // this.ctx.globalAlpha = 1;
        // this.ctx.lineWidth = 1;
        // this.ctx.strokeRect(...regionRect);
        //Then, set the alpha for each pixel
        const alphaByte = 3;
        const region = this.ctx2.getImageData(...regionRect);
        const { data } = region;
        for (let i = alphaByte, x = -radX, y = -radY; i < data.length; i += 4, (++x > radX) && (x = -radX, y++)) {
            const perlinOffset = perlin2(x * perlinW / width + perlinX, y * perlinH / width + perlinY) * perlinScl + perlinSclOffset;
            const paraboloidHeight = 1 - (x / radX) ** 2 - (y / radY) ** 2;
            data[i] = maxAlpha * 0xFF * (paraboloidHeight + perlinOffset);
        }
        this.ctx2.putImageData(region, regionRect[0], regionRect[1]);
    }
    scrollWrap(x, y) {
        this.stars.forEach(s => {
            s.x = (s.x + x) % this.canvas.width;
            s.y = (s.y + y) % this.canvas.height;
        });
    }
}
