import { Outlet } from "react-router-dom";
import Header from "../components/header/Header";

const UserLayout = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-white relative">
      {/* Arka Plan Efekti */}
      <div className="absolute inset-0 overflow-hidden z-0">
        <div className="absolute inset-0">
          <div
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(ellipse_at_top,rgba(96,165,250,0.3)_0%,rgba(59,130,246,0.2)_45%,rgba(99,102,241,0.1))] 
"
          />
        </div>
      </div>
      {/* İçerik ve Header */}
      <div className="relative z-50 pt-20">
        <Header />
        <div>
          {/* İçerik (Outlet) */}
          <main className="flex-grow p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

export default UserLayout;
