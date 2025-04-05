
export function crash(message:string, ...extra:unknown[]):never {
	console.error(...extra);
	throw new Error(message);
}

export function getElement<T extends typeof HTMLElement>(id:string, type:T, mode:"id" | "class" = "id"){
	const element:unknown = mode == "class" ? document.getElementsByClassName(id)[0] : document.getElementById(id);
	if(element instanceof type) return element as T["prototype"];
	else if(element instanceof HTMLElement) crash(`Element with id ${id} was fetched as type ${type.name}, but was of type ${element.constructor.name}`);
	else crash(`Element with id ${id} does not exist`);
}

export function match<K extends PropertyKey, O extends Record<K, unknown>>(value:K, clauses:O):O[K];
export function match<K extends PropertyKey, const O extends Partial<Record<K, unknown>>, D>(value:K, clauses:O, defaultValue:D):O[K & keyof O] | D;
export function match(value:PropertyKey, clauses:Record<PropertyKey, unknown>, defaultValue?:unknown):unknown {
	return Object.prototype.hasOwnProperty.call(clauses, value) ? clauses[value] : defaultValue;
}

/**
 * Returns a function that calls the provided function after a delay, unless another call is received, which will abort previous calls.
 * @param [delay=500] Delay in milliseconds.
 */
export function debounce(func: () => void, delay = 500){
	let timeoutId: number | null = null;
	return function delayedCallFunc(){
		if(timeoutId !== null) clearTimeout(timeoutId);
		timeoutId = setTimeout(func, delay);
	}
}

export class Random {
	constructor(public _rand:() => number){}
	/** Returns a random integer between 0 and `max` inclusive. */
	int(max:number):number;
	/** Returns a random integer between `min` and `max` inclusive. */
	int(min:number, max:number):number;
	int(arg0:number, arg1?:number){
		if(arg1)
			return Math.floor(this._rand() * (arg1 + 1 - arg0) + arg0);
		else
			return Math.floor(this._rand() * (arg0 + 1));
	}
	/** Returns a random number between 0 and `max` inclusive. */
	num(max:number):number;
	/** Returns a random number between `min` and `max` inclusive. */
	num(min:number, max:number):number;
	num(arg0:number, arg1?:number){
		if(arg1)
			return this._rand() * (arg1 - arg0) + arg0;
		else
			return this._rand() * arg0;
	}
	chance(probability:number){
		return this._rand() < probability;
	}
	item<T>(input:T[]){
		return input[Math.floor(this._rand() * input.length)];
	}
	static weightedPool<T>(input:[T, number][]):T[] {
		return input.map(([v, n]) => Array(n).fill(v)).flat();
	}
}

export const Rand = new Random(Math.random);

export type Rect = [x: number, y: number, width: number, height: number];
export function rectsIntersect([aX, aY, aW, aH]:Rect, [bX, bY, bW, bH]:Rect){
	return bX <= aX + aW && aX <= bX + bW && bY <= aY + aH && aY <= bY + bH;
}

export function constrain(x:number, min:number, max:number):number {
	return Math.min(Math.max(x, min), max);
}
export function lerp(x:number, minIn:number, maxIn:number, minOut:number, maxOut:number){
	return constrain((x - minIn) / (maxIn - minIn) * (maxOut - minOut) + minOut, minOut, maxOut);
}
