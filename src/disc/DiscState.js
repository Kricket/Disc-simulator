// Components of the state
export const
	// Disc normal vector
	UP = 'up',
	// Linear position of the disc
	POS = 'pos',
	// Linear velocity of the disc
	VEL = 'vel';

export const defaultState = () => ({
	[UP]: new THREE.Vector3(0,1,0),
	[POS]: new THREE.Vector3(0,1,0),
	[VEL]: new THREE.Vector3(1,1,0)
})