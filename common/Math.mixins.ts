interface Math {
	randInt(min: number, max: number): number
	randFloat(min: number, max: number): number
	rollDice(dice: number, sides: number): number
	average(...vals: number[]): number
	clamp(num: number, min: number, max: number): number
	lerp(from: number, to: number, percentage: number): number
}

// inclusive
Math.randInt = function(min: number, max: number) {
	return Math.floor(Math.random() * (max - min + 1) + min);
}

// not inclusive
Math.randFloat = function(min: number, max: number) {
	return Math.random() * (max - min) + min;
}

Math.rollDice = function(dice: number, sides: number) {
	let value = 0;
	while(dice > 0) {
		dice--;
		const roll = Math.randInt(1, sides);
		value += roll;
	}
	return value;
}

Math.average = function(...vals: number[]) {
	return vals.reduce((a, b) => a + b, 0) / vals.length
}

Math.clamp = function(num: number, min: number, max: number) {
	return Math.min(max, Math.max(num, min))
}

Math.lerp = function(from: number, to: number, percentage: number) {
	return from * (1 - percentage) + to * percentage
}

const floor = Math.floor
const ceil = Math.ceil
const clamp = Math.clamp

export {
	floor,
	ceil,
	clamp,
}