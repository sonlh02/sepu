"use client";
// load package
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
// load lib
import menubar from "@/lib/menu";
import { Nav } from "@/lib/nav";
// load icon
//import { IconNewTask } from "@/component/Icon";
// import { ToastContainer } from "react-toastify";
// import { localStorageSet, localStorageToken } from "@/lib/local_storage";
// import "react-toastify/dist/ReactToastify.css";
// import "../globals.css";
import "react-datepicker/dist/react-datepicker.css";

import NavBar from "./Sidebar";
import Rightpanel from "./Rightpanel";
import Chatbot from "./(menu)/(chatbot)/Chatbot";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const [isUserHaveTasksManagerWright, setIsUserHaveTasksManagerWright] =
    useState(false);

  useEffect(() => {
    if (menubar("inspectdoc"))
      setIsUserHaveTasksManagerWright(true);
  }, []);

  const handleClick = (e: any) => {
    router.push(Nav.INSPECTDOC_DAY_PAGE);
  };

  return (
    <>
      <div className="flex h-screen bg-gray-100">
        {/* <div className="h-13" /> */}

        <NavBar/>
        <div className="flex-1 overflow-y-auto">{children}</div>
        <Rightpanel/>
        <Chatbot/>
      </div>

      {/*<ToastContainer
        position="top-right"
        autoClose={5000}
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />*/}
    </>
  );
}
