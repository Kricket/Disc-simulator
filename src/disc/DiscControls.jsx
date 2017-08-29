import React, { Component } from 'react'

import VectorInput from 'VectorInput'
import InputGroup from 'InputGroup'

class DiscControls extends Component {
	render() {
		const {disc, onThrow} = this.props
		return <div>
			<VectorInput label="Orientation" onChange={up => disc.setInitialUp(up)}/>
			<div className="btn-group btn-group-vertical vector-group">
				<label>Spin velocity</label>
				<InputGroup label="Ω" onChange={e => disc.setInitialOmega(e.target.value)}/>
				<label>Spin offset (degrees)</label>
				<InputGroup label="°" onChange={e => disc.setInitialSpinOff(e.target.value)}/>
			</div>
			<VectorInput label="Position" onChange={pos => disc.setInitialPos(pos)}/>
			<VectorInput label="Velocity" onChange={vel => disc.setInitialVel(vel)}/>
			<button type="button" class="btn btn-success" onClick={onThrow}>Throw!</button>
		</div>
	}
}

export default DiscControls