const {Vector3} = THREE

// Minimum time step, for accurate simulation
const MIN_DT = 0.0001
// Actual length of a time step that we record
const STEP_DT = 0.01

// Gravity, in m/s^2
const GRAVITY = -9.807

/**
 * Utility class that takes the initial state of a disc, and simulates its movement until
 * it hits the ground.
 */
class Disc {
	constructor() {
		this.pos = new Vector3()
		this.vel = new Vector3()
		this.time = 0
	}

	run() {
		const steps = []
		while(this.pos.y > 0) {
			this.step()
			steps.push(this.copyState())
		}

		return steps
	}

	// Get an object with a copy of the current state of the disc
	copyState() {
		return {
			time: this.time,
			pos: this.pos.clone(),
			vel: this.vel.clone()
		}
	}

	// Step forward one STEP_DT from the current state
	step() {
		const start = this.time
		while(this.time - start < STEP_DT && this.pos.y > 0) {
			this.__minStep()
		}
	}

	// Step forward one MIN_DT from the current state
	__minStep() {
		const force = new Vector3(0, GRAVITY, 0)

		force.multiplyScalar(MIN_DT)
		this.vel.add(force)

		const dp = this.vel.clone().multiplyScalar(MIN_DT)
		this.pos.add(dp)

		this.time += MIN_DT
	}
}

export default Disc