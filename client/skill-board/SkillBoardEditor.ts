import Mousetrap from "mousetrap"
import { Point, utils as PIXIutils } from "pixi.js"
import Pickr from "@simonwep/pickr"
import SkillBoardRenderer from "./SkillBoardRenderer"
import SkillNode from "./SkillNode"
import SkillNodeGFX from "./SkillNodeGFX"
import SkillBoardSystem from "./SkillBoardSystem"
import { ctxmenu } from "../../common/ctxmenu"
import Tooltip from "../render/Tooltip"
import SkillBoardJson from './SkillBoard.json'
import vex from 'vex-js'
import vexDialog from 'vex-dialog'

vex.defaultOptions.className = 'vex-theme-plain'
vex.registerPlugin(vexDialog, 'dialog')

const ENABLE_DRAG_AND_DROP = true
const SHOW_MINI_TOOLTIPS = false
const miniTooltips = []

const skillNodeSizes = {
	1: 16,
	2: 24,
	3: 36,
	4: 48,
	5: 72,
}
let skillBoardSystem: SkillBoardSystem
let skillBoardRenderer: SkillBoardRenderer
let currentInputFrame = {
	mx: 0,
	my: 0,
}
let lastSkillId: number = -1
let currentlySelectedNode: SkillNodeGFX = null

class SkillBoardEditor {
    constructor(options?) {
        initialize(options)
    }
}

function initialize(options?) {
    skillBoardSystem = options.skillBoardSystem
    skillBoardRenderer = options.skillBoardRenderer
    let highestSkillId = -1
    const invalidNodes = []
    skillBoardSystem.skillNodes.forEach((skillNode) => {
        let isInvalid = false
        bindHandlersToSkillNodeGFX(skillNode.gfx)
        if (skillNode.skillId > highestSkillId) {
            highestSkillId = skillNode.skillId
        }
        if (!skillNode.name || skillNode.name === "Nameless") {
            isInvalid = true
        }
        if (!skillNode.payload || skillNode.payload.length === 0) {
            isInvalid = true
        }
        if (!skillNode.links || skillNode.links.size === 0) {
            isInvalid = true
        }
        if(isInvalid) {
            invalidNodes.push(skillNode)
		}
		if(SHOW_MINI_TOOLTIPS) {
			showMiniTooltip(skillNode.gfx, skillBoardRenderer.middlegroundLayer)
		}
    })
    console.log(`[NODES] ${invalidNodes.length} invalid nodes out of ${skillBoardSystem.skillNodes.size}`, {invalidNodes})
    lastSkillId = highestSkillId

	document.addEventListener("mousemove", handleMouseMove.bind(this))
	Mousetrap.bind("n", createNewNodeAtMouse, "keypress")
    Mousetrap.bind(
        "ctrl+s",
        function(event) {
            event.preventDefault()
            return saveBoardToLocal("skillboard-data")
        },
        "keypress",
    )
    Mousetrap.bind(
        "ctrl+l",
        function(event) {
            event.preventDefault()
            currentlySelectedNode = null
            skillBoardSystem.clearBoard()
            skillBoardSystem.loadAndApplyBoard()
            let highestSkill = -1
            skillBoardSystem.skillNodes.forEach((node) => {
                const skillNodeGFX = skillBoardSystem.createSkillNodeGFX(node)
                bindHandlersToSkillNodeGFX(skillNodeGFX)
                if (node.skillId > highestSkill) {
                    highestSkill = node.skillId
                }
            })
            lastSkillId = highestSkill
        },
        "keypress",
    )
    Mousetrap.bind(
        "ctrl+b",
        function(event) {
            event.preventDefault()
            return backupBoardToLocal()
        },
        "keypress",
    )

}

function handleMouseMove(event: MouseEvent) {
	currentInputFrame.mx = event.clientX
	currentInputFrame.my = event.clientY
}

function showMiniTooltip(skillNodeGFX: SkillNodeGFX, container) {
	const tooltip = new Tooltip({
		width: window.innerWidth,
		height: window.innerHeight,
	}, {
		padding: 3,
		margin: 6,
		linesMargin: 2,
	})
	miniTooltips.push(tooltip)

	const scale = 1 / skillBoardRenderer.mainCamera.scale.x
	tooltip.container.scale.set(scale, scale)
	const lines = []
	lines.push({ t: `${skillNodeGFX.node.name}`, c: "#000", b: true, size: 12 })
	// lines.push({ t: `#${skillNodeGFX.node.skillId}`, c: "#555", b: false, size: 10 })
	tooltip.render(lines)
	tooltip.update(skillNodeGFX.x - 25, skillNodeGFX.y + 35)
	container.addChild(tooltip.container)
}

function bindHandlersToSkillNodeGFX(skillNodeGFX: SkillNodeGFX) {
	skillNodeGFX.on("click", onMouseClickSkillNode.bind(skillNodeGFX))
	// events for drag start
	if(ENABLE_DRAG_AND_DROP) {
		skillNodeGFX.on("mousedown", onDragStartSkillNode.bind(skillNodeGFX))
		skillNodeGFX.on("touchstart", onDragStartSkillNode.bind(skillNodeGFX))
		// events for drag end
		skillNodeGFX.on("mouseup", onDragEndSkillNode.bind(skillNodeGFX))
		skillNodeGFX.on("mouseupoutside", onDragEndSkillNode.bind(skillNodeGFX))
		skillNodeGFX.on("touchend", onDragEndSkillNode.bind(skillNodeGFX))
		skillNodeGFX.on("touchendoutside", onDragEndSkillNode.bind(skillNodeGFX))
	}
	// events for drag move
	skillNodeGFX.on("mousemove", onMouseMoveSkillNode.bind(skillNodeGFX))
	skillNodeGFX.on("touchmove", onMouseMoveSkillNode.bind(skillNodeGFX))
}

function createNewNodeAtMouse(nodeData) {
	const { mx, my } = currentInputFrame
	const coords = skillBoardRenderer.convertMouseCoordToWorldCoord(mx, my)
	console.log({ mx, my, coords, pos: skillBoardRenderer.mainCamera.position })
	lastSkillId++
	console.log('Assigning this', nodeData)
	if(nodeData.name && nodeData.x && nodeData.y && nodeData.description) {
		nodeData = Object.assign({
			skillId: lastSkillId,
			name: "Nameless",
			description: "",
			size: 2,
			x: coords.x,
			y: coords.y,
			payload: [],
		}, nodeData ? {
			name: nodeData.name,
			description: nodeData.description,
			size: nodeData.size,
			x: nodeData.x,
			y: nodeData.y,
			payload: nodeData.payload,
		} : {})
	} else {
		nodeData = {
			skillId: lastSkillId,
			name: "Nameless",
			description: "",
			size: 2,
			x: coords.x,
			y: coords.y,
			payload: [],
		}
	}
	console.log('Now this', nodeData)
	const skillNode = new SkillNode(nodeData)
	skillBoardSystem.skillNodes.set(skillNode.skillId, skillNode)
    const skillNodeGFX = skillBoardSystem.createSkillNodeGFX(skillNode)
    bindHandlersToSkillNodeGFX(skillNodeGFX)
}

function getBoardSaveData() {
	const saveData = []
	skillBoardSystem.skillNodes.forEach((node) => {
		saveData.push(node.getSaveData())
	})

	console.log(JSON.stringify(saveData))

	return saveData
}

function saveBoardToLocal(storageKey) {
	const saveData = getBoardSaveData()
	console.log('saveBoardToLocal', {saveData, storageKey})

	if (storageKey === "skillboard-data") {
		const oldSaveData = loadBoardFromLocal()
		if (saveData.length < oldSaveData.length) {
			const prompt = window.prompt(`Your current board has ${saveData.length} nodes, but the currently saved board has ${oldSaveData.length}. Are you sure you want to overwrite?`)
			if (!prompt || prompt.toLowerCase() !== "y") {
				return
			}
		}
	}

	window.localStorage.setItem(storageKey, JSON.stringify(saveData))
	console.log("Board data saved")
}

function backupBoardToLocal() {
	const today = new Date()
	const yyyymmdd = today.toJSON().slice(0, 10)
	const hhmmss = `${today.getHours()}.${today.getMinutes()}.${today.getSeconds()}`
	const key = `skillboard-data-backup-${yyyymmdd}-${hhmmss}`
	console.log({ key, today, yyyymmdd, hhmmss })
	saveBoardToLocal(key)
}

function loadBoardFromLocal() {
	let saveData = window.localStorage.getItem("skillboard-data")
	console.log('loadBoardFromLocal', {saveData})
	if (!saveData) {
		saveData = JSON.stringify(SkillBoardJson)
	}
	return JSON.parse(saveData)
}

function duplicateNode(node: SkillNodeGFX) {
	createNewNodeAtMouse(node.node)
}

function selectNode(node: SkillNodeGFX) {
	currentlySelectedNode = node
	currentlySelectedNode.graphics.tint = 0xff8888
}

function selectLastNode(node: SkillNodeGFX) {
	const hash = getSortedHash(node.node.skillId, currentlySelectedNode.node.skillId)
	if (currentlySelectedNode !== node && !skillBoardSystem.skillEdgeGFXHashMap.get(hash)) {
		skillBoardSystem.linkNodes(currentlySelectedNode, node)
	} else {
		console.error("invalid node pair")
	}
	currentlySelectedNode.graphics.tint = 4 * 0xffffff
	currentlySelectedNode = null
}

function onMouseClickSkillNode(event) {
	const browserEvent: PointerEvent = event.data.originalEvent
	let skillNodeGFX: SkillNodeGFX
	skillNodeGFX = this

	if (browserEvent.shiftKey) {
		if (currentlySelectedNode) {
			selectLastNode(this)
		} else {
			selectNode(this)
		}
	}
	if (browserEvent.ctrlKey) {
		ctxmenu.invoke("#skill-render-canvas", browserEvent, [
			{ text: "Options" },
			{
				text: "Set name",
				action: () => {
					vex.dialog.open({
						message: `What name for node #${skillNodeGFX.node.skillId}?`,
						input: `<input name="name" type="text" placeholder="Skill of Skilling" value="${skillNodeGFX.node.name || ''}" required />`,
						buttons: [
							Object.assign({}, vex.dialog.buttons.YES, { text: 'Submit' }),
							Object.assign({}, vex.dialog.buttons.NO, { text: 'Cancel' }),
						],
						callback: (res) => {
							const { name } = res
							if(name) {
								skillNodeGFX.node.name = name
								skillBoardSystem.updateTooltip(skillNodeGFX)
							}
						}
					})
				},
			},
			{
				text: "Set description",
				action: () => {
					vex.dialog.open({
						message: `What description for node #${skillNodeGFX.node.skillId}?`,
						input: `<input name="descr" type="text" placeholder="Description" value="${skillNodeGFX.node.description || ''}" required />`,
						buttons: [
							Object.assign({}, vex.dialog.buttons.YES, { text: 'Submit' }),
							Object.assign({}, vex.dialog.buttons.NO, { text: 'Cancel' }),
						],
						callback: (res) => {
							const { description } = res
							if(description) {
								skillNodeGFX.node.description = description
								skillBoardSystem.updateTooltip(skillNodeGFX)
							}
						}
					})
				},
			},
			{
				text: "Set name & description",
				action: () => {
					vex.dialog.open({
						message: `What name & description for node #${skillNodeGFX.node.skillId}?`,
						input: [
							`<input name="name" type="text" placeholder="Skill of Skilling" value="${skillNodeGFX.node.name || ''}" required />`,
							`<input name="descr" type="text" placeholder="Description" value="${skillNodeGFX.node.description || ''}" required />`,
						].join(''),
						buttons: [
							Object.assign({}, vex.dialog.buttons.YES, { text: 'Submit' }),
							Object.assign({}, vex.dialog.buttons.NO, { text: 'Cancel' }),
						],
						callback: (res) => {
							const { name, description } = res
							if(name) {
								skillNodeGFX.node.name = name
								skillBoardSystem.updateTooltip(skillNodeGFX)
							}
							if(description) {
								skillNodeGFX.node.description = description
								skillBoardSystem.updateTooltip(skillNodeGFX)
							}
						}
					})
				},
			},
			{
				text: "Set node JSON",
				action: () => {
					const oldJson = JSON.stringify(skillNodeGFX.node.payload, undefined, 4) || []
					vex.dialog.open({
						message: `What JSON for node #${skillNodeGFX.node.skillId}?`,
						input: [
							`<textarea name="json" placeholder="JSON" rows="13" required>${oldJson}</textarea>`,
						].join(''),
						buttons: [
							Object.assign({}, vex.dialog.buttons.YES, { text: 'Submit' }),
							Object.assign({}, vex.dialog.buttons.NO, { text: 'Cancel' }),
						],
						callback: (res) => {
							const { json } = res
							if(json) {
								try {
									const obj = JSON.parse(json)
									skillNodeGFX.node.payload = obj
								} catch(err) {
									console.error(err)
									return
								}
							}
						}
					})
				},
			},
			{
				text: "Set size",
				action: () => {
					const prompt = window.prompt(`What size for node #${skillNodeGFX.node.skillId} (from 1-5)?`, skillNodeGFX.node.size.toString())
					const size = Number.parseInt(prompt, 10)
					if (!size || size < 1 || size > 5) {
						return
					}
					skillNodeGFX.node.size = size
				},
			},
			{
				text: "Set color",
				action: () => {
					const picker = Pickr.create({
						el: ".color-picker",
						theme: "nano",
						swatches: [
							"rgba(244, 67, 54, 1)",
							"rgba(233, 30, 99, 1)",
							"rgba(156, 39, 176, 1)",
							"rgba(103, 58, 183, 1)",
							"rgba(63, 81, 181, 1)",
							"rgba(33, 150, 243, 1)",
							"rgba(3, 169, 244, 1)",
							"rgba(0, 188, 212, 1)",
							"rgba(0, 150, 136, 1)",
							"rgba(76, 175, 80, 1)",
							"rgba(139, 195, 74, 1)",
							"rgba(205, 220, 57, 1)",
							"rgba(255, 235, 59, 1)",
							"rgba(255, 193, 7, 1)",
						],
						useAsButton: true,
						components: {
							palette: true,
							preview: true,
							opacity: false,
							hue: true,
						},
						strings: {
							save: "Save",
						},
						// interaction: {
						// 	input: true,
						// 	clear: true,
						// 	save: true
						// }
					})
					const onHide = function() {
						picker.off("hide", onHide)
						console.log("event hide fired once", event, arguments)
						const hexColor = picker
							.getColor()
							.toHEXA()
							.join("")
						const hexColorNum = Number.parseInt(hexColor, 10)
						console.log({ hexColor, hexColorNum })
						skillNodeGFX.node.color = `#${hexColor}`
						const fillColor = PIXIutils.string2hex(skillNodeGFX.node.color)
						skillNodeGFX.redraw(skillNodeSizes[skillNodeGFX.node.size], fillColor, 4, 0xcc5555)
					}
					picker.on("hide", onHide)
					picker.show()
				},
			},
			{
				text: "[DEBUG] Log node data",
				action: () => {
					console.log({ skillNodeGFX })
				},
			},
			{
				text: "Unlink from other nodes",
				action: () => {
					unlinkNodeFromAllOthers(skillNodeGFX)
				},
			},
			{
				text: "Duplicate node",
				action: () => {
					duplicateNode(skillNodeGFX)
				},
			},
			{
				text: "  ---",
				action: () => {
					unlinkNodeFromAllOthers(skillNodeGFX)
				},
			},
			{
				text: "Delete node",
				action: () => {
					deleteNode(skillNodeGFX)
				},
			},
		])
	}
}

function onDragStartSkillNode(event) {
	this.data = event.data
	this.alpha = 0.8
	this.dragging = true
	this.lastPosition = new Point(this.position.x, this.position.y)
}

function onDragEndSkillNode(event) {
	const xdiff = Math.abs(this.lastPosition.x - this.position.x)
	const ydiff = Math.abs(this.lastPosition.y - this.position.y)

	if (this.dragging) {
		// console.log("much drag")
		this.alpha = 1
		this.x = Math.round(this.x / 32) * 32
		this.y = Math.round(this.y / 32) * 32
		this.node.x = this.x
		this.node.y = this.y
		// this.graphics.tint = 0x888888 + 0x888888 * Math.random()
		this.data = null
		skillBoardSystem.redrawLines(this)
		const self = this
		event.stopPropagation()
		setTimeout(function() {
			self.dragging = false
		}, 0)
	} else {
		// console.log("no drag?")
		this.graphics.tint = 0xff8888
	}
}

function onMouseMoveSkillNode() {
	if (this.dragging) {
		const newPosition = this.data?.getLocalPosition(this.parent)
		if (newPosition) {
			this.position.x = newPosition.x
			this.position.y = newPosition.y
			skillBoardSystem.redrawLines(this)
		}
	}
}

function deleteNode(node: SkillNodeGFX) {
	const skillId = node.node.skillId
	skillBoardSystem.foreground.removeChild(node)
	unlinkNodeFromAllOthers(node)
	skillBoardSystem.skillNodes.delete(skillId)
	skillBoardSystem.skillNodeGFXMap.delete(skillId)
	if (currentlySelectedNode === node) {
		currentlySelectedNode = null
	}
}

function unlinkNodeFromAllOthers(node: SkillNodeGFX) {
	node.links.forEach((destNode) => {
		const hash = getSortedHash(node.node.skillId, destNode.node.skillId)
		const edge = skillBoardSystem.skillEdgeGFXHashMap.get(hash)
		skillBoardSystem.background.removeChild(edge)
		skillBoardSystem.skillEdgeGFXHashMap.delete(hash)
		skillBoardSystem.unlinkNodes(node, destNode)
	})
}

function getSortedHash(val1, val2): string {
	if (val1 > val2) {
		return `${val2}-${val1}`
	} else {
		return `${val1}-${val2}`
	}
}

export default SkillBoardEditor