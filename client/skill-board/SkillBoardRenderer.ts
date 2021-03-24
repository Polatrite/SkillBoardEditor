import { autoDetectRenderer, Container, Renderer as PixiRenderer, Point, DisplayObject } from "pixi.js"
import { Viewport } from "pixi-viewport"
import Tooltip from "../render/Tooltip"
import BackgroundImage from "../render/BackgroundImage"

class SkillBoardRenderer {
	canvas: HTMLCanvasElement
	renderer: PixiRenderer

	tooltips: Tooltip[] = []
	mainCamera: Viewport
	mainUI: Container
	currentMap: Container
	backgroundLayer: Container
	middlegroundLayer: Container
	foregroundLayer: Container

	constructor() {
		this.mainCamera = new Viewport({
			screenWidth: window.innerWidth,
			screenHeight: window.innerHeight,
			worldWidth: 20000,
			worldHeight: 20000,
		})
		// center of tree
		this.mainCamera.x = -5236
		this.mainCamera.y = -5540
		this.mainCamera.scale.set(0.40, 0.40)
		this.mainCamera
			.drag({
				mouseButtons: "right",
			})
			.pinch()
			.clamp({
				left: 6000,
				right: 32000,
				top: 9000,
				bottom: 30000,
			})
			.clampZoom({
				minScale: 0.1,
				maxScale: 3,
			})
			.wheel({ smooth: 12 })
			.decelerate({ friction: 0.88 })
			.on('zoomed', (viewport, type) => {
				this.tooltips.forEach((tooltip: Tooltip) => {
					const scale = 1 / this.mainCamera.scale.x
					tooltip.container.scale.set(scale, scale)
				})
				this.onResize()
			})
		this.mainUI = new Container()
		this.currentMap = new Container()
		this.backgroundLayer = new Container()
		this.backgroundLayer.interactive = true
		this.backgroundLayer.on('click', (event) => {
			const position = event.data?.getLocalPosition(this.backgroundLayer.parent)
			// console.log(position)
		})
		this.middlegroundLayer = new Container()
		this.foregroundLayer = new Container()

		this.currentMap.addChild(this.backgroundLayer, this.middlegroundLayer, this.foregroundLayer)
		this.mainCamera.addChild(this.currentMap)
		this.mainUI.addChild(this.mainCamera)

		window.addEventListener("resize", this.onResize.bind(this))
	}

	worldCoordsToCameraCoords(coords) {
		const { x, y } = coords
		let cameraX = x * this.mainCamera.scale.x * -1
		cameraX += this.mainCamera.screenWidth / 2
		let cameraY = y * this.mainCamera.scale.y * -1
		cameraY += this.mainCamera.screenHeight / 2
		return { x: cameraX, y: cameraY }
	}

	cameraCoordsToWorldCoords(coords) {
		const { x, y } = coords
		const worldX = x / this.mainCamera.scale.x * -1
		const worldY = y / this.mainCamera.scale.y * -1
		return { x: worldX, y: worldY }
	}

	onAssetsLoaded() {
		// update all nodes with iconography
	}

	initialize(element: HTMLCanvasElement) {
		this.canvas = element
		this.canvas.addEventListener("contextmenu", (event) => {
			event.preventDefault()
		})

		this.renderer = autoDetectRenderer({
			width: window.innerWidth,
			height: window.innerHeight,
			view: this.canvas,
			antialias: false,
			resolution: 1,
		})

		const background: BackgroundImage = new BackgroundImage(this.renderer, './velvet-background-dark-optimized.jpg')
		this.backgroundLayer.addChild(background)
		this.onResize()
		this.update(0)
	}

	convertMouseCoordToWorldCoord(mouseX, mouseY) {
		return this.mainCamera.toWorld(new Point(mouseX, mouseY))
	}

	update(delta: number) {
		this.renderer.render(this.mainUI)
	}

	onResize() {
		const width = window.innerWidth
		const height = window.innerHeight
		this.canvas.width = width
		this.canvas.height = height
		this.renderer.resize(width, height)
		this.mainCamera.screenWidth = width
		this.mainCamera.screenHeight = height
		let startingY = 15
		this.mainUI.children.forEach((obj: DisplayObject) => {
			if(obj === this.mainCamera) {
				return
			}
			// console.log(obj)
			obj.x = (this.renderer.screen.width / 2) - obj.width / 2
			// if(obj?.sprite && obj?.text) {
			// 	obj.x -= obj.width
			// }
			startingY += obj.height
			obj.y = this.renderer.screen.height - startingY
		})
	}
}

export default SkillBoardRenderer
