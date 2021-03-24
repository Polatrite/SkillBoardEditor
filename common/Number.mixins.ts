interface Number {
    commafy(): string
}

Number.prototype.commafy = function() {
    return this.toString().commafy()
}