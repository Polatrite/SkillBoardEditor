import { Container, Text, Sprite } from "pixi.js";

class Button extends Container {
    sprite: Sprite
    text: Text
    clickFn

    constructor(spriteUrl, text, fontSize, width, height, clickFn, options?) {
        super()

        this.sprite = Sprite.from(spriteUrl)
        this.resize(width, height)
        this.text = new Text(text, {
            align: 'center',
            fontSize: fontSize,
            fontWeight: 'bold',
            letterSpacing: 2,
            fill: 0xFFFFFF,
            stroke: 0x333333,
            strokeThickness: 2,
        })
        this.text.position.set(8, 6)

        this.interactive = true
        this.clickFn = clickFn
        this.addListener("click", this.clickFn)
        this.addListener("touchend", this.clickFn)
        this.addChild(this.sprite, this.text)
        // this.text.width = this.width
        // this.text.height = this.height
        this.sprite.width = this.width
    }

    resize(width, height) {
        this.width = width
        this.height = height
        this.sprite.width = width
        this.sprite.height = height
    }

    redraw(text) {
        // this.text.text = text
        // this.text.width = this.width
    }
}

export default Button