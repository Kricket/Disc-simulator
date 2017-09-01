import React, { Component } from 'react'

const InputGroup = ({label, value = 0, onChange, type="number"}) => <div className="input-group">
	{type == "checkbox" ? <div className="checkbox">
		<label>
			<input type={type} value={value} onChange={onChange}/>
			{label}
		</label>
	</div> : [
		<span className="input-group-addon">{label}</span>,
		<input className="form-control"
			type={type}
			value={value}
			onChange={onChange}/>
	]}
</div>


export default InputGroup