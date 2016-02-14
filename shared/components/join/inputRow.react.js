import React from 'react';

const InputRow = ({id, placeholder, label, value, onChange}) => {

  return (
    <div className="form-row">
      <label htmlFor={id}>{label}</label>
      <input id={id} value={value}
        className="form-item"
        name={id}
        placeholder={placeholder}
        onChange={onChange} />
    </div>
  )
}

export default InputRow;
