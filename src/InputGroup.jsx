import React, { Component } from 'react'

const InputGroup = ({label, value = 0, onChange}) => <div className="input-group">
	<span className="input-group-addon">{label}</span>
	<input className="form-control"
		type="number"
		value={value}
		onChange={onChange}/>
</div>


export default InputGroup