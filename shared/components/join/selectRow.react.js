import React from 'react';

const SelectRow = ({id, label, value, options, onChange}) => {

  return (
    <div className="form-row">
      <label htmlFor={id}>{label}</label>
      <select id={id} className="form-item" name={id}
        value={value}
        onChange={onChange}>
        {options.map((x) => <option value={x.value}>{x.label}</option>)}
      </select>
    </div>
  )
}

export default SelectRow;
