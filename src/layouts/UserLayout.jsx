import { Outlet, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { Facebook, Instagram, Twitter } from "lucide-react";

export default function UserLayout() {
  const navigate = useNavigate();

  return (
    <div className=" flex  bg-gray-50 w-full overflow-hidden f-13">
      <Header />
      
      {/* Main content should scroll, others stay fixed */}
      <main className="flex-grow">
        <div className="bg-white rounded shadow-md">
          <Outlet />
        </div>
      </main>

      {/* <footer className="border-t border-[#092e4650] bg-white text-[#092e46] px-4 py-3 relative flex items-center shrink-0">
        <p className="absolute left-1/2 transform -translate-x-1/2 text-sm text-[#092e46]">
          © {new Date().getFullYear()} Rapid Collaborate. All Rights Reserved.
        </p>
      </footer> */}
    </div>
  );
}
