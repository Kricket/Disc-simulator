import React, { Component } from 'react'

import VectorInput from 'VectorInput'
import InputGroup from 'InputGroup'

import {UP, POS, VEL} from 'disc/DiscState'
import {SHOW_PATH, SHOW_LIFT, SHOW_DRAG} from 'disc/Disc'

class DiscControls extends Component {
	render() {
		const {onChange, onShow, onThrow} = this.props
		return <div>
			<VectorInput label="Orientation" onChange={up => onChange(UP, up)}/>
			<div className="btn-group btn-group-vertical vector-group">
				<label>Spin velocity</label>
				<InputGroup label="Ω" onChange={e => onChange(OMEGA, e.target.value)}/>
				<label>Spin offset (degrees)</label>
				<InputGroup label="°" onChange={e => onChange('SPINOFF', e.target.value)}/>
			</div>
			<VectorInput label="Position" onChange={pos => onChange(POS, pos)}/>
			<VectorInput label="Velocity" onChange={vel => onChange(VEL, vel)}/>
			<div className="btn-group btn-group-vertical vector-group">
				<InputGroup label="Path" type="checkbox" onChange={e => onShow(SHOW_PATH, e.target.checked)}/>
				<InputGroup label="Lift" type="checkbox" onChange={e => onShow(SHOW_LIFT, e.target.checked)}/>
				<InputGroup label="Drag" type="checkbox" onChange={e => onShow(SHOW_DRAG, e.target.checked)}/>
			</div>
			<button type="button" class="btn btn-success" onClick={onThrow}>Throw!</button>
		</div>
	}
}

export default DiscControls