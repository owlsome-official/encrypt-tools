import React from 'react'

function InputGroup({ children, grid = "" }) {
  let gridCols = !!grid ? "grid-cols-" + grid : ""
  return (
    <div className="px-8 py-4">
      <div className={`grid gap-4 ${gridCols}`}>
        {children}
      </div>
    </div>
  )
}

export default InputGroup
