import { Link } from "react-router-dom";

export default function NavItem({ href, isActive, children }) {
  return (
    <li>
      <Link
        to={href}
        className={`shadow-sm block px-4 py-2 rounded-2xl ${isActive ? 'bg-pink-default text-white-default' : 'border border-solid border-pink-default text-pink-default hover:bg-pink-light hover:border-pink-light hover:text-white-default'}`}
      >
        {children}
      </Link>
    </li>
  )
}