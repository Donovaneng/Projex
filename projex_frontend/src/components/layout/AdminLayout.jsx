import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { Outlet } from "react-router-dom";

export default function AdminLayout() {

  return (
    <div className="flex bg-gray-100">

      <Sidebar />

      <div className="flex flex-col flex-1">

        <Topbar />

        <main className="p-6">
          <Outlet />
        </main>

      </div>

    </div>
  );
}