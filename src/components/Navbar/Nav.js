export default function Nav({ children }) {
  return (
    <nav className="px-8 py-6">
      <ul className="flex space-x-2 items-center">
        {children}
      </ul>
    </nav>
  )
}
