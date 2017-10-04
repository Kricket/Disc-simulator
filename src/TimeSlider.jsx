import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Slider from 'bootstrap-slider/dist/bootstrap-slider'


class TimeSlider extends Component {
	constructor(props) {
		super(props)

		this.state = {}
		this.lastTime = 0
		this.elapsedTime = 0

		this.onPause = this.onPause.bind(this)
		this.onPlay = this.onPlay.bind(this)
		this.onTick = this.onTick.bind(this)
		this.onSlide = this.onSlide.bind(this)
	}

	componentWillReceiveProps(nextProps) {
		this.slider.setAttribute('max', nextProps.max)
	}

	onPause() {
		this.setState({playing: false})
	}

	onPlay() {
		this.setState({playing: true})
		requestAnimationFrame(t => {
			this.lastTime = t
			this.onTick(t)
		})
	}

	onTick(time) {
		if(this.lastTime) {
			const dt = (time - this.lastTime) * 0.001
			this.elapsedTime += dt
		} else {
			this.elapsedTime = 0
		}

		this.slider.setValue(this.elapsedTime)
		this.lastTime = time

		this.props.onStep(this.elapsedTime)

		if(this.state.playing) {
			if(this.elapsedTime >= this.props.max) {
				this.setState({playing: false})
				this.elapsedTime = 0
			} else {
				requestAnimationFrame(this.onTick)
			}
		}
	}

	onSlide(time) {
		this.onPause()
		this.elapsedTime = time
		this.props.onStep(time)
	}

	componentDidMount() {
		this.slider = new Slider('#timeSlider')
		this.slider.on('slide', this.onSlide)
		this.slider.setAttribute('max', this.props.max)
	}

	render() {
		const {playing} = this.state

		return (
			<div className="row">
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
		)
	}
}

TimeSlider.propTypes = {
	onStep: PropTypes.func
}

export default TimeSlider