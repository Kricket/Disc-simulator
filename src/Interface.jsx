import React, { Component } from 'react'
import World from 'world/World'
import Field from 'world/Field'
import Disc from 'disc/Disc'
import DiscController from 'disc/DiscController'


const Vector = ({vec, label}) => vec ? <div>
	<strong>{label}</strong>
	<i>X: </i>{vec.x.toPrecision(3)}
	<i>Y: </i>{vec.y.toPrecision(3)}
	<i>Z: </i>{vec.z.toPrecision(3)}
</div> : <div/>


class Interface extends Component {
	constructor(props) {
		super(props)
		this.state = {}
	}

	render() {
		const {disc} = this.state

		return (
			<div className="container-fluid">
				<div className="row">
					<div className="col-xs-9" id="world" style={{height: "900px"}}/>
					<div className="col-xs-3">
						<DiscController disc={disc}/>
					</div>
				</div>
			</div>
		)
	}

	componentDidMount() {
		this.world = new World(document.getElementById('world'))
		const {scene} = this.world
		this.disc = new Disc(scene)
		this.field = new Field(scene)

		this.setState({disc: this.disc})
	}
}

export default Interface