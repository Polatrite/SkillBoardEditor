import { Container, Graphics, TilingSprite, Renderer, SCALE_MODES, Rectangle, Texture, Sprite } from "pixi.js"

class BackgroundImage extends Container {
	sprite: Sprite
	tilingSprite: TilingSprite
	generatedTexture: Texture

	constructor(renderer: Renderer, spriteUrl) {
		super()

		this.sprite = Sprite.from(spriteUrl)
		this.sprite.pivot.set(0, 0)

		this.sprite.texture.baseTexture.on(
			"loaded",
			function() {
				this.generatedTexture = renderer.generateTexture(this.sprite, SCALE_MODES.LINEAR, 1, new Rectangle(this.sprite.width, this.sprite.height))
				this.tilingSprite = new TilingSprite(this.sprite.texture, this.sprite.width * 1000, this.sprite.height * 1000)
				this.tilingSprite.tilePosition.set(400, 0)
				this.tilingSprite.tint = 0x0000aa
				// let tint = 0x000000
				// setInterval(function() {
				// 	tint += 16
				// 	this.tilingSprite.tint = tint
				// }.bind(this), 200)
				this.addChild(this.tilingSprite)
			}.bind(this),
		)
	}
}

export default BackgroundImage
