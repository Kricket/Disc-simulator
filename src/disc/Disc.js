import DiscCalculator from 'disc/DiscCalculator'

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
		this.initPos = new THREE.Vector3()
		this.initVel = new THREE.Vector3()
		this.initUp = VY.clone()
		this.createDiscMesh()
	}

	setInitialUp(upArr) {
		this.initUp = new THREE.Vector3(...upArr)
		this.gotoInitialState()
	}

	setInitialPos(posArr) {
		this.initPos = new THREE.Vector3(...posArr)
		this.gotoInitialState()
	}

	setPos(pos) {
		this.discMesh.position.copy(pos)
	}

	setInitialVel(velArr) {
		this.initVel = new THREE.Vector3(...velArr)
	}

	gotoInitialState() {
		this.discMesh.quaternion.setFromUnitVectors(VY, this.initUp)
		this.discMesh.position.copy(this.initPos)
	}

	throw() {
		this.gotoInitialState()
		const calc = new DiscCalculator(this.initPos, this.initVel)
		this.steps = calc.run()
		return this.steps
	}

	getSteps() {
		return this.steps
	}

	createDiscMesh() {
		const geometry = new THREE.LatheGeometry(DISC_POINTS)
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

	showTrajectory() {
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

			colors[i*3  ] = (i/steps.length)
			colors[i*3+1] = 1.0 - (i/steps.length)
			colors[i*3+2] = 1.0
		})

		geom.addAttribute('position', new THREE.BufferAttribute(positions, 3))
		geom.addAttribute('color', new THREE.BufferAttribute(colors, 3))
		geom.computeBoundingSphere()

		this.stepsMesh = new THREE.Line(geom, material)
		this.scene.add(this.stepsMesh)
	}
}

export default Disc