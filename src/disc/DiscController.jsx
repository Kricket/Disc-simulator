import React, { Component } from 'react'
import PropTypes from 'prop-types'
import TimeSlider from 'TimeSlider'
import VectorInput from 'VectorInput'
import InputGroup from 'InputGroup'
import DiscState, {UP, OMEGA, TORQUE, POS, VEL, LIFT, DRAG, D1, D2, D3, FORCE} from 'disc/DiscState'
import {PATH} from 'disc/Disc'
import DiscCalculator from 'disc/DiscCalculator'


/**
 * Coordinates between the UI controls and the actual Disc object that is displayed.
 */
class DiscController extends Component {
	constructor(props) {
		super(props)
		this.state = {
			discState: new DiscState()
		}

		this.onThrow = this.onThrow.bind(this)
		this.onOmegaChange = this.onOmegaChange.bind(this)
		this.calcProgress = this.calcProgress.bind(this)
		this.calcFinished = this.calcFinished.bind(this)
		this.showAxes = this.showAxes.bind(this)
		this.onStep = this.onStep.bind(this)
	}

	componentWillReceiveProps(nextProps) {
		if(nextProps.disc) {
			nextProps.disc.setState(this.state.discState)
		}
	}

	setDiscState(discState) {
		this.setState({
			discState,
			steps: null
		})
		this.props.disc.setSteps(null)
		this.props.disc.setState(discState)
	}

	onChange(comp, val) {
		const vec = new THREE.Vector3(...val)
		const discState = new DiscState(this.state.discState)
		
		if(comp === UP) {
			vec.normalize()
			discState[OMEGA] = vec.clone().multiplyScalar(discState[OMEGA].length())
		}

		discState[comp] = vec
		this.setDiscState(discState)
	}

	onOmegaChange(e) {
		const discState = new DiscState(this.state.discState)
		discState[OMEGA] = discState[UP].clone().multiplyScalar(e.target.value)
		this.setDiscState(discState)
	}

	showAxes(e) {
		const checked = !!e.target.checked
		const {disc} = this.props
		disc.setShow(D1, checked)
		disc.setShow(D2, checked)
		disc.setShow(D3, checked)
	}

	onThrow() {
		this.setState({steps: null})
		this.props.disc.setSteps(null)

		const calc = new DiscCalculator(this.state.discState)
		calc.calculate(this.calcProgress, this.calcFinished)
	}

	calcProgress(calcTime) {
		this.setState({calcTime})
	}

	calcFinished(steps) {
		this.setState({
			calcTime: null,
			steps
		})

		this.props.disc.setSteps(steps)
	}

	onStep(time) {
		const {steps} = this.state

		if(this.stepIdx && time >= steps[this.stepIdx].time) {
			// We were stepping before. Resume.
			var step = steps[this.stepIdx]
			while(this.stepIdx < steps.length && time > step.time) {
				step = steps[this.stepIdx++]
			}

			this.props.disc.setState(step)
		} else {
			// Jump to the given time
			const step = steps.find(s => (time <= s.time))
			this.props.disc.setState(step ? step : time ? steps[steps.length-1] : steps[0])
		}
	}

	render() {
		const {disc} = this.props
		if(!disc) {
			return <div/>
		}

		const {calcTime, discState, steps} = this.state

		return <div className="row">
				{!!calcTime && <div className="loading-overlay">
					<h3 className="loading-text">
						Calculating... {Math.floor(calcTime * 10) / 10}
					</h3>
				</div>}

				{!!steps && <TimeSlider onStep={this.onStep} max={steps[steps.length - 1].time}/>}

				<div className="col-xs-12 col-lg-6">
					<VectorInput label="Orientation" value={discState[UP]} onChange={up => this.onChange(UP, up)}/>
				</div>
				<div className="col-xs-12 col-lg-6">
					<div className="btn-group btn-group-vertical vector-group">
						<label>Spin velocity</label>
						<InputGroup label="Ω" value={discState[OMEGA].length()} onChange={this.onOmegaChange}/>
						<label>Spin offset (degrees)</label>
						<InputGroup label="°" onChange={e => this.onChange('SPINOFF', e.target.value)}/>
					</div>
				</div>

				<div className="clearfix"/>

				<div className="col-xs-12 col-lg-6">
					<VectorInput label="Position" value={discState[POS]} onChange={pos => this.onChange(POS, pos)}/>
				</div>
				<div className="col-xs-12 col-lg-6">
					<VectorInput label="Velocity" value={discState[VEL]} onChange={vel => this.onChange(VEL, vel)}/>
				</div>

				<div className="clearfix"/>

				<div className="col-xs-12">
					<div className="btn-group btn-group-vertical vector-group">
						<InputGroup label="Path" type="checkbox" onChange={e => disc.setShow(PATH, e.target.checked)}/>
						<InputGroup label="Velocity" type="checkbox" onChange={e => disc.setShow(VEL, e.target.checked)}/>
						<InputGroup label="Lift" type="checkbox" onChange={e => disc.setShow(LIFT, e.target.checked)}/>
						<InputGroup label="Drag" type="checkbox" onChange={e => disc.setShow(DRAG, e.target.checked)}/>
					</div>
					<div className="btn-group btn-group-vertical vector-group">
						<InputGroup label="Total force" type="checkbox" onChange={e => disc.setShow(FORCE, e.target.checked)}/>
						<InputGroup label="Rotation" type="checkbox" onChange={e => disc.setShow(OMEGA, e.target.checked)}/>
						<InputGroup label="Torque * 200" type="checkbox" onChange={e => disc.setShow(TORQUE, e.target.checked)}/>
						<InputGroup label="Axes" type="checkbox" onChange={this.showAxes}/>
					</div>
				</div>

				<div className="col-xs-12">
					<button type="button" class="btn btn-success" onClick={this.onThrow}>Throw!</button>
				</div>
			</div>
	}
}

DiscController.propTypes = {
	disc: PropTypes.object
}

export default DiscController