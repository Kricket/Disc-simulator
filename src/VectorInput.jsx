import React, { Component } from 'react'
import InputGroup from 'InputGroup'


class VectorInput extends Component {
	constructor(props) {
		super(props)
		this.state = {x:0, y:0, z:0}
		this.notifyUpdate = this.notifyUpdate.bind(this)
		this.reset = this.reset.bind(this)
	}

	notifyUpdate() {
		if(this.props.onChange) {
			const {x, y, z} = this.state
			this.props.onChange([x,y,z])
		}
	}

	onChange(key, value) {
		const self = this
		this.setState({[key]: parseFloat(value)}, this.notifyUpdate)
	}

	reset() {
		this.setState({x:0,y:0,z:0}, this.notifyUpdate)
	}

	render() {
		const {label} = this.props
		const {x,y,z} = this.state

		return <div className="btn-group btn-group-vertical vector-group">
			<label>{label}</label>
			<a href="javascript:void(0)" style={{"float": "right"}} onClick={this.reset}>Reset</a>
			<InputGroup label="X" value={x} onChange={(e) => this.onChange('x', e.target.value)}/>
			<InputGroup label="Y" value={y} onChange={(e) => this.onChange('y', e.target.value)}/>
			<InputGroup label="Z" value={z} onChange={(e) => this.onChange('z', e.target.value)}/>
		</div>
	}
}

export default VectorInput