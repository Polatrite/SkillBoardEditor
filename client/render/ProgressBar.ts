import { Container, Graphics } from "pixi.js";

const lineThickness = 2

class ProgressBar extends Container {
    fill: Graphics
    border: Graphics
    percent: number
    color: number

    constructor(options?) {
        super()

        Object.assign(this, options)

        this.border = new Graphics()
        this.fill = new Graphics()
        this.border.beginFill(0x000000)
        this.border.lineStyle(lineThickness, 0x000000, 1)
        this.border.drawRect(0, 0, options.width, options.height)

        this.updateBar(1)

        this.addChild(this.border, this.fill)
    }

    updateBar(percent) {
        if(percent !== this.percent) {
            const width = Math.clamp(percent, 0, 1) * (this.border.width - lineThickness*3)
            this.fill.clear()
            let fill
            let stroke
            if(this.color === 0xCC0000) {
                fill = 0xCC0000
                stroke = 0xAA0000
            }
            if(this.color === 0x00CC00) {
                fill = 0x00CC00
                stroke = 0x00AA00
            }
            this.fill.beginFill(fill)
            this.fill.lineStyle(lineThickness, stroke, 1)
            this.fill.drawRect(
                0 + lineThickness,
                0 + lineThickness,
                width,
                this.border.height - lineThickness*3
            )

            this.percent = percent
        }
    }
}

export default ProgressBar