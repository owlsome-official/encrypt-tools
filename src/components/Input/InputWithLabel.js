import React from 'react'

function InputWithLabel({ name, label, value, onChange, placeholder, span = "" }) {
  let colSpan = `col-span-${!!span ? span : "1"}`
  return (
    <div className={`${colSpan} pb-4`}>
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
