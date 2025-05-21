import { Link, useLocation } from "@remix-run/react";

export function Navbar() {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700/50">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link
            to="/"
            className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500"
          >
            Remix + Supabase
          </Link>
          <div className="flex items-center gap-4">
            <Link
              to="/"
              className={`px-4 py-2 rounded-lg transition-colors duration-200 ${
                isActive("/")
                  ? "bg-purple-500/10 text-purple-400"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              홈
            </Link>
            <Link
              to="/todos"
              className={`px-4 py-2 rounded-lg transition-colors duration-200 ${
                isActive("/todos")
                  ? "bg-purple-500/10 text-purple-400"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              할 일 목록
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
