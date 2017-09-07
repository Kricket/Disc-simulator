import DiscState, {
	UP, OMEGA, TORQUE,
	D1, D2, D3,
	POS, VEL, FORCE,
	LIFT, DRAG,
	TIME} from 'disc/DiscState'

const {Vector3, Plane} = THREE

// Time step, for accurate simulation
const SIM_DT = 0.00001
// Actual length of a time step that we record
const STEP_DT = 0.01

// World properties
const GRAVITY       = -9.80665; // m/s^2
const AIR_DENSITY   = 1.204; // ~20°C: kg/m^3
const AIR_VISCOSITY = 18.27; // ~15°C: kg/(ms) = Pa.s

// Aerodynamic coefficients (see "Simulation of Frisbee Flight")
const CL0      = -0.19; // Base lift coefficient
const CLalpha  = -2.4;  // alpha-dependent lift coefficient
const CD0      = 0.1;   // Base drag coefficient
const CDalpha  = 2.0;   // alpha-dependent drag coefficient
const pCDalpha = 4.0; // for positive angle-of-attack

// Inertia. Since the disc is symmetric, we can cheat here a bit...
const Iy  = 0.00235; // kg*m^2
const Ixz = 0.00122; // kg*m^2

// Disc constants
const FR_MASS	= 0.175;  // kg
const FR_RADIUS	= 0.1365; // meters
const FR_HEIGHT	= 0.025;  // meters

// Angle of minimum drag and zero lift. Should be ~ -4° = .06981317
const alpha0  = -CL0 / CLalpha;
// Area of the plane of the disc
const FR_AREA = Math.PI * FR_RADIUS * FR_RADIUS;

/******************************************************************************
     CALCULATION OF TORQUE

Torque on the disc is generated because the Center of Gravity (COG) is usually
not the same as the Center of (Aerodynamic) Pressure (COP - the point where the
aerodynamic forces are applied). In fact, they coincide at 3 angles: PI/2 and
-PI/2 (i.e. velocity is parallel with the disc normal), and alphaS (stable).

I estimate this offset (r) with 4 simple lines (r = m*alpha + b):
     x (nMIDalpha, nCOPmax)
    / \
   /   \ aS      PI/2
 -x-----x-|-------x-
-PI/2    \`      /
          \     /
           \   /
            \ /
             x (pMIDalpha, pCOPmax)
******************************************************************************/
const alphaS = -0.157079633; // angle at which COP = COG (~ -9°)

// Negative alpha
const nCOPmax   = FR_RADIUS / 20;                   // Maximum center of pressure
const nMIDalpha = alphaS/2 - Math.PI/4;             // alpha for max COP
const nCOPm     = nCOPmax / (nMIDalpha + Math.PI/2) // Slope of line, negative alpha (left segment)

// Positive alpha
const pCOPmax   = FR_RADIUS / -10;               // max. center of pressure
const pMIDalpha = alphaS/2 + Math.PI/4;          // alpha for max COP
const pCOPm     = pCOPmax / (pMIDalpha - alphaS) // Slope of line, positive alpha (left segment)

const getTorqueMag = alpha => {
	if(alpha < nMIDalpha) {
		return (alpha + Math.PI/2) * nCOPm
	} else if(alpha < alphaS) {
		return (alphaS - alpha) * nCOPm
	} else if(alpha < pMIDalpha) {
		return (alpha - alphaS) * pCOPm
	} else {
		return (Math.PI/2 - alpha) * pCOPm
	}
}
/*
console.log("-----------negative")
console.log("nCOPmax = " + nCOPmax)
console.log("nMIDalpha = " + nMIDalpha)
console.log("nCOPm = " + nCOPm)

console.log("-----------positive")
console.log("pCOPmax = " + pCOPmax)
console.log("pMIDalpha = " + pMIDalpha)
console.log("pCOPm = " + pCOPm)

console.log("-----------test")
console.log("offset at     -PI/2: " + getTorqueMag(-Math.PI/2))
console.log("offset at nMIDalpha: " + getTorqueMag(nMIDalpha))
console.log("offset at    alphaS: " + getTorqueMag(alphaS))
console.log("offset at pMIDalpha: " + getTorqueMag(pMIDalpha))
console.log("offset at      PI/2: " + getTorqueMag(Math.PI/2))
const da = Math.PI / 16
for(var x = -8; x <= 8; x++) {
	console.log("Alpha = " + x + " PI / 16;  offset = " + getTorqueMag(x*da))
}
*/
/*****************************************************************************/

// Shape of the disc
export const DISC_CONTOUR = [
	new THREE.Vector2( 0,                 0                ),
	new THREE.Vector2( 0.8  * FR_RADIUS,  0                ),
	new THREE.Vector2( 0.97 * FR_RADIUS, -0.32 * FR_HEIGHT ),
	new THREE.Vector2( 1.0  * FR_RADIUS, -0.72 * FR_HEIGHT ),
	new THREE.Vector2( 0.98 * FR_RADIUS, -1.0 * FR_HEIGHT  )
]

// Floating-point rounding
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
		this.state = new DiscState(initState)
	}

	// Start the async calculation loop
	calculate(update, done) {
		this.steps = [new DiscState(this.state)]
		const self = this

		const calculate = t => {
			update(self.state.time)
			self.step()
			self.steps.push(new DiscState(self.state))
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

		// Axes of the disc frame. d3 is the disc normal, d1 points in the dir of attack
		const d3 = this.state[UP]
		const d1 = getForwardVector(d3, this.state[VEL])
		const d2 = d3.clone().cross(d1)

		const vsq = this.state[VEL].dot(this.state[VEL])
		const nVel = this.state[VEL].clone().normalize()
		
		// alpha = the angle of attack. Positive alpha 
		const alpha = isZero(vsq) ? 0 : Math.PI/2 - d3.angleTo(this.state[VEL])

		// Estimate the surface area of the disc facing forward
		const planf_area = FR_AREA * Math.abs(Math.sin(alpha)) + // Flat surface of the disc
			FR_HEIGHT * FR_RADIUS * Math.cos(alpha) // Rim of the disc

		// A value that appears in several of the next calculations
		const pAv2_2 = AIR_DENSITY * planf_area * vsq / 2

		//===================
		// Drag and Lift
		//===================

		// Coefficient of drag
		const CD = CD0 + CDalpha * squared(alpha - alpha0)
		const fDrag = nVel.clone().multiplyScalar(
			-CD * pAv2_2 // The negative is so that this points away from velocity
		)

		// To calculate lift, start by figuring out its direction. It's perpendicular to vel.
		// We can get this by rotating d3 by alpha in the (d3, d1) plane
		const fLift = d3.clone().multiplyScalar(Math.cos(alpha)).add(
			d1.clone().multiplyScalar(-Math.sin(alpha))
		)

		// Coefficient of lift
		const CL = CL0 + CLalpha * alpha

		// Now, just get the magnitude of lift
		fLift.multiplyScalar(
			CL * pAv2_2
		)

		//===================
		// Torque
		//===================

		const force = fLift.clone().add(fDrag)
		const torque = d1.clone().cross(force).multiplyScalar(getTorqueMag(alpha))

		// Next: the spin creates a slight rolling torque..
		torque.add(
			alpha < alphaS ?
				this.state[OMEGA].clone().cross(d2).multiplyScalar(vsq / 3000000) :
				d2.clone().cross(this.state[OMEGA]).multiplyScalar(vsq / 500000)
		)

		//===================
		// Save and Integrate
		//===================

		// Add in gravity
		force.y += GRAVITY * FR_MASS

		//--- Rotation ------------------------//

		this.state[TORQUE] = torque.clone().multiplyScalar(200) // Make it bigger so it's more visible

		// To get the change in angular velocity, we need to decompose torque into its d2 and (d1,d3) components
		const yTorque = torque.clone().projectOnVector(d3)
		const xzTorque = torque.clone().sub(yTorque)
		const dOmega = yTorque.divideScalar(Iy).add(xzTorque.divideScalar(Ixz)).multiplyScalar(SIM_DT)
		const omega = this.state[OMEGA].add(dOmega)
		
		// Rotate d3 around omega
		const oNorm = omega.length()
		if(!isZero(oNorm)) {
			this.state[UP] = d3.clone().applyAxisAngle(
				omega.clone().normalize(), oNorm * SIM_DT
			)
		}

		//--- Linear --------------------------//
		this.state[D1] = d1
		this.state[D2] = d2
		this.state[D3] = d3

		this.state[LIFT] = fLift
		this.state[DRAG] = fDrag
		this.state[FORCE] = force.clone()

		force.multiplyScalar(SIM_DT)
		this.state[VEL].add(force)

		const dp = this.state[VEL].clone().multiplyScalar(SIM_DT)
		this.state[POS].add(dp)

		this.state[TIME] += SIM_DT
	}
}

export default DiscCalculator