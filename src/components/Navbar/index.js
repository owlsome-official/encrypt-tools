import React from 'react'
import { DECRYPTION_MODE, ENCRYPTION_MODE } from '../../utils/constants'
import Nav from './Nav'
import NavItem from './NavItem'

const menu = [
  { href: "/encrypt", name: "Encrypt", mode: ENCRYPTION_MODE },
  { href: "/decrypt", name: "Decrypt", mode: DECRYPTION_MODE },
]

function Navbar({ mode }) {
  return (
    <Nav>
      <span className="text-xl block font-bold">Mode:</span>
      {menu.map(el => (
        <NavItem key={el.mode} href={el.href} isActive={mode === el.mode}>{el.name}</NavItem>
      ))}
    </Nav>
  )
}

export default Navbar
