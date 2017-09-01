import DiscCalculator, {DISC_CONTOUR} from 'disc/DiscCalculator'
import DiscState, {UP, POS, VEL} from 'disc/DiscState'

const DISC_POINTS = [
	new THREE.Vector2(0, 0),

	new THREE.Vector2(0.15, 0),
	new THREE.Vector2(0.2, -0.005),
	new THREE.Vector2(0.23, -0.007),
	new THREE.Vector2(0.25, -0.01),
	new THREE.Vector2(0.24, -0.02)
]


const VY = new THREE.Vector3(0,1,0)

class Disc {
	constructor(scene) {
		this.scene = scene

		this.initialState = new DiscState()
		this.createDiscMesh()
	}

	setInitial(key, value) {
		this.initialState[key] = value
		this.gotoInitialState()
	}

	setShowTrajectory(show) {
		this.showTrajectory = !!show
		if(this.steps) {
			if(this.showTrajectory) {
				this.createTrajectory()
			} else {
				this.hideTrajectory()
			}
		}
	}

	gotoState(state) {
		this.discMesh.position.copy(state[POS])
		this.discMesh.quaternion.setFromUnitVectors(VY, state[UP])
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
		if(this.showTrajectory) {
			this.createTrajectory()
		} else {
			this.hideTrajectory()
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

	hideTrajectory() {
		if(this.stepsMesh) {
			this.scene.remove(this.stepsMesh)
		}
	}

	createTrajectory() {
		this.hideTrajectory()
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
}

export default Disc