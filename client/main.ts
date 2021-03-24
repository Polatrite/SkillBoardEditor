import GameClient from "./GameClient"

const fps = 60
const fpsInterval = 1 / fps

window.addEventListener("load", function() {
	const gameClient = new GameClient()
	gameClient.initialize()

	let startTick = performance.now()

	const gameLoop = function() {
		window.requestAnimationFrame(gameLoop)

		const endTick = performance.now()
		const delta = Math.min(1, (endTick - startTick) / 1000) // seconds

		if(delta > fpsInterval) {
			gameClient.update(delta, startTick)
			startTick = startTick + (delta * 1000)
			// console.log(`delta ${delta}, update, start ${startTick} end ${endTick}`)
		} else {
			// console.log(`delta ${delta}`)
		}
	}

	gameLoop()
})
