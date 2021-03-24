import { Point, Text } from "pixi.js"
import SkillNodeGFX from "./SkillNodeGFX"
import SkillBoardSystem from "./SkillBoardSystem"
import SkillBoardUserMixin from "./SkillBoardUserMixin"
import SkillBoardRenderer from "./SkillBoardRenderer"
import Button from "../render/Button"

let skillBoardRenderer: SkillBoardRenderer
let lastAllocatedNodeIDs = []
let lastTouchedNode: SkillNodeGFX
const unallocatedLineStyle = {
    width: 10,
    color: 0x555555,
    alpha: 0.5
}
const availableLineStyle = {
    width: 10,
    color: 0x999999,
    alpha: 0.6,
}
const allocatedLineStyle = {
    width: 10,
    color: 0xFFFFFF,
    alpha: 1
}

class SkillBoardAllocator {
    allocationText: Text
    respecButton: Button
    removeLastPointButton: Button
    skillBoardSystem: SkillBoardSystem

    constructor(options?) {
        const self = this
        this.skillBoardSystem = options.skillBoardSystem
        skillBoardRenderer = options.skillBoardRenderer
        const player: SkillBoardUserMixin = options.player

        this.allocationText = new Text('??/??', {
            align: 'right',
            fill: 0x333333,
            fontSize: 48,
            fontWeight: 'bold',
            letterSpacing: 5,
            stroke: 'white',
            strokeThickness: 3,
        })
        this.allocationText.anchor.set(0, 0)
        this.respecButton = new Button('./button.png', 'Reset Tree', 16, 120, 32, (event) => {
            player.allocatedNodeIds.clear()
            player.allocatedNodeIds.push(1)
            self.redrawAllNodesBasedOnUserAllocations(player)
        })
        this.removeLastPointButton = new Button('./button.png', 'Remove Last Point', 12, 160, 28, (event) => {
            const nodeId = player.allocatedNodeIds.slice(-1).pop()
            if(nodeId === 1) {
                return
            }
            player.allocatedNodeIds.pop()
            const skillNodeGFX = self.skillBoardSystem.skillNodeGFXMap.get(nodeId)
            self.redrawAdjacentNodesBasedOnUserAllocations(player, skillNodeGFX)
        })
        skillBoardRenderer.mainUI.addChild(this.removeLastPointButton, this.respecButton, this.allocationText)
        setTimeout(() => {
            skillBoardRenderer.onResize()
        }, 1)
		skillBoardRenderer.backgroundLayer.on('touchend', (event) => {
            if(lastTouchedNode) {
                lastTouchedNode.isTouchedOnce = false
            }
		})

    }

    bindHandlers(user: SkillBoardUserMixin) {
        const self = this
        this.skillBoardSystem.skillNodes.forEach((skillNode) => {
            // console.log('binding handlers to ', skillNode)
            self.bindHandlersToSkillNodeGFX(skillNode.gfx, self, user)
        })
    }

    private bindHandlersToSkillNodeGFX(skillNodeGFX: SkillNodeGFX, skillBoardAllocator, user: SkillBoardUserMixin) {
        skillNodeGFX.on("click", function(event) {
            const browserEvent = event.data.originalEvent
            if(browserEvent?.shiftKey || browserEvent?.ctrlKey) {
                onMouseRightClickSkillNode.bind(skillNodeGFX)(event, skillBoardAllocator, user)
            }
            onMouseClickSkillNode.bind(skillNodeGFX)(event, skillBoardAllocator, user)
        })
        skillNodeGFX.on("touchstart", function(event) {
            onTouchStartTooltipSkillNode.bind(skillNodeGFX)(event, skillBoardAllocator, user)
        })
        skillNodeGFX.on("touchend", function(event) {
            onTouchEndSkillNode.bind(skillNodeGFX)(event, skillBoardAllocator, user)
        })
    }

    reapplyAllNodesBasedOnUserAllocations(user: SkillBoardUserMixin) {
        // console.log('reapply, user\'s nodes:', user.allocatedNodeIds)
        user.allocatedNodeIds.forEach((skillId) => {
            const skillNodeGFX = this.skillBoardSystem.skillNodeGFXMap.get(skillId)
			// apply changes based on passive tree
        })
        this.redrawAllNodesBasedOnUserAllocations(user)
    }

    redrawAllocationText(user: SkillBoardUserMixin) {
        this.allocationText.text = `${user.allocatedNodeIds.length}/${user.pointsEarned}`
        skillBoardRenderer.onResize()
    }
    
    redrawAllNodesBasedOnUserAllocations(user: SkillBoardUserMixin) {
        this.skillBoardSystem.skillNodes.forEach((skillNode) => {
            const skillNodeGFX = skillNode.gfx
            this.redrawNodeBasedOnUserAllocations(user, skillNodeGFX)
        })
    }

    redrawAdjacentNodesBasedOnUserAllocations(user: SkillBoardUserMixin, skillNodeGFX: SkillNodeGFX) {
        this.redrawNodeBasedOnUserAllocations(user, skillNodeGFX)
        skillNodeGFX.links.forEach((node) => {
            this.redrawNodeBasedOnUserAllocations(user, node)
        })
    }

    redrawNodeBasedOnUserAllocations(user: SkillBoardUserMixin, skillNodeGFX: SkillNodeGFX) {
        this.redrawAllocationText(user)
        lastAllocatedNodeIDs = user.allocatedNodeIds.slice()
        if(user.allocatedNodeIds.contains(skillNodeGFX.node.skillId)) {
            skillNodeGFX.graphics.tint = 0xFFFFFF
        } else {
            skillNodeGFX.graphics.tint = 0x444444
        }
        skillNodeGFX.links.forEach((link) => {
            let selectedLineStyle
            if(user.allocatedNodeIds.contains(link.node.skillId)) {
                if(user.allocatedNodeIds.contains(skillNodeGFX.node.skillId)) {
                    selectedLineStyle = allocatedLineStyle
                } else {
                    selectedLineStyle = availableLineStyle
                }
            } else {
                selectedLineStyle = unallocatedLineStyle
            }
            const hash = getSortedHash(link.node.skillId, skillNodeGFX.node.skillId)
            const skillEdgeGFX = this.skillBoardSystem.skillEdgeGFXHashMap.get(hash)
            skillEdgeGFX.redrawFromPoints(
                new Point(skillNodeGFX.x, skillNodeGFX.y),
                new Point(link.node.gfx.x - skillNodeGFX.x, link.node.gfx.y - skillNodeGFX.y),
                selectedLineStyle
            )
        })
    }
}

function onTouchStartTooltipSkillNode(event, skillBoardAllocator: SkillBoardAllocator, user: SkillBoardUserMixin) {
	const browserEvent: PointerEvent = event.data.originalEvent
	let skillNodeGFX: SkillNodeGFX
    skillNodeGFX = this
    skillBoardAllocator.skillBoardSystem.showTooltip(skillNodeGFX)
}

function onMouseClickSkillNode(event, skillBoardAllocator: SkillBoardAllocator, user: SkillBoardUserMixin) {
	let skillNodeGFX: SkillNodeGFX
    skillNodeGFX = this

    tryAllocatePoint(skillNodeGFX, skillBoardAllocator, user)
}

function onMouseRightClickSkillNode(event, skillBoardAllocator: SkillBoardAllocator, user: SkillBoardUserMixin) {
	let skillNodeGFX: SkillNodeGFX
    skillNodeGFX = this

    tryUnallocatePoint(skillNodeGFX, skillBoardAllocator, user)
}

function onTouchEndSkillNode(event, skillBoardAllocator: SkillBoardAllocator, user: SkillBoardUserMixin) {
	const browserEvent: PointerEvent = event.data.originalEvent
	let skillNodeGFX: SkillNodeGFX
    skillNodeGFX = this

    if(skillNodeGFX.isTouchedOnce) {
        tryAllocatePoint(skillNodeGFX, skillBoardAllocator, user)
    } else {
        if(lastTouchedNode) {
            lastTouchedNode.isTouchedOnce = false
        }
        skillNodeGFX.isTouchedOnce = true
        lastTouchedNode = skillNodeGFX
        setTimeout(() => {
            skillNodeGFX.isTouchedOnce = false
        }, 30000)
    }
    

}

function tryAllocatePoint(skillNodeGFX: SkillNodeGFX, skillBoardAllocator: SkillBoardAllocator, user: SkillBoardUserMixin) {
    const skillId = skillNodeGFX.node.skillId
    // console.log(`checking node availability for ${skillId}`)

    if(user.allocatedNodeIds.length >= user.pointsEarned) {
        // console.log(`user does not have any points available ${user.pointsEarned}/${user.allocatedNodeIds.length}`)
        return
    }

    if(user.allocatedNodeIds.contains(skillId)) {
        // nothing
        // console.log('point is already owned!')
    } else {
        let isAvailable = false
        skillNodeGFX.node.links.forEach((link) => {
            if(user.allocatedNodeIds.contains(link.skillId)) {
                isAvailable = true
            }
        })
        if(isAvailable) {
            user.allocatedNodeIds.push(skillId)
            skillBoardAllocator.redrawNodeBasedOnUserAllocations(user, skillNodeGFX)
        } else {
            // console.log(`node is not available`)
        }
    }
}

function tryUnallocatePoint(skillNodeGFX: SkillNodeGFX, skillBoardAllocator: SkillBoardAllocator, user: SkillBoardUserMixin) {
    const skillId = skillNodeGFX.node.skillId
    // console.log(`checking node availability for ${skillId}`)

    if(!user.allocatedNodeIds.contains(skillId)) {
        // nothing
        console.log('point is not owned!')
    } else {
        let canRemove = true
        skillNodeGFX.node.links.forEach((link) => {
            if(user.allocatedNodeIds.contains(link.skillId)) {
                canRemove = false
            }
        })
        if(canRemove) {
            user.allocatedNodeIds.remove(skillId)
            skillBoardAllocator.redrawNodeBasedOnUserAllocations(user, skillNodeGFX)
        } else {
            // console.log(`node is not available`)
        }
    }
}

function getSortedHash(val1, val2): string {
	if (val1 > val2) {
		return `${val2}-${val1}`
	} else {
		return `${val1}-${val2}`
	}
}

export default SkillBoardAllocator