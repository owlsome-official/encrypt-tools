import React from 'react'

function InputGroup({ children, grid = "" }) {
  return (
    <div className="px-8 py-4">
      <div className={`grid gap-4 ${grid && "grid-cols-" + grid}`}>
        {children}
      </div>
    </div>
  )
}

export default InputGroup
