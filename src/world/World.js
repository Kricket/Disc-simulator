import 'three/examples/js/controls/OrbitControls'

class World {
	constructor(worldElement) {
		this.init(worldElement)
	}

	init(worldElement) {
		this.scene = new THREE.Scene()

		this.camera = new THREE.PerspectiveCamera( 75, worldElement.offsetWidth / worldElement.offsetHeight, 0.1, 1000 )
		this.camera.lookAt(new THREE.Vector3(0, 2, 0))
		this.camera.position.set(-1, 2, -1)
		const controls = new THREE.OrbitControls(this.camera, worldElement)

		this.scene.add(new THREE.AmbientLight(0x404040))
		this.scene.add(new THREE.DirectionalLight(0xFFFFFF, 0.5))

		this.renderer = new THREE.WebGLRenderer()
		this.renderer.setSize(worldElement.offsetWidth, worldElement.offsetHeight)
		worldElement.appendChild(this.renderer.domElement)

		this.scene.add(new THREE.AxisHelper(1))
		this.startAnimation()
	}

	startAnimation() {
		const self = this
		const animate = (time) => {
			requestAnimationFrame(animate)
			self.renderer.render(self.scene, self.camera)
		}

		requestAnimationFrame(animate)
	}
}

export default World