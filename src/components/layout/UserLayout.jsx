import { Outlet } from 'react-router-dom'
import UserNavbar from './UserNavbar'
import Footer from './Footer'

export default function UserLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-surface">
      <UserNavbar />
      <main className="flex-1 pt-20">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
