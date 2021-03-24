import { Graphics, Container, Text } from "pixi.js"

class Tooltip {
	canvas
	container = new Container()
	maxWidth = 300
	padding = 6
	margin = 15
	linesMargin = 4
	w = 0
	h = 0

	constructor(canvas, options?) {
		this.canvas = canvas
		if(options) {
			this.padding = options.padding || 6
			this.margin = options.margin || 15
			this.linesMargin = options.linesMargin || 4
		}
	}

	render(lines) {
		const _this = this
		_this.container.removeChildren()
		let height = 0
		let width = 0
		const texts = []
		for (let i = 0; i < lines.length; i++) {
			const line = lines[i]
			const text = new Text(line.t, {
				fontSize: line.size,
				fontFamily: "Arial",
				fontWeight: line.b ? "bold" : "normal",
				fill: line.c,
				wordWrap: true,
				wordWrapWidth: _this.maxWidth,
			})
			text.resolution = 2
			text.x = _this.padding
			text.y = _this.padding + height
			height += text.height + _this.linesMargin
			if (width < text.width) width = text.width
			texts.push(text)
		}
		height -= _this.linesMargin
		if (height < 0) {
			height = 0
		}
		_this.w = width
		_this.h = height
		const rect = new Graphics()
		// force canvas rendering for rectangle
		rect.cacheAsBitmap = true
		rect.lineStyle(2, 0xee6600, 0.6)
		rect.beginFill(0xffffff, 0.8)
		rect.drawRoundedRect(0, 0, width + _this.padding * 2, height + _this.padding * 2, 6)
		rect.endFill()
		_this.container.addChild(rect)
		for (let i = 0; i < texts.length; i++) {
			_this.container.addChild(texts[i])
		}
	}

	update(x, y) {
		x += this.margin
		if (x + this.w > this.canvas.width - this.margin) {
			x -= this.w + this.margin * 2
		}
		if (y + this.h > this.canvas.height - this.margin) {
			y -= this.h + this.margin
		}
		this.container.x = x
		this.container.y = y
	}

	delete() {
		this.canvas = null
	}
}

export default Tooltip
