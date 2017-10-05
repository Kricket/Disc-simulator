import 'three/examples/js/controls/OrbitControls'

const getRealDimensions = elem => {
	const d = {
		width: elem.clientWidth,
		height: elem.clientHeight
	}

	const style = getComputedStyle(elem)
	d.width -= parseFloat(style.paddingLeft) + parseFloat(style.paddingRight)
	d.height -= parseFloat(style.paddingTop) + parseFloat(style.paddingBottom)
	return d
}

class World {
	constructor(worldElement) {
		this.init(worldElement)
	}

	init(worldElement) {
		this.worldElement = worldElement
		this.scene = new THREE.Scene()
		const dim = getRealDimensions(worldElement)

		this.camera = new THREE.PerspectiveCamera( 75, dim.width / dim.height, 0.1, 1000 )
		this.camera.lookAt(new THREE.Vector3(0, 2, 0))
		this.camera.position.set(-1, 2, -1)
		const controls = new THREE.OrbitControls(this.camera, worldElement)

		this.scene.add(new THREE.AmbientLight(0x404040))
		this.scene.add(new THREE.DirectionalLight(0xFFFFFF, 0.5))

		this.renderer = new THREE.WebGLRenderer()
		this.renderer.setSize(dim.width, dim.height)
		worldElement.appendChild(this.renderer.domElement)

		window.addEventListener('resize', () => this.onResize(), true)
		//this.scene.add(new THREE.AxisHelper(1))
		this.startAnimation()
	}

	onResize() {
		const dim = getRealDimensions(this.worldElement)
		this.renderer.setSize(dim.width, dim.height)
		this.camera.aspect = dim.width / dim.height
		this.camera.updateProjectionMatrix()
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