// Components of the state
export const
	// Disc normal vector
	UP = 'up',
	// Linear position of the disc
	POS = 'pos',
	// Linear velocity of the disc
	VEL = 'vel',
	LIFT = 'lift',
	DRAG = 'drag',
	// Number of seconds elapsed since the start of the throw
	TIME = 'time';

class DiscState {
	constructor() {
		this[UP] = new THREE.Vector3(0,1,0)
		this[POS] = new THREE.Vector3(0,1,0)
		this[VEL] = new THREE.Vector3(1,1,0)
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