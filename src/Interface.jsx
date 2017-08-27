import React, { Component } from 'react'
import World from 'world/World'
import Field from 'world/Field'
import Disc from 'disc/Disc'
import DiscControls from 'disc/DiscControls'

class Interface extends Component {
	constructor(props) {
		super(props)
		this.state = {}
	}

	render() {
		return (
			<div className="container-fluid">
				<div className="well">
					<h2>Disc Simulator</h2>
					<div className="row">
						<div className="col-xs-12" id="world" style={{height: "800px"}}/>
					</div>
					<DiscControls disc={this.state.disc}/>
				</div>
			</div>
		)
	}

	componentDidMount() {
		this.world = new World(document.getElementById('world'))

		const {scene} = this.world
		this.setState({
			disc: new Disc(scene),
			field: new Field(scene)
		})
	}
}

export default Interface