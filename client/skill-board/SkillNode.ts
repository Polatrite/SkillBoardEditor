import SkillNodeGFX from "./SkillNodeGFX"

class SkillNode {
	skillId: number
	name: string
	description: string
	x: number
	y: number
	size: number = 2
	color: string = "#ffc107"
	gfx: SkillNodeGFX
	links: Map<number, SkillNode> = new Map()
	payload: any[] = []

	constructor(options) {
		const links = options.links
		delete options.links
		Object.assign(this, options)
		if (links?.length) {
			links.forEach((linkId) => {
				this.setLink(linkId, null)
			})
		}
	}

	setLink(linkId, skillNode) {
		this.links.set(linkId, skillNode)
	}

	getDescription() {
		const str = []
		if(this.description) {
			str.push(this.description)
		}
		this.payload.forEach((stat) => {
			str.push(stat.shortDescr)
			if (stat.longDescr) {
				str.push(stat.longDescr)
			}
		})
		return str
	}

	getSaveData() {
		const save = {
			skillId: this.skillId,
			x: this.x,
			y: this.y,
			links: Array.from(this.links.keys()),
			name: this.name,
			description: this.description,
			size: this.size,
			color: this.color,
			payload: this.payload,
		}
		console.log(JSON.stringify(save))

		return save
	}
}

export default SkillNode
