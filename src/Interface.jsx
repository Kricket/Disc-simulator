import React, { Component } from 'react'
import World from 'world/World'
import Field from 'world/Field'
import Disc from 'disc/Disc'
import DiscControls from 'disc/DiscControls'


// Helper used to create video-like controls for the movement of the disc
class Ticker {
	constructor(world, slider, onTick) {
		this.world = world
		this.slider = slider
		this.onTick = onTick
		this.elapsedTime = 0
		this.__tick = this.__tick.bind(this)
	}

	// Private tick callback
	__tick(time) {
		const dt = (time - this.lastTime) * 0.001
		this.elapsedTime += dt
		this.slider.slider('setValue', this.elapsedTime)
		this.lastTime = time

		this.onTick(this.elapsedTime)
	}

	play() {
		this.lastTime = this.world.getLastTime()
		this.world.addTicker(this.__tick)
	}

	stop() {
		this.world.clearTicker()
		this.elapsedTime = 0
		this.slider.slider('setValue', 0)
	}

	togglePause() {
		if(this.paused) {
			this.play()
		} else {
			this.world.clearTicker()
		}

		this.paused = !this.paused
	}
}


class Interface extends Component {
	constructor(props) {
		super(props)
		this.state = {}
		this.onPlay = this.onPlay.bind(this)
		this.onStop = this.onStop.bind(this)
		this.onPause = this.onPause.bind(this)
		this.onThrow = this.onThrow.bind(this)
		this.onTick = this.onTick.bind(this)
	}

	onPlay() {
		this.setState({playing: true})
		this.ticker.play()
	}

	onStop() {
		this.ticker.stop()
		this.nextStepIdx = 0
		this.setState({playing: false})
	}

	onPause() {
		if(this.state.playing) {
			this.ticker.togglePause()
		}
	}

	onThrow() {
		this.onStop()

		const {disc} = this.state
		const steps = disc.throw()

		const lastStep = steps[steps.length-1]
		this.setState({maxTime: lastStep.time})
		$('#timeSlider').slider('setAttribute', 'max', lastStep.time)
	}

	onTick(elapsed) {
		var idx = this.nextStepIdx | 0
		const steps = this.state.disc.getSteps()

		// Try to find the next step to display
		var step
		do {
			step = steps[idx++]
		} while(idx < steps.length && elapsed > steps[idx].time)

		this.state.disc.setPos(step.pos)

		if(idx >= steps.length) {
			this.onStop()
		} else {
			this.nextStepIdx = idx
		}
	}

	render() {
		const {playing, maxTime} = this.state

		return (
			<div className="container-fluid">
				<div className="well">
					<div className="row">
						<div className="col-xs-12" id="world" style={{height: "700px"}}/>
					</div>
					<div className={"row" + (maxTime ? "" : " nodisplay")}>
						{playing ?
							<button type="button" onClick={this.onStop} className="btn">
								<span className="glyphicon glyphicon-stop" title="Stop animation"/>
							</button> :
							<button type="button" onClick={this.onPlay} className="btn">
								<span className="glyphicon glyphicon-play" title="Animate last throw"/>
							</button>
						}
						<button type="button" onClick={this.onPause} className="btn">
							<span className="glyphicon glyphicon-pause" title="Pause animation"/>
						</button>
						<span className="padded">
							<input id="timeSlider"
								type="text"
								data-provide="slider"
								data-slider-min="0"
								data-slider-step="0.01"
								data-slider-value="0"/>
						</span>
					</div>
					<DiscControls disc={this.state.disc} onThrow={this.onThrow}/>
				</div>
			</div>
		)
	}

	componentDidMount() {
		this.world = new World(document.getElementById('world'))
		this.ticker = new Ticker(this.world, $('#timeSlider'), this.onTick)

		const {scene} = this.world
		this.setState({
			disc: new Disc(scene),
			field: new Field(scene)
		})
	}
}

export default Interface