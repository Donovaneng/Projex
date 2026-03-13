import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { Outlet } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

export default function MainLayout() {

  const { user } = useAuth();

  return (
    <div className="flex bg-gray-100">

      <Sidebar role={user?.role} />

      <div className="flex flex-col flex-1">

        <Topbar user={user} />

        <main className="p-6 min-h-screen">
          <Outlet />
        </main>

      </div>

    </div>
  );
}