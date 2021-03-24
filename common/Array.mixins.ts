interface Array<T> {
	clear(): void
	pick(): any
	contains(o: T): boolean
	remove(o: T): T[]
}

Array.prototype.pick = Array.prototype.pick || function() {
	return this[Math.floor(Math.random() * this.length)];
}

Array.prototype.contains = Array.prototype.contains || function(obj) {
	for (let i = 0; i < this.length; i++)
	{
		if (this[i] === obj) {
			return true;
		}
	}
	return false;
};

Array.prototype.remove = Array.prototype.remove || function(obj) {
	for (let i = 0; i < this.length; i++)
	{
		if (this[i] === obj) {
			this.splice(i, 1);
			return this;
		}
	}
	return false;
};

Array.prototype.clear = Array.prototype.clear || function() {
	this.length = 0
}