const FIELD_WIDTH = 100, FIELD_LENGTH = 100

class Field {
	constructor(scene) {
		this.createMesh()
		scene.add(this.fieldMesh)
	}

	createMesh() {
		const fieldGeom = new THREE.PlaneBufferGeometry(FIELD_WIDTH, FIELD_LENGTH, FIELD_WIDTH, FIELD_LENGTH)
		fieldGeom.rotateX(-Math.PI/2)
		fieldGeom.translate(50,0,50)

		const colors = new Float32Array(fieldGeom.attributes.position.length)
		for(var i=0; i<colors.length; i+=3) {
			const dark = (i%18 < 9)
			colors[i  ] = dark * 0.2
			colors[i+1] = 0.5
			colors[i+2] = !dark * 0.2
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
		this.fieldMesh = new THREE.Mesh(fieldGeom, material)
	}
}

export default Field