
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

