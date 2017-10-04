import {FR_RADIUS, FR_HEIGHT} from 'disc/DiscCalculator'
import DiscState, {UP, OMEGA, TORQUE, POS, VEL, LIFT, DRAG, D1, D2, D3, FORCE} from 'disc/DiscState'

// Draw the path of the disc
export const PATH = 'path'

// Shape of the disc
const DISC_CONTOUR = [
	new THREE.Vector2( 0,                 0                ),
	new THREE.Vector2( 0.8  * FR_RADIUS,  0                ),
	new THREE.Vector2( 0.97 * FR_RADIUS, -0.32 * FR_HEIGHT ),
	new THREE.Vector2( 1.0  * FR_RADIUS, -0.72 * FR_HEIGHT ),
	new THREE.Vector2( 0.98 * FR_RADIUS, -1.0 * FR_HEIGHT  )
]

const VY = new THREE.Vector3(0,1,0)

// Vectors that can be drawn, and their colors
const DRAWABLE_VECTORS = {
	[LIFT]: 0x00AA50,
	[DRAG]: 0xAA0050,
	[FORCE]: 0xFF00FF,
	[VEL]: 0x808080,
	[D1]: 0xFF0000,
	[D2]: 0x00FF00,
	[D3]: 0x0000FF,
	[OMEGA]: 0x4080B0,
	[TORQUE]: 0xB08040,
}

const lineFloatArray = (a,b) => {
	const positions = a.toArray()
	positions.push(...b.toArray())
	return new Float32Array(positions)
}

// Create a line from a to b, of the given color
const createLine = (a, b, color) => {
	const geom = new THREE.BufferGeometry()
	const material = new THREE.LineBasicMaterial({color: color})

	geom.addAttribute('position', new THREE.BufferAttribute(lineFloatArray(a,b), 3))
	geom.computeBoundingSphere()
	return new THREE.Line(geom, material)
}


// Move a previously-created line to the new given coordinates
const moveLine = (line, a, b) => {
	line.geometry.addAttribute('position', new THREE.BufferAttribute(lineFloatArray(a,b), 3))
	line.geometry.computeBoundingSphere()
}

/**
 * Class for drawing the disc (and related disc state stuff)
 */
class Disc {
	constructor(scene) {
		this.show = {}
		this.scene = scene

		this.currentState = new DiscState()
		this.createDiscMesh()
	}

	setShow(type, shown) {
		this.show[type] = !!shown
		this.showOrHideExtras()
	}

	setSteps(steps) {
		this.steps = steps
		this.showOrHidePath()
	}

	setState(state) {
		this.currentState = state
		this.discMesh.position.copy(state[POS])
		this.discMesh.quaternion.setFromUnitVectors(VY, state[UP])

		Object.keys(DRAWABLE_VECTORS).forEach(v => this.moveVector(v))
	}

	// Show/hide optional stuff
	showOrHideExtras() {
		this.showOrHidePath()
		Object.keys(DRAWABLE_VECTORS).forEach(v => this.createOrHideVector(v))
	}

	showOrHidePath() {
		if(this.show[PATH]) {
			this.createPath()
		} else {
			this.hidePath()
		}
	}

	createDiscMesh() {
		const geometry = new THREE.LatheGeometry(DISC_CONTOUR, 72)
		geometry.faces.forEach(face => face.materialIndex = Math.floor(Math.random() * 100))
		geometry.sortFacesByMaterialIndex()

		const material = new THREE.MeshPhongMaterial({
			color: 0xEEEEEE,
			specular: 0x00FF80,
			shininess: 50,
			shading: THREE.FlatShading,
			side: THREE.DoubleSide
		})

		this.discMesh = new THREE.Mesh(geometry, material)
		this.scene.add(this.discMesh)
	}

	hidePath() {
		if(this.stepsMesh) {
			this.scene.remove(this.stepsMesh)
		}
	}

	createPath() {
		this.hidePath()
		const {steps} = this
		if(!steps) {
			return
		}

		const geom = new THREE.BufferGeometry()
		const material = new THREE.LineBasicMaterial({
			vertexColors: THREE.VertexColors,
			//linewidth: 2
		})

		const positions = new Float32Array(steps.length * 3)
		const colors = new Float32Array(steps.length * 3)

		steps.forEach((step, i) => {
			positions[i*3  ] = step.pos.x
			positions[i*3+1] = step.pos.y
			positions[i*3+2] = step.pos.z

			const vel = step.vel.length()
			colors[i*3  ] = vel / 10.0
			colors[i*3+1] = 1.0 - vel / 10.0
			colors[i*3+2] = Math.abs(10.0 - vel) / vel
		})

		geom.addAttribute('position', new THREE.BufferAttribute(positions, 3))
		geom.addAttribute('color', new THREE.BufferAttribute(colors, 3))
		geom.computeBoundingSphere()

		this.stepsMesh = new THREE.Line(geom, material)
		this.scene.add(this.stepsMesh)
	}

	createOrHideVector(type) {
		if(!this.show[type]) {
			if(this['vector' + type]) {
				this.scene.remove(this['vector' + type])
				this['vector' + type] = null
			}
			return
		} else {
			if(!this['vector' + type]) {
				this['vector' + type] = createLine(
					this.currentState[POS],
					this.currentState[POS].clone().add(this.currentState[type]),
					DRAWABLE_VECTORS[type])
				this.scene.add(this['vector' + type])
			}
		}
	}

	moveVector(type) {
		const state = this.currentState
		if(this['vector' + type] && state[type] && state[POS]) {
			moveLine(this['vector' + type], state[POS], state[POS].clone().add(state[type]))
		}
	}
}

export default Disc