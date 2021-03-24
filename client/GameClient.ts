import "../common/Global.mixins.ts"
import "../common/Array.mixins.ts"
import "../common/Math.mixins.ts"
import "../common/String.mixins.ts"
import "../common/Number.mixins.ts"
import "@simonwep/pickr/dist/themes/nano.min.css"
import SkillBoardRenderer from "./skill-board/SkillBoardRenderer"
import SkillBoardSystem from "./skill-board/SkillBoardSystem"
import SkillBoardEditor from "./skill-board/SkillBoardEditor"
import SkillBoardAllocator from "./skill-board/SkillBoardAllocator"
import SkillBoardUserMixin from "./skill-board/SkillBoardUserMixin"

class GameClient {
	isLoaded: boolean = false
	skillBoardRenderer: SkillBoardRenderer
	skillBoardSystem: SkillBoardSystem
	skillBoardEditor: SkillBoardEditor
	skillBoardAllocator: SkillBoardAllocator

	constructor() {}

	initialize() {
		this.skillBoardRenderer = new SkillBoardRenderer()
		this.skillBoardRenderer.initialize(<HTMLCanvasElement>document.getElementById("skill-render-canvas"))

		this.skillBoardSystem = new SkillBoardSystem({
			skillBoardRenderer: this.skillBoardRenderer,
		})
		const container = this.skillBoardSystem.init()
		this.skillBoardRenderer.foregroundLayer.addChild(container)
		this.skillBoardEditor = new SkillBoardEditor({ 
			skillBoardRenderer: this.skillBoardRenderer,
			skillBoardSystem: this.skillBoardSystem,
		})

		const player: SkillBoardUserMixin = {
			allocatedNodeIds: [],
			visibleNodeIds: [],
			pointsEarned: 20,
		}

		// this.skillBoardAllocator = new SkillBoardAllocator({
		// 	player: player,
		// 	skillBoardRenderer: this.skillBoardRenderer,
		// 	skillBoardSystem: this.skillBoardSystem,
		// })


		if(this.skillBoardAllocator) {
			this.skillBoardAllocator.reapplyAllNodesBasedOnUserAllocations(player)
			this.skillBoardAllocator.bindHandlers(player)
		}

	}

	update(delta: number, now: any) {
		this.skillBoardRenderer.update(delta)
	}
}

export default GameClient
