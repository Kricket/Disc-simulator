import DiscCalculator, {DISC_CONTOUR} from 'disc/DiscCalculator'
import DiscState, {UP, POS, VEL, LIFT, DRAG, D1, D2, D3} from 'disc/DiscState'

// Draw the path of the disc
export const PATH = 'path'



const DISC_POINTS = [
	new THREE.Vector2(0, 0),
	new THREE.Vector2(0.15, 0),
	new THREE.Vector2(0.2, -0.005),
	new THREE.Vector2(0.23, -0.007),
	new THREE.Vector2(0.25, -0.01),
	new THREE.Vector2(0.24, -0.02)
]

const VY = new THREE.Vector3(0,1,0)
const DRAWABLE_VECTORS = [VEL, LIFT, DRAG, D1, D2, D3]
const DRAWABLE_VECTOR_COLORS = {
	[LIFT]: 0x00AA50,
	[DRAG]: 0xAA0050,
	[VEL]: 0x808080,
	[D1]: 0xFF0000,
	[D2]: 0x00FF00,
	[D3]: 0x0000FF,
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


class Disc {
	constructor(scene) {
		this.show = {}
		this.scene = scene

		this.initialState = new DiscState()
		this.currentState = this.initialState
		this.createDiscMesh()
	}

	setInitial(key, value) {
		this.initialState[key] = value
		this.gotoInitialState()
	}

	setShow(show) {
		this.show[show] = !this.show[show]
		if(this.steps) {
			this.showOrHideExtras()
		}
	}

	gotoState(state) {
		this.currentState = state
		this.discMesh.position.copy(state[POS])
		this.discMesh.quaternion.setFromUnitVectors(VY, state[UP])

		DRAWABLE_VECTORS.forEach(v => this.moveVector(v))
	}

	gotoInitialState() {
		this.gotoState(this.initialState)
		this.steps = null
	}

	throw(update, done) {
		this.gotoInitialState()
		const self = this
		const calc = new DiscCalculator(this.initialState)
		calc.calculate(update, steps => {
			self.steps = steps
			self.showOrHideExtras()
			done(steps)
		})
	}

	getSteps() {
		return this.steps
	}

	// Show/hide optional stuff
	showOrHideExtras() {
		if(this.show[PATH]) {
			this.createPath()
		} else {
			this.hidePath()
		}

		DRAWABLE_VECTORS.forEach(v => this.createOrHideVector(v))
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
					DRAWABLE_VECTOR_COLORS[type])
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