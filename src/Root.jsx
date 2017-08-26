import React, { Component } from 'react'

import Field from 'Field'
import VectorInput from 'VectorInput'
import InputGroup from 'InputGroup'
import Disc from 'Disc'

class Root extends Component {
	constructor(props) {
		super(props)
		this.state = {}
		this.throw = this.throw.bind(this)
	}

	throw() {
		const {pos = [0,0,0], vel = [0,0,0]} = this.state
		const disc = new Disc()
		disc.pos.fromArray(pos)
		disc.vel.fromArray(vel)

		const steps = disc.run()
		this.setState({steps})
	}

	render() {
		const {up, pos, steps} = this.state

		return (
			<div className="container-fluid" style={{
				display: 'flex',
				'flex-direction': 'column',
				'align-items': 'center'
			}}>
				<div className="well">
					<h2>Disc simulator</h2>
					<Field initialUp={up} initialPos={pos} steps={steps}/>
					<div className="row">
						<VectorInput label="Orientation" onChange={up => this.setState({up})}/>
						<div className="btn-group btn-group-vertical vector-group">
							<label>Spin velocity</label>
							<InputGroup label="Ω" onChange={e => this.setState({omega: e.target.value})}/>
							<label>Spin offset (degrees)</label>
							<InputGroup label="°" onChange={e => this.setState({spinOff: e.target.value})}/>
						</div>
					</div>
					<div className="row">
						<VectorInput label="Position" onChange={pos => this.setState({pos})}/>
						<VectorInput label="Velocity" onChange={vel => this.setState({vel})}/>
						<button type="button" class="btn btn-success" onClick={this.throw}>Throw!</button>
					</div>
				</div>
			</div>
		)
	}
}

export default Root