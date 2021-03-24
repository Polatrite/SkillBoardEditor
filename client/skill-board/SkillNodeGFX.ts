import { Container, Graphics, Sprite } from "pixi.js"
import SkillNode from "./SkillNode"
import Tooltip from "../render/Tooltip"

class SkillNodeGFX extends Container {
	node: SkillNode
	graphics: Graphics
	sprite: Sprite
	links: Map<number, SkillNodeGFX> = new Map()
	tooltip: Tooltip

	isTouchedOnce: boolean = false

	constructor(radius, fillColor, borderWidth, borderColor) {
		super()

		this.graphics = new Graphics()
		this.redraw(radius, fillColor, borderWidth, borderColor)
		this.addChild(this.graphics)
	}

	redraw(radius, fillColor, borderWidth, borderColor) {
		this.graphics.clear()
		this.graphics.beginFill(fillColor, 1)
		this.graphics.drawCircle(0, 0, radius)
		this.graphics.endFill()
		this.graphics.lineStyle(borderWidth, borderColor, 1)
		this.graphics.drawCircle(0, 0, radius)
		// this.sprite = Sprite.from('./icons/abstract-053.svg')
	}
}

export default SkillNodeGFX
