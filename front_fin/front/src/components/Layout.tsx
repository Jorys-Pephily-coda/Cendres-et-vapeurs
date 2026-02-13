import { Outlet } from 'react-router-dom'
import Header from './header'

export default function Layout() {
  return (
    <div style={{ minHeight: '100vh' }}>
      <Header />
      <main className="gear-bg" style={{ minHeight: 'calc(100vh - 70px)' }}>
        <Outlet />
      </main>
    </div>
  )
}
