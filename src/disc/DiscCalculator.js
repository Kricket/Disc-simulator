import {UP, POS, VEL} from 'disc/DiscState'

const {Vector3, Plane} = THREE

// Time step, for accurate simulation
const SIM_DT = 0.0001
// Actual length of a time step that we record
const STEP_DT = 0.01

// World properties
const GRAVITY       = -9.80665; // m/s^2
const AIR_DENSITY   = 1.204; // ~20°C: kg/m^3
const AIR_VISCOSITY = 18.27; // ~15°C: kg/(ms) = Pa.s

// Aerodynamic coefficients (see "Simulation of Frisbee Flight")
const CL0      = -0.19;
const CLalpha  = -2.4;
const CD0      = 0.1;
const CDalpha  = 2.0;
const pCDalpha = 4.0; // for positive angle-of-attack

// Inertia. Since the disc is symmetric, we can cheat here a bit...
const Iy  = 0.00235; // kg*m^2
const Ixz = 0.00122; // kg*m^2

// Disc constants
const FR_MASS	= 0.175;  // kg
const FR_RADIUS	= 0.1365; // meters
const FR_HEIGHT	= 0.025;  // meters

// Angle at which the COP coincides with the COG. Should be ~ -4° = .06981317
const alpha0  = -CL0 / CLalpha;
// Area of the plane of the disc
const FR_AREA = Math.PI * FR_RADIUS * FR_RADIUS;


// Shape of the disc
export const DISC_CONTOUR = [
	new THREE.Vector2( 0,                 0                ),
	new THREE.Vector2( 0.8  * FR_RADIUS,  0                ),
	new THREE.Vector2( 0.97 * FR_RADIUS, -0.32 * FR_HEIGHT ),
	new THREE.Vector2( 1.0  * FR_RADIUS, -0.72 * FR_HEIGHT ),
	new THREE.Vector2( 0.98 * FR_RADIUS, -1.0 * FR_HEIGHT  )
]

const EPSILON = 0.0000000001
const isZero = x => Math.abs(x) < EPSILON

// Get a normalized vector representing the velocity projected onto the disc's plane
const getForwardVector = (normal, vel) => {
	var f = new Plane(normal).projectPoint(vel)
	if(isZero(f.dot(f))) {
		// Velocity is orthogonal to the disc, so just pick an arbitrary vector
		f = new Plane(new Vector3(normal.y, normal.z, normal.x)).projectPoint(vel)
	}
	return f.normalize()
}

// Get x^2
const squared = x => x*x

/**
 * Takes initial conditions, and calculates the path of the disc until it hits the ground.
 */
class DiscCalculator {
	constructor(initState) {
		this.state = initState.clone()
	}

	// Start the async calculation loop
	calculate(update, done) {
		this.steps = [this.state.clone()]
		const self = this

		const calculate = t => {
			update(t)
			self.step()
			self.steps.push(self.state.clone())
			if(self.state.pos.y > 0) {
				requestAnimationFrame(calculate)
			} else {
				done(self.steps)
			}
		}

		requestAnimationFrame(calculate)
	}


	// Step forward one STEP_DT from the current state
	step() {
		const start = this.state.time
		while(this.state.time - start < STEP_DT && this.state.pos.y > 0) {
			this.__minStep()
		}
	}

	// Step forward one SIM_DT from the current state
	__minStep() {
		//===================
		// Setup
		//===================

		const force = new Vector3(0, GRAVITY, 0)
		const torque = new Vector3()

		// Axes of the disc frame. d3 is the disc normal, d1 points in the dir of attack
		const d3 = this.state[UP]
		const d1 = getForwardVector(d3, this.state.vel)
		const d2 = d3.clone().cross(d1)

		const vsq = this.state.vel.dot(this.state.vel)
		const nVel = this.state.vel.clone().normalize()
		
		// alpha = the angle of attack. Positive alpha 
		const alpha = isZero(vsq) ? 0 : Math.PI/2 - d3.angleTo(this.state.vel)

		// Estimate the surface area of the disc facing forward
		const planf_area = FR_AREA * Math.abs(Math.sin(alpha)) + // Flat surface of the disc
			FR_HEIGHT * FR_RADIUS * Math.cos(alpha) // Rim of the disc

		//===================
		// Drag and Lift
		//===================

		// Coefficient of drag
		const CD = CD0 + CDalpha * squared(alpha - alpha0)
		const fDrag = nVel.clone().multiplyScalar(
			CD * AIR_DENSITY * planf_area * vsq * (-0.5)
		)

		// Coefficient of lift
		const CL = CL0 + CLalpha * alpha
		// To calculate lift, start by figuring out its direction. It's perpendicular to vel.
		// We can get this by rotating d3 by alpha
		const fLift = d3.clone().multiplyScalar(Math.cos(alpha)).add(
			d1.clone().multiplyScalar(Math.sin(alpha)))

		// Now, just get the magnitude of lift
		fLift.multiplyScalar(
			CL * AIR_DENSITY * planf_area * vsq * (-0.5)
		)

		force.add(fLift)
		force.add(fDrag)

		//===================
		// Save and Integrate
		//===================

		this.state.lift = fLift
		this.state.drag = fDrag
		this.state.force = force.clone()

		force.multiplyScalar(SIM_DT)
		this.state.vel.add(force)

		const dp = this.state.vel.clone().multiplyScalar(SIM_DT)
		this.state.pos.add(dp)

		this.state.time += SIM_DT
	}
}

export default DiscCalculator