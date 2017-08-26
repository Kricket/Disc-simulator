import React, { Component } from 'react'
import 'three/examples/js/controls/OrbitControls'


const FIELD_WIDTH = 100, FIELD_LENGTH = 100

const DISC_POINTS = [
	new THREE.Vector2(0, 0),
	new THREE.Vector2(0.15, 0),
	new THREE.Vector2(0.2, -0.005),
	new THREE.Vector2(0.23, -0.007),
	new THREE.Vector2(0.25, -0.01),
	new THREE.Vector2(0.24, -0.02)
]

const makeDisc = () => {
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

	const disc = new THREE.Mesh(geometry, material)
	return disc
}

const vtxSquare = (array, offset, x, z) => {
	array[offset   ] = x
	array[offset+1 ] = 0
	array[offset+2 ] = z
	array[offset+3 ] = x+1
	array[offset+4 ] = 0
	array[offset+5 ] = z
	array[offset+6 ] = 0
	array[offset+7 ] = 0
	array[offset+8 ] = 0
	array[offset+9 ] = 0
	array[offset+10] = 0
	array[offset+11] = 0
}

const makeField = () => {
	const fieldGeom = new THREE.PlaneBufferGeometry(FIELD_WIDTH, FIELD_LENGTH, FIELD_WIDTH, FIELD_LENGTH)
	fieldGeom.rotateX(-Math.PI/2)
	fieldGeom.translate(50,0,50)
	const colors = new Float32Array(fieldGeom.attributes.position.length)
	for(var i=0; i<colors.length; i+=3) {
		const dark = (i%18) < 9
		colors[i  ] = dark
		colors[i+1] = 1.0
		colors[i+2] = !dark
		/*
		colors[i  ] = i/colors.length
		colors[i+1] = 1.0 - i/colors.length
		colors[i+2] = (i%3) / 3
		*/
	}
	fieldGeom.addAttribute('color', new THREE.BufferAttribute(colors, 3))

	const material = new THREE.MeshBasicMaterial({
		vertexColors: THREE.VertexColors,
		wireframe: true
	})
	const field = new THREE.Mesh(fieldGeom, material)
	/*
	const fieldGeom = new THREE.PlaneGeometry(FIELD_WIDTH, FIELD_LENGTH, FIELD_WIDTH, FIELD_LENGTH)
	fieldGeom.rotateX(Math.PI/2)
	const material = new THREE.LineBasicMaterial({
		color: 0x20FF40,
	})

	const fieldBufferGeom = new THREE.BufferGeometry().fromGeometry(
		new THREE.EdgesGeometry(fieldGeom)
	)

	const field = new THREE.Mesh(fieldBufferGeom, material)
	field.translateX(50)
	field.translateZ(50)
/*
	const field = new THREE.GridHelper(100, 100)
	field.translateX(50)
	field.translateZ(50)
*/	
	return field
}


const WIDTH = 1024, HEIGHT = 768
const VX = new THREE.Vector3(1,0,0)
const VY = new THREE.Vector3(0,1,0)
const VZ = new THREE.Vector3(0,0,1)

class Field extends Component {
	constructor(props) {
		super(props)
	}

	render() {
		return (
			<div id="field"
				style={{width: WIDTH + "px", height: HEIGHT + "px"}}
				/>
		)
	}

	componentWillReceiveProps(nextProps) {
		const {initialUp, initialPos} = nextProps
		if(initialPos) {
			this.disc.position.fromArray(initialPos)
		}
		if(initialUp) {
			this.disc.quaternion.setFromUnitVectors(VY, new THREE.Vector3(...initialUp))
		}

		if(nextProps.steps) {
			this.addStepsToScene(nextProps.steps)
		}
	}

	componentDidMount() {
		const fieldElement = document.getElementById('field')
		
		const scene = new THREE.Scene()
		this.scene = scene

		const camera = new THREE.PerspectiveCamera( 75, WIDTH/HEIGHT, 0.1, 1000 )
		const controls = new THREE.OrbitControls(camera, fieldElement)
		camera.position.set(-1, 2, -1)
		camera.lookAt(new THREE.Vector3(0, 2, 0))
		this.camera = camera

		scene.add(new THREE.AmbientLight(0x404040))
		scene.add(new THREE.DirectionalLight(0xFFFFFF, 0.5))

		const renderer = new THREE.WebGLRenderer()
		renderer.setSize(WIDTH, HEIGHT)
		fieldElement.appendChild(renderer.domElement)

		const disc = makeDisc()
		this.disc = disc
		scene.add(disc)

		const field = makeField()
		scene.add(field)

		scene.add(new THREE.AxisHelper(1))

		const animate = () => {
			requestAnimationFrame(animate)

			renderer.render(scene, camera)
		}

		animate()
	}

	addStepsToScene(steps) {
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

		const line = new THREE.Line(geom, material)
		this.scene.add(line)
	}
}

export default Field