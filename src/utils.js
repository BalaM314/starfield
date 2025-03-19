export function crash(message, ...extra) {
    console.error(...extra);
    throw new Error(message);
}
export function getElement(id, type, mode = "id") {
    const element = mode == "class" ? document.getElementsByClassName(id)[0] : document.getElementById(id);
    if (element instanceof type)
        return element;
    else if (element instanceof HTMLElement)
        crash(`Element with id ${id} was fetched as type ${type.name}, but was of type ${element.constructor.name}`);
    else
        crash(`Element with id ${id} does not exist`);
}
export function match(value, clauses, defaultValue) {
    return Object.prototype.hasOwnProperty.call(clauses, value) ? clauses[value] : defaultValue;
}
/**
 * Returns a function that calls the provided function after a delay, unless another call is received, which will abort previous calls.
 * @param [delay=500] Delay in milliseconds.
 */
export function debounce(func, delay = 500) {
    let timeoutId = null;
    return function delayedCallFunc() {
        if (timeoutId !== null)
            clearTimeout(timeoutId);
        timeoutId = setTimeout(func, delay);
    };
}
export class Random {
    constructor(_rand) {
        this._rand = _rand;
    }
    int(arg0, arg1) {
        if (arg1)
            return Math.floor(this._rand() * (arg1 + 1 - arg0) + arg0);
        else
            return Math.floor(this._rand() * (arg0 + 1));
    }
    num(arg0, arg1) {
        if (arg1)
            return this._rand() * (arg1 - arg0) + arg0;
        else
            return this._rand() * arg0;
    }
    chance(probability) {
        return this._rand() < probability;
    }
    item(input) {
        return input[Math.floor(this._rand() * input.length)];
    }
    static weightedPool(input) {
        return input.map(([v, n]) => Array(n).fill(v)).flat();
    }
}
export const Rand = new Random(Math.random);
