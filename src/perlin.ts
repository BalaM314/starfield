/*
 * A speed-improved perlin and simplex noise algorithms for 2D.
 *
 * Based on example code by Stefan Gustavson (stegu@itn.liu.se).
 * Optimisations by Peter Eastman (peastman@drizzle.stanford.edu).
 * Better rank ordering method by Stefan Gustavson in 2012.
 * Converted to Javascript by Joseph Gentle.
 * Converted to modern Typescript by BalaM314 in 2024.
 *
 * Version 2012-03-09
 *
 * This code was placed in the public domain by its original author,
 * Stefan Gustavson. You may use it as you see fit, but
 * attribution is appreciated.
 *
 */

class Vec3 {
	constructor(
		public x:number,
		public y:number,
		public z:number,
	){}
	dot2(x:number, y:number) {
		return this.x * x + this.y * y;
	}
	dot3(x:number, y:number, z:number) {
		return this.x * x + this.y * y + this.z * z;
	}
}


const grad3 = [
	new Vec3(1,1,0), new Vec3(-1,1,0), new Vec3(1,-1,0), new Vec3(-1,-1,0),
	new Vec3(1,0,1), new Vec3(-1,0,1), new Vec3(1,0,-1), new Vec3(-1,0,-1),
	new Vec3(0,1,1), new Vec3(0,-1,1), new Vec3(0,1,-1), new Vec3(0,-1,-1)
];

const p = [151,160,137,91,90,15,131,13,201,95,96,53,194,233,7,225,140,36,103,30,69,142,8,99,37,240,21,10,23,190,6,148,247,120,234,75,0,26,197,62,94,252,219,203,117,35,11,32,57,177,33,88,237,149,56,87,174,20,125,136,171,168,68,175,74,165,71,134,139,48,27,166,77,146,158,231,83,111,229,122,60,211,133,230,220,105,92,41,55,46,245,40,244,102,143,54,65,25,63,161,1,216,80,73,209,76,132,187,208,89,18,169,200,196,135,130,116,188,159,86,164,100,109,198,173,186,3,64,52,217,226,250,124,123,5,202,38,147,118,126,255,82,85,212,207,206,59,227,47,16,58,17,182,189,28,42,223,183,170,213,119,248,152,2,44,154,163,70,221,153,101,155,167,43,172,9,129,22,39,253,19,98,108,110,79,113,224,232,178,185,112,104,218,246,97,228,251,34,242,193,238,210,144,12,191,179,162,241,81,51,145,235,249,14,239,107,49,192,214,31,181,199,106,157,184,84,204,176,115,121,50,45,127,4,150,254,138,236,205,93,222,114,67,29,24,72,243,141,128,195,78,66,215,61,156,180];
// To remove the need for index wrapping, double the permutation table length
const perm = new Array<number>(512);
const gradP = new Array<Vec3>(512);

/**
 * This isn't a very good seeding function, but it works ok. It supports 2^16
 * different seed values. Write something better if you need more seeds.
 */
export function seed(seed:number) {
	if(seed > 0 && seed < 1) {
		// Scale the seed out
		seed *= 65536;
	}

	seed = Math.floor(seed);
	if(seed < 256) {
		seed |= seed << 8;
	}

	for(let i = 0; i < 256; i++) {
		let v;
		if (i & 1) {
			v = p[i]! ^ (seed & 255);
		} else {
			v = p[i]! ^ ((seed >> 8) & 255);
		}

		perm[i] = perm[i + 256] = v;
		gradP[i] = gradP[i + 256] = grad3[v % 12]!;
	}
}
seed(0);

/*
for(let i = 0; i < 256; i++) {
	perm[i] = perm[i + 256] = p[i];
	gradP[i] = gradP[i + 256] = grad3[perm[i] % 12];
}*/

//#region Perlin noise stuff

function fade(t:number) {
	return t*t*t*(t*(t*6-15)+10);
}

function lerp(a:number, b:number, t:number) {
	return (1-t)*a + t*b;
}

/** 2D Perlin Noise */
export function perlin2(x:number, y:number) {
	// Find unit grid cell containing point
	let x_ = Math.floor(x);
	let y_ = Math.floor(y);
	// Get relative xy coordinates of point within that cell
	x = x - x_; y = y - y_;
	// Wrap the integer cells at 255 (smaller integer period can be introduced here)
	x_ = x_ & 255; y_ = y_ & 255;

	// Calculate noise contributions from each of the four corners
	const n00 = gradP[x_ + perm[y_]!]!.dot2(x, y);
	const n01 = gradP[x_ + perm[y_ + 1]!]!.dot2(x, y - 1);
	const n10 = gradP[x_ + 1 + perm[y_]!]!.dot2(x - 1, y);
	const n11 = gradP[x_ + 1 + perm[y_ + 1]!]!.dot2(x - 1, y - 1);

	// Compute the fade curve value for x
	const u = fade(x);

	// Interpolate the four results
	return lerp(
		lerp(n00, n10, u),
		lerp(n01, n11, u),
		fade(y)
	);
};

/** 3D Perlin Noise */
export function perlin3(x:number, y:number, z:number) {
	// Find unit grid cell containing point
	let x_ = Math.floor(x), y_ = Math.floor(y), z_ = Math.floor(z);
	// Get relative xyz coordinates of point within that cell
	x = x - x_; y = y - y_; z = z - z_;
	// Wrap the integer cells at 255 (smaller integer period can be introduced here)
	x_ = x_ & 255; y_ = y_ & 255; z_ = z_ & 255;

	// Calculate noise contributions from each of the eight corners
	const n000 = gradP[x_ +     perm[y_ +     perm[z_    ]!]!]!.dot3(x    , y    , z    );
	const n001 = gradP[x_ +     perm[y_ +     perm[z_ + 1]!]!]!.dot3(x    , y    , z - 1);
	const n010 = gradP[x_ +     perm[y_ + 1 + perm[z_    ]!]!]!.dot3(x    , y - 1, z    );
	const n011 = gradP[x_ +     perm[y_ + 1 + perm[z_ + 1]!]!]!.dot3(x    , y - 1, z - 1);
	const n100 = gradP[x_ + 1 + perm[y_ +     perm[z_    ]!]!]!.dot3(x - 1, y    , z    );
	const n101 = gradP[x_ + 1 + perm[y_ +     perm[z_ + 1]!]!]!.dot3(x - 1, y    , z - 1);
	const n110 = gradP[x_ + 1 + perm[y_ + 1 + perm[z_    ]!]!]!.dot3(x - 1, y - 1, z    );
	const n111 = gradP[x_ + 1 + perm[y_ + 1 + perm[z_ + 1]!]!]!.dot3(x - 1, y - 1, z - 1);

	// Compute the fade curve value for x, y, z
	const u = fade(x);
	const v = fade(y);
	const w = fade(z);

	// Interpolate
	return lerp(
		lerp(
			lerp(n000, n100, u),
			lerp(n001, n101, u),
			w
		),
		lerp(
			lerp(n010, n110, u),
			lerp(n011, n111, u),
			w
		),
		v
	);
};
