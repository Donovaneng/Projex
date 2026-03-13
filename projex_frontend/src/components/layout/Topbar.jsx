import { Bell, Search } from "lucide-react";

export default function Topbar({ user }) {

  return (
    <header className="bg-white border-b h-16 flex items-center justify-between px-6">

      {/* search */}

      <div className="flex items-center bg-gray-100 px-3 py-2 rounded-lg w-80">
        <Search size={18} />
        <input
          type="text"
          placeholder="Rechercher..."
          className="bg-transparent outline-none ml-2 w-full"
        />
      </div>

      <div className="flex items-center gap-6">

        <button className="relative">
          <Bell size={22} />
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-1 rounded-full">
            2
          </span>
        </button>

        <div className="flex items-center gap-3">
          <img
            src="https://i.pravatar.cc/40"
            className="w-9 h-9 rounded-full"
          />
          <div>
            <p className="text-sm font-semibold">{user?.name}</p>
            <p className="text-xs text-gray-500">{user?.role}</p>
          </div>
        </div>

      </div>

    </header>
  );
}