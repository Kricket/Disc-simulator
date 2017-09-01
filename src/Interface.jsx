import React, { Component } from 'react'
import World from 'world/World'
import Field from 'world/Field'
import Disc from 'disc/Disc'
import DiscControls from 'disc/DiscControls'
import {UP, POS, VEL} from 'disc/DiscState'


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
		this.onChangeDiscInit = this.onChangeDiscInit.bind(this)
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

	// Calculate the throw, and setup the "video player" with the result
	onThrow() {
		this.stop()
		const self = this

		this.disc.throw(calcTime => {
			self.setState({calcTime})
		}, steps => {
			const lastStep = steps[steps.length-1]
			const slider = $('#timeSlider')
			slider.slider('off', 'slide', self.ticker.onSlide)

			self.setState({maxTime: lastStep.time, calcTime: 0})
			slider.slider('setAttribute', 'max', lastStep.time)
				.slider('on', 'slide', self.ticker.onSlide)
		})
	}

	onChangeDiscInit(comp, val) {
		switch(comp) {
			case 'showTrajectory':
				this.disc.setShowTrajectory(val)
				break
			default:
				this.disc.setInitial(comp, new THREE.Vector3(...val))
		}
	}

	render() {
		const {playing, maxTime, calcTime} = this.state

		return (
			<div className="container-fluid">
				{!!calcTime && <div className="loading-overlay">
					<h3 className="loading-text">
						Calculating... {Math.floor(calcTime / 100) / 10}
					</h3>
				</div>}
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
						<span className="padded">
							<input id="timeSlider"
								type="text"
								data-provide="slider"
								data-slider-min="0"
								data-slider-step="0.01"
								data-slider-value="0"/>
						</span>
					</div>
					<DiscControls onChange={this.onChangeDiscInit} onThrow={this.onThrow}/>
				</div>
			</div>
		)
	}

	componentDidMount() {
		this.world = new World(document.getElementById('world'))
		const {scene} = this.world
		this.disc = new Disc(scene)
		this.field = new Field(scene)
		this.ticker = new Ticker(this.world, this.disc, $('#timeSlider'), this.onDone)
	}
}

export default Interface