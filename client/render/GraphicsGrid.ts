import { Container, Graphics, TilingSprite, Renderer, SCALE_MODES, Rectangle, Texture } from "pixi.js"

class GraphicsGrid extends Container {
	graphics: Graphics
	tilingSprite: TilingSprite
	generatedTexture: Texture
	renderer: Renderer

	constructor(renderer: Renderer, width: number, height: number, color: any, alpha: number) {
		super()

		this.renderer = renderer

		this.graphics = new Graphics()
		this.graphics.x = width
		this.graphics.y = 0
		this.graphics.lineStyle(3, color, alpha)
		this.graphics.lineTo(-width, 0).lineTo(-width, height)

		this.generatedTexture = this.renderer.generateTexture(this.graphics, SCALE_MODES.LINEAR, 1, new Rectangle(0, 0, width, height))
		this.tilingSprite = new TilingSprite(this.generatedTexture, width * 1000, height * 1000)

		this.addChild(this.tilingSprite)
	}
}

export default GraphicsGrid
