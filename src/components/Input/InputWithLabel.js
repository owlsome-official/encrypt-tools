import React from 'react'

function InputWithLabel({ name, label, value, onChange, placeholder, className = "" }) {
  return (
    <div className={`${className} pb-4 px-4`}>
      <label htmlFor={name} className="text-xl block font-bold pb-2">{label}</label>
      <input
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="shadow-xl appearance-none bg-white-dark border border-white-dark rounded-2xl w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline"
      />
    </div>
  )
}

export default InputWithLabel
