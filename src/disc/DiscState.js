// Components of the state
export const
	// Disc normal vector
	UP = 'up',
	// Linear position of the disc
	POS = 'pos',
	// Linear velocity of the disc
	VEL = 'vel',
	// Aerodynamic lift force
	LIFT = 'lift',
	// Aerodynamic drag force
	DRAG = 'drag',
	// Number of seconds elapsed since the start of the throw
	TIME = 'time',
	// Reference axes of the disc. D1 goes forward in the dir of velocity, D2 is the normal, D3 = D1 x D2
	D1 = 'd1', D2 = 'd2', D3 = 'd3';

class DiscState {
	constructor() {
		this[UP] = new THREE.Vector3(0,1,0)
		this[POS] = new THREE.Vector3(0,1,0)
		this[VEL] = new THREE.Vector3(1,1,0)
		this[LIFT] = new THREE.Vector3(0,0,0)
		this[DRAG] = new THREE.Vector3(0,0,0)
		this[D1] = new THREE.Vector3(1,0,0)
		this[D2] = new THREE.Vector3(0,1,0)
		this[D3] = new THREE.Vector3(0,0,1)
		this[TIME] = 0
	}

	clone() {
		const s = new DiscState()
		Object.keys(this).forEach(k => {
			s[k] = this[k].clone ? this[k].clone() : this[k]
		}, this)
		return s
	}
}

export default DiscState