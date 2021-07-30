import React from 'react'

function TextareaWithLabel({ name, label, value, onChange, placeholder, span = "" }) {
  return (
    <div className={`${span && "col-span-" + span} pb-4`}>
      <label htmlFor={name} className="text-xl block font-bold pb-2">{label}</label>
      <textarea
        rows={5}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="shadow-xl appearance-none border border-white-default rounded-3xl w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline"
      />
    </div>
  )
}

export default TextareaWithLabel
