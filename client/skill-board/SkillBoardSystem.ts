import { Container, Point, utils as PIXIutils } from "pixi.js"

import SkillBoardRenderer from "./SkillBoardRenderer"
import SkillNode from "./SkillNode"
import SkillNodeGFX from "./SkillNodeGFX"
import SkillEdgeGFX from "./SkillEdgeGFX"
import Tooltip from "../render/Tooltip"
import SkillBoardJson from './SkillBoard.json'

const skillNodeSizes = {
	1: 22,
	2: 34,
	3: 52,
	4: 70,
	5: 84,
}

let skillBoardRenderer: SkillBoardRenderer

class SkillBoardSystem {
	container: Container = new Container()
	foreground = new Container()
	background = new Container()
	
	tooltips = []
	skillData = []
	skillNodes: Map<number, SkillNode> = new Map()
	skillNodeGFXMap: Map<number, SkillNodeGFX> = new Map()
	skillEdgeGFXHashMap: Map<string, SkillEdgeGFX> = new Map()

	constructor(options?) {
		skillBoardRenderer = options.skillBoardRenderer
		this.container.addChild(this.background, this.foreground)

		skillBoardRenderer.backgroundLayer.on('touchend', (event) => {
			this.tooltips.slice(0).forEach((tooltipData) => {
				removeTooltip(tooltipData, this)
			})
		})

	}

	init() {
		this.loadAndApplyBoard()
		return this.container
	}

	initBoard(boardData) {
		const self = this
		boardData.forEach((nodeData) => {
			const node = new SkillNode(nodeData)
			self.skillNodes.set(node.skillId, node)
		})
	
		this.buildSkillNodeLinks()
	
		self.skillNodes.forEach((node) => {
			self.createSkillNodeGFX(node)
		})
	
		self.skillNodes.forEach((node) => {
			node.links.forEach((destNode) => {
				node.gfx.links.set(destNode.skillId, destNode.gfx)
				destNode.gfx.links.set(node.skillId, node.gfx)
	
				self.createSkillEdgeGFX(node, destNode)
			})
		})
	
		return this.container
	}
	
	
	loadBoard() {
		// console.log(SkillBoardJson)
		// SkillBoardJson.forEach((node) => {
		// 	let xDiff = node.x - 15456
		// 	let yDiff = node.y - 15168
		// 	xDiff *= 2
		// 	yDiff *= 2
		// 	node.x = xDiff + 15456
		// 	node.y = (yDiff + 15168)
		// })

		// return SkillBoardJson
		let saveData = window.localStorage.getItem("skillboard-data")
		if (!saveData) {
			return SkillBoardJson
		}
		return JSON.parse(saveData)
	}
	
	clearBoard() {
		this.background.removeChildren()
		this.foreground.removeChildren()
		this.skillNodes.clear()
		this.skillNodeGFXMap.clear()
		this.skillEdgeGFXHashMap.clear()
	}
	
	loadAndApplyBoard() {
		const boardData = this.loadBoard()
		this.clearBoard()
		this.initBoard(boardData)
		this.skillNodeGFXMap.forEach((skillNodeGFX) => {
			if(skillNodeGFX.node.name === "#-#-# NAMELESS #-#-#") {
				skillNodeGFX.graphics.tint = 0xFFFFFF
			} else {
				skillNodeGFX.graphics.tint = 0x444444
			}
		})
	}

	createSkillNodeGFX(skillNode: SkillNode): SkillNodeGFX {
		const self = this
		const fillColor = PIXIutils.string2hex(skillNode.color)
		const skillNodeGFX = new SkillNodeGFX(skillNodeSizes[skillNode.size], fillColor, 4, 0xcc5555)
		this.foreground.addChild(skillNodeGFX)
		skillNodeGFX.x = skillNode.x
		skillNodeGFX.y = skillNode.y
		skillNodeGFX.interactive = true
		skillNodeGFX.buttonMode = true
		skillNodeGFX
			.on("mouseover", function(event) {
				onMouseOverSkillNode.bind(skillNodeGFX)(event, self)
			})
			.on("mouseout", function(event) {
				onMouseOutSkillNode.bind(skillNodeGFX)(event, self)
			})
		skillNode.gfx = skillNodeGFX
		skillNodeGFX.node = skillNode
		this.skillNodeGFXMap.set(skillNode.skillId, skillNodeGFX)
		return skillNodeGFX
	}
	
	createSkillEdgeGFX(node1: SkillNode, node2: SkillNode): SkillEdgeGFX {
		const hash = getSortedHash(node1.skillId, node2.skillId)
		let skillEdgeGFX: SkillEdgeGFX
		if (this.skillEdgeGFXHashMap.has(hash)) {
			skillEdgeGFX = this.skillEdgeGFXHashMap.get(hash)
		} else {
			const origin = new Point(node1.gfx.x, node1.gfx.y)
			const dest = new Point(node2.gfx.x - node1.gfx.x, node2.gfx.y - node1.gfx.y)
			skillEdgeGFX = new SkillEdgeGFX(origin, dest)
			this.skillEdgeGFXHashMap.set(hash, skillEdgeGFX)
			this.background.addChild(skillEdgeGFX)
		}
		return skillEdgeGFX
	}

	redrawLines(skillNodeGFX: SkillNodeGFX) {
		const self = this
		skillNodeGFX.links.forEach((link) => {
			const hash = getSortedHash(link.node.skillId, skillNodeGFX.node.skillId)
			const skillEdgeGFX = self.skillEdgeGFXHashMap.get(hash)
			const deltaX = link.node.gfx.x - skillNodeGFX.x
			const deltaY = link.node.gfx.y - skillNodeGFX.y
			const dist = Math.sqrt(deltaX*deltaX + deltaY*deltaY)
			if(dist > 2000) {
				skillEdgeGFX.redrawFromPoints(new Point(skillNodeGFX.x, skillNodeGFX.y), new Point(link.node.gfx.x - skillNodeGFX.x, link.node.gfx.y - skillNodeGFX.y), {
					width: 6,
					color: 0x555555,
					alpha: 0.3,
				})
			} else {
				skillEdgeGFX.redrawFromPoints(new Point(skillNodeGFX.x, skillNodeGFX.y), new Point(link.node.gfx.x - skillNodeGFX.x, link.node.gfx.y - skillNodeGFX.y))
			}
		})
	}

	linkNodes(node1: SkillNodeGFX, node2: SkillNodeGFX) {
		this.createSkillEdgeGFX(node1.node, node2.node)
		node1.links.set(node2.node.skillId, node2)
		node1.node.links.set(node2.node.skillId, node2.node)
		node2.links.set(node1.node.skillId, node1)
		node2.node.links.set(node1.node.skillId, node1.node)
	}
	
	unlinkNodes(node1: SkillNodeGFX, node2: SkillNodeGFX) {
		node1.links.delete(node2.node.skillId)
		node1.node.links.delete(node2.node.skillId)
		node2.links.delete(node1.node.skillId)
		node2.node.links.delete(node1.node.skillId)
	}
	
	highlightLinks(node: SkillNodeGFX) {
		const self = this
		node.links.forEach((destNode) => {
			const hash = getSortedHash(node.node.skillId, destNode.node.skillId)
			const edge = self.skillEdgeGFXHashMap.get(hash)
			edge.redraw(edge.hoverLineStyle)
		})
	}
	
	unhighlightLinks(node: SkillNodeGFX) {
		const self = this
		node.links.forEach((destNode) => {
			const edge = self.skillEdgeGFXHashMap.get(getSortedHash(node.node.skillId, destNode.node.skillId))
			edge.redraw()
		})
	}
	
	updateTooltip(skillNodeGFX: SkillNodeGFX) {
		const tooltip = skillNodeGFX.tooltip
		if (tooltip) {
			tooltip.render([{ t: skillNodeGFX.node.getDescription().join("\n"), c: "#000", b: true }])
			tooltip.update(skillNodeGFX.x, skillNodeGFX.y - 30)
		}
	}

	buildSkillNodeLinks() {
		const self = this
		this.skillNodes.forEach((node) => {
			node.links.forEach((ni, index) => {
				const destNode = self.skillNodes.get(index)
				if(!destNode) {
					throw new Error(`Missing destination node for ${node.name} [#${node.skillId}] linking to ${index}`)
				}
				node.setLink(index, destNode)
				destNode.setLink(node.skillId, node)
			})
		})
	}
	
	showTooltip(skillNodeGFX: SkillNodeGFX) {
		if(!skillNodeGFX.tooltip) {
			const tooltip = new Tooltip({
				width: window.innerWidth,
				height: window.innerHeight,
			})
			this.tooltips.push({ tooltip, skillNodeGFX })
			skillBoardRenderer.tooltips.push(tooltip)
	
			skillNodeGFX.tooltip = tooltip
	
			const scale = 1 / skillBoardRenderer.mainCamera.scale.x
			tooltip.container.scale.set(scale, scale)
			const lines = []
			lines.push({ t: skillNodeGFX.node.name, c: "#000", b: true, size: 18 })
			lines.push({ t: skillNodeGFX.node.getDescription().join("\n"), c: "#000", b: true, size: 14 })
			lines.push({ t: `Skill #${skillNodeGFX.node.skillId}`, c: "#444", b: false, size: 14})
			tooltip.render(lines)
			tooltip.update(skillNodeGFX.x, skillNodeGFX.y + 160)
			this.container.addChild(tooltip.container)
		}
	
		this.highlightLinks(skillNodeGFX)
	}
}

function onMouseOverSkillNode(event, skillBoardSystem) {
	// if (this.tooltip) {
	// 	this.tooltip.update(this.x, this.y + 160)
	// }
	skillBoardSystem.showTooltip(this)

	// 	let prevx
	// 	let prevy
	// 	let gogo = () => {
	// 		if(skillBoardSystem.container.children.indexOf(tooltip.container) !== -1) {
	// 			let oldx
	// 			let oldy
	// 			if(tooltip.container.x !== prevx) {
	// 				oldx = prevx
	// 				prevx = tooltip.container.x
	// 			}
	// 			if(tooltip.container.y !== prevy) {
	// 				oldy = prevy
	// 				prevy = tooltip.container.y
	// 				console.log(`x/y changed: ${oldx},${oldy} to ${prevx},${prevy}`)
	// 			}
	// 		}
	// 	}
	// 	gogo()
	// 	setInterval(gogo, 16)
	// }
}

function onMouseOutSkillNode(event, skillBoardSystem) {
	const tooltipData = skillBoardSystem.tooltips.find((indTooltip) => {
		return indTooltip.tooltip === this.tooltip
	})
	removeTooltip(tooltipData, skillBoardSystem)
}

function removeTooltip(tooltipData, skillBoardSystem) {
	const { tooltip, skillNodeGFX } = tooltipData
	skillBoardSystem.container.removeChild(skillNodeGFX.tooltip.container)
	skillBoardSystem.tooltips.remove(tooltipData)
	skillBoardRenderer.tooltips.remove(skillNodeGFX.tooltip)
	skillNodeGFX.tooltip = null

	skillBoardSystem.unhighlightLinks(skillNodeGFX)
}

function getSortedHash(val1, val2): string {
	if (val1 > val2) {
		return `${val2}-${val1}`
	} else {
		return `${val1}-${val2}`
	}
}

export default SkillBoardSystem
