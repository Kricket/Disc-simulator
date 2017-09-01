import {UP, POS, VEL} from 'disc/DiscState'

const {Vector3} = THREE

// Time step, for accurate simulation
const SIM_DT = 0.0001
// Actual length of a time step that we record
const STEP_DT = 0.01

// Gravity, in m/s^2
const GRAVITY = -9.807


/**
 * Takes initial conditions, and calculates the path of the disc until it hits the ground.
 */
class DiscCalculator {
	constructor(initState) {
		this.pos = initState[POS].clone()
		this.vel = initState[VEL].clone()
		this.time = 0
	}

	run() {
		this.steps = []
		while(this.pos.y > 0) {
			this.step()
			this.steps.push(this.copyState())
		}

		return this.steps
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

	// Step forward one SIM_DT from the current state
	__minStep() {
		const force = new Vector3(0, GRAVITY, 0)

		force.multiplyScalar(SIM_DT)
		this.vel.add(force)

		const dp = this.vel.clone().multiplyScalar(SIM_DT)
		this.pos.add(dp)

		this.time += SIM_DT
	}
}

export default DiscCalculator