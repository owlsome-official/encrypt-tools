import React from 'react'

function InputGroup({ children }) {
  return (
    <div className="px-8 py-4">
      <div className="flex flex-wrap -mx-4">
        {children}
      </div>
    </div>
  )
}

export default InputGroup
