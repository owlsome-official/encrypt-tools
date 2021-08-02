import React from 'react'
import { version } from "../../../package.json"

function Title({ name }) {
  return (
    <span className="text-3xl text-center block font-bold pb-3 px-4">{name} v{version}</span>
  )
}

export default Title
