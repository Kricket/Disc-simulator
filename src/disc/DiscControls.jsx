import React, { Component } from 'react'

import VectorInput from 'VectorInput'
import InputGroup from 'InputGroup'

import {UP, POS, VEL, LIFT, DRAG, D1, D2, D3} from 'disc/DiscState'
import {PATH} from 'disc/Disc'

class DiscControls extends Component {
	constructor(props) {
		super(props)
		this.onChange = this.onChange.bind(this)
		this.onShow = this.onShow.bind(this)
		this.showAxes = this.showAxes.bind(this)
	}

	onChange(comp, val) {
		this.props.disc.setInitial(comp, new THREE.Vector3(...val))
	}

	onShow(key, val) {
		this.props.disc.setShow(key, val)
	}

	showAxes(e) {
		const checked = !!e.target.checked
		this.onShow(D1, checked)
		this.onShow(D2, checked)
		this.onShow(D3, checked)
	}

	render() {
		const {onThrow} = this.props
		return <div>
			<VectorInput label="Orientation" onChange={up => this.onChange(UP, up)}/>
			<div className="btn-group btn-group-vertical vector-group">
				<label>Spin velocity</label>
				<InputGroup label="Ω" onChange={e => this.onChange(OMEGA, e.target.value)}/>
				<label>Spin offset (degrees)</label>
				<InputGroup label="°" onChange={e => this.onChange('SPINOFF', e.target.value)}/>
			</div>
			<VectorInput label="Position" onChange={pos => this.onChange(POS, pos)}/>
			<VectorInput label="Velocity" onChange={vel => this.onChange(VEL, vel)}/>
			<div className="btn-group btn-group-vertical vector-group">
				<InputGroup label="Path" type="checkbox" onChange={e => this.onShow(PATH, e.target.checked)}/>
				<InputGroup label="Velocity" type="checkbox" onChange={e => this.onShow(VEL, e.target.checked)}/>
				<InputGroup label="Lift" type="checkbox" onChange={e => this.onShow(LIFT, e.target.checked)}/>
				<InputGroup label="Drag" type="checkbox" onChange={e => this.onShow(DRAG, e.target.checked)}/>
				<InputGroup label="Axes" type="checkbox" onChange={this.showAxes}/>
			</div>
			<button type="button" class="btn btn-success" onClick={onThrow}>Throw!</button>
		</div>
	}
}

export default DiscControls