import { Outlet } from 'react-router-dom'
import AdminSidebar from './AdminSidebar'

export default function AdminLayout() {
  return (
    <div className="min-h-screen bg-surface">
      <AdminSidebar />
      <main className="ml-64 min-h-screen flex flex-col">
        <div className="flex-1">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
