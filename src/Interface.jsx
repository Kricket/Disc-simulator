import React, { Component } from 'react'
import World from 'world/World'
import Field from 'world/Field'
import Disc from 'disc/Disc'
import DiscControls from 'disc/DiscControls'


// Helper used to create video-like controls for the movement of the disc
class Ticker {
	constructor(world, disc, slider, onDone) {
		this.world = world
		this.disc = disc
		this.slider = slider
		this.onDone = onDone

		this.__tick = this.__tick.bind(this)
		this.onSlide = this.onSlide.bind(this)

		this.elapsedTime = 0
		this.stepIdx = 0
	}

	// Private tick callback
	__tick(time) {
		// First, set the time and move the slider...
		const dt = (time - this.lastTime) * 0.001
		this.elapsedTime += dt
		this.slider.slider('setValue', this.elapsedTime)
		this.lastTime = time

		// ...then, set the step and move the disc.
		const steps = this.disc.getSteps()
		var step = steps[this.stepIdx]
		while(this.stepIdx < steps.length && this.elapsedTime > steps[this.stepIdx].time) {
			step = steps[this.stepIdx++]
		}

		if(step) {
			this.disc.gotoState(step)
		}

		if(this.stepIdx === steps.length) {
			this.stop()
		}
	}

	play() {
		if(!this.paused) {
			this.elapsedTime = 0
			this.stepIdx = 0
		} else {
			this.paused = false
		}

		this.lastTime = this.world.getLastTime()
		this.world.addTicker(this.__tick)
	}

	stop() {
		this.world.clearTicker()
		this.onDone()
	}

	togglePause() {
		if(this.paused) {
			this.play()
		} else {
			this.world.clearTicker()
			this.paused = true
		}
	}

	// Callback when the user drags the slider
	onSlide(time) {
		const steps = this.disc.getSteps()
		// Find which step to display
		const idx = steps.findIndex(step => step.time >= time)


		this.stepIdx = (idx < 0 ? 0 : idx >= steps.length ? steps.length - 1 : idx)
		const step = steps[this.stepIdx]

		this.elapsedTime = step.time
		this.disc.gotoState(step)

		this.paused = true
	}
}


class Interface extends Component {
	constructor(props) {
		super(props)
		this.state = {}
		this.onPlay = this.onPlay.bind(this)
		this.onDone = this.onDone.bind(this)
		this.onPause = this.onPause.bind(this)
		this.onThrow = this.onThrow.bind(this)
		this.onRestart = this.onRestart.bind(this)
	}

	// Callback for the "play" button
	onPlay() {
		this.setState({playing: true})
		this.ticker.play()
	}

	// Callback for when the ticker has reached the end of the animation
	onDone() {
		this.setState({playing: false})
	}

	// Callback for the "pause" button. Stop playing, but don't lose your place
	onPause() {
		if(this.state.playing) {
			this.ticker.togglePause()
		}
	}

	// Stop the animation immediately
	stop() {
		this.ticker.stop()
		this.setState({playing: false})
	}

	// Go back to the start of the animation
	onRestart() {
		this.stop()
		$('#timeSlider').slider('setValue', 0)
		this.state.disc.gotoInitialState()
	}

	// Calculate the throw, and setup the "video player" with the result
	onThrow() {
		this.stop()

		const {disc} = this.state
		const steps = disc.throw()

		const lastStep = steps[steps.length-1]
		this.setState({maxTime: lastStep.time})
		$('#timeSlider')
			.slider('setAttribute', 'max', lastStep.time)
			.slider('off', 'slide', this.ticker.onSlide)
			.slider('on', 'slide', this.ticker.onSlide)
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
							<button type="button" onClick={this.onPause} className="btn">
								<span className="glyphicon glyphicon-pause" title="Pause animation"/>
							</button> :
							<button type="button" onClick={this.onPlay} className="btn">
								<span className="glyphicon glyphicon-play" title="Animate last throw"/>
							</button>
						}
						<button type="button" onClick={this.onRestart} className="btn">
							<span className="glyphicon glyphicon-repeat" title="Restart animation"/>
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
		const {scene} = this.world
		const disc = new Disc(scene)
		this.ticker = new Ticker(this.world, disc, $('#timeSlider'), this.onDone)

		this.setState({
			disc,
			field: new Field(scene)
		})
	}
}

export default Interface