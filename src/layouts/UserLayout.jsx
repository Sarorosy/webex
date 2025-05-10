import { Outlet, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { Facebook, Instagram, Twitter } from "lucide-react";

export default function UserLayout() {
  const navigate = useNavigate();

  return (
    <div className="h-screen flex flex-col bg-gray-50 w-full">
      <Header />
      <main
        className="flex-grow w-full overflow-y-auto "
        id="scroll-container"
      >
        <div className="bg-white rounded shadow-md p-2 min-h-full" id="sample">
          <Outlet />
        </div>
      </main>
      <div className="border-t border-[#092e4650] bg-white text-[#092e46] px-4 py-3 relative flex items-center">
        {/* Centered copyright */}
        <p className="absolute left-1/2 transform -translate-x-1/2 text-sm text-[#092e46]">
          © {new Date().getFullYear()} Rapid Collaborate. All Rights Reserved.
        </p>

      </div>
    </div>
  );
}
