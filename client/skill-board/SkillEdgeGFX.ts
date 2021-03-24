import { Container, Point, Graphics } from "pixi.js"

interface LineStyle {
	width: number
	color: number
	alpha: number
}

class SkillEdgeGFX extends Container {
	graphics: Graphics
	origin: Point
	destination: Point
	lineStyle: LineStyle
	hoverLineStyle: LineStyle

	constructor(origin: Point, destination: Point) {
		super()

		this.graphics = new Graphics()
		this.graphics.interactive = true
		this.addChild(this.graphics)
		this.redrawFromPoints(origin, destination)
	}

	redraw(lineStyle?: LineStyle) {
		if(!lineStyle) {
			lineStyle = this.lineStyle
		}
		this.graphics.clear()
		this.graphics.lineStyle(lineStyle.width, lineStyle.color, lineStyle.alpha)
		this.graphics.position.set(this.origin.x, this.origin.y)
		this.graphics.lineTo(this.destination.x, this.destination.y)
	}

	applyLineStyleAndRedraw(lineStyle: LineStyle) {
		if (!lineStyle) {
			lineStyle = {
				width: 10,
				color: 0x555555,
				alpha: 0.6
			}
		}
		this.lineStyle = lineStyle
		this.hoverLineStyle = {
			width: lineStyle.width - 2,
			color: 0x8888ff,
			alpha: 1
		}
		this.redraw(lineStyle)
	}

	redrawFromPoints(origin: Point, destination: Point, lineStyle?: LineStyle) {
		this.origin = origin
		this.destination = destination
		this.applyLineStyleAndRedraw(lineStyle)
	}
}

export default SkillEdgeGFX
