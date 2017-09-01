import React, { Component } from 'react'

import VectorInput from 'VectorInput'
import InputGroup from 'InputGroup'

import {UP, POS, VEL} from 'disc/DiscState'

class DiscControls extends Component {
	render() {
		const {onChange, onThrow} = this.props
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
				<InputGroup label="Show path" type="checkbox" onChange={e => onChange('showTrajectory', e.target.checked)}/>
			</div>
			<button type="button" class="btn btn-success" onClick={onThrow}>Throw!</button>
		</div>
	}
}

export default DiscControls