import { Outlet } from 'react-router-dom';
import AdminSidebar from '../../components/layout/AdminSidebar';

export default function AdminLayout() {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminSidebar />
      <div className="flex-1 lg:ml-64 p-4 sm:p-6 pt-20 lg:pt-6">
        <Outlet />
      </div>
    </div>
  );
}