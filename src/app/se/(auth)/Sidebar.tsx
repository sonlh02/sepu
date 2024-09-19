"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Home,
  Activity,
  BarChart2,
  Map,
  Users,
  LogOut,
  TowerControl,
  ChevronDown,
  ChevronRight,
  Inspect,
  Pin,
  Ratio,
  AlertCircle,
} from "lucide-react";
import { deleteCookie, getCookie } from "cookies-next";
import { useRouter } from "next/navigation";
import { Nav } from "@/lib/nav";
import { useEffect, useState } from "react";
import { fetchWithToken } from "@/lib/fetch_data";
import { SE } from "@/lib/api";
import { ProfileData, ProfileRawData } from "./profile/profile_data";
import { Gender } from "@/enum/gender";
import { toast } from "react-toastify";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

const sidebarItems = [
  { icon: Home, label: "Trang chủ", link: Nav.DASHBOARD_PAGE },
  { icon: Activity, label: "Giám sát", link: Nav.SUPERVISE_PAGE },
  {
    icon: BarChart2,
    label: "Thống kê",
    subItems: [
      { label: "Thống kê chung", link: Nav.STATISTIC_PAGE },
      { label: "Thống kê phiếu công việc", link: Nav.STATISTIC_REPORT_DOC_PAGE },
      { label: "Thống kê tiến độ", link: Nav.STATISTIC_REPORT_WORKPROGRESS_PAGE },
    ],
  },
  { icon: Map, label: "Tuyến", link: Nav.ROUTE_PAGE },
  { icon: Inspect, label: "Kiểm tra", link: Nav.INSPECTDOC_PAGE },
  { icon: Pin, label: "Sửa chữa", link: Nav.REPAIRDOC_PAGE },
  {
    icon: Ratio,
    label: "Thiết bị",
    subItems: [
      { label: "Quản lý máy trạm", link: Nav.WORKSTATION_PAGE },
      { label: "Quản lý thiết bị bay", link: Nav.UAV_PAGE },
    ],
  },
  { icon: AlertCircle, label: "Cảnh báo", link: Nav.INCIDENTFLY_PAGE },
  {
    icon: Users,
    label: "Người dùng",
    subItems: [
      { label: "Quản lý người dùng", link: Nav.USER_PAGE },
      { label: "Quản lý vai trò", link: Nav.ROLE_PAGE },
    ],
  },
];

export default function Sidebar({ className }: { className?: string }) {
  const router = useRouter();
  const [username, setUsername] = useState<string>("");
  const [avatar, setAvatar] = useState<string>("");
  const [data, setData] = useState<ProfileData | null>();
  const [isExpanded, setIsExpanded] = useState(false);
  const [expandedItem, setExpandedItem] = useState<string | null>(null);

  useEffect(() => {
    setUsername(getCookie("name") || "");
    setAvatar(getCookie("avatar") || "");
  }, []);

  function fetchData() {
    fetchWithToken(SE.API_PROFILE)
      .then((response) => response as ProfileRawData)
      .then((data) => {
        if (!data.data) return;

        setData({
          id: data.data.user.id,
          username: data.data.user.username,
          displayName: data.data.user.name,
          phone: data.data.user.phone,
          email: data.data.user.email,
          gender: {
            1: Gender.Male,
            2: Gender.Female,
          }[data.data.user.gender],
          role: data.data.user.role.name,
          activity: data.data.user.activity,
          department: data.data.user.department,
          position: data.data.user.position,
          workLevel: data.data.user.lvWork,
          safeLevel: data.data.user.lvSafe,
          avatar: data.data.user.avatar,
          signature: data.data.user.signature,
        });
      })
      .catch((e: Error) => {
        if (e.message) toast.error(e.message);
      });
  }

  useEffect(fetchData, []);

  const handleItemClick = (label: string) => {
    if (expandedItem === label) {
      setExpandedItem(null);
    } else {
      setExpandedItem(label);
    }
  };

  const handleMouseEnter = () => {
    setIsExpanded(true);
  };

  const handleMouseLeave = () => {
    setIsExpanded(false);
    setExpandedItem(null); // Reset expanded item when sidebar is collapsed
  };

  const renderMenuItem = (item: any, index: number) => {
    const isItemExpanded = expandedItem === item.label;

    return (
      <div key={index}>
        {item.subItems ? (
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start mb-1",
              isExpanded ? "px-4" : "px-0",
              isItemExpanded && "bg-accent"
            )}
            onClick={() => handleItemClick(item.label)}
          >
            <item.icon className={cn("h-5 w-5", isExpanded ? "mr-2" : "mx-auto")} />
            {isExpanded && (
              <>
                <span>{item.label}</span>
                <ChevronDown className={cn("ml-auto h-4 w-4", isItemExpanded && "transform rotate-180")} />
              </>
            )}
          </Button>
        ) : (
          <Link href={item.link}>
            <Button
              variant="ghost"
              className={cn("w-full justify-start mb-1", isExpanded ? "px-4" : "px-0")}
            >
              <item.icon className={cn("h-5 w-5", isExpanded ? "mr-2" : "mx-auto")} />
              {isExpanded && <span>{item.label}</span>}
            </Button>
          </Link>
        )}
        {isItemExpanded && item.subItems && (
          <div className="ml-6 mt-2 space-y-2">
            {item.subItems.map((subItem: any, subIndex: number) => (
              <Link key={subIndex} href={subItem.link}>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-sm py-1"
                >
                  <ChevronRight className="h-4 w-4 mr-2" />
                  {subItem.label}
                </Button>
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <aside
      className={cn(
        "bg-white transition-all duration-300 ease-in-out flex flex-col",
        isExpanded ? "w-64" : "w-16",
        className
      )}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="p-1 flex">
        {isExpanded ? (
          <div className="flex items-center">
            <TowerControl className="w-8 h-8" />
            <Link
              href={Nav.DASHBOARD_PAGE}
              className="ml-2 text-2xl font-bold"
            >
              SEPU
            </Link>
          </div>
        ) : (
          <Link
            href={Nav.DASHBOARD_PAGE}
            className="w-full flex justify-center"
          >
            <TowerControl className="w-8 h-8" />
          </Link>
        )}
      </div>
      <nav className="flex-1 mt-6">
        <TooltipProvider>
          {sidebarItems.map((item, index) => (
            <Tooltip key={index}>
              <TooltipTrigger asChild>
                {renderMenuItem(item, index)}
              </TooltipTrigger>
              {!isExpanded && (
                <TooltipContent side="right">{item.label}</TooltipContent>
              )}
            </Tooltip>
          ))}
        </TooltipProvider>
      </nav>
      {isExpanded ? (
        <div className="mt-auto p-4 flex items-center">
          <Avatar className="h-9 w-9">
            <AvatarImage
              src={`${process.env.NEXT_PUBLIC_API_URL}/${avatar}`}
              alt="User avatar"
            />
            <AvatarFallback>AVT</AvatarFallback>
          </Avatar>
          <div className="ml-3 flex-1">
            <p className="text-sm font-medium">{username}</p>
            <p className="text-xs text-gray-500">{data?.email}</p>
          </div>
          <button
            className="text-gray-500 hover:text-gray-700"
            type="button"
            onClick={() => {
              deleteCookie("token-type");
              deleteCookie("refresh-token");
              deleteCookie("access-token");
              deleteCookie("username");
              deleteCookie("menu");
              router.push(Nav.LOGIN_PAGE);
            }}
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      ) : (
        <button
          className="mt-auto text-gray-500 hover:text-gray-700 text-center p-4 w-full"
          type="button"
          onClick={() => {
            deleteCookie("token-type");
            deleteCookie("refresh-token");
            deleteCookie("access-token");
            deleteCookie("username");
            deleteCookie("menu");
            router.push(Nav.LOGIN_PAGE);
          }}
        >
          <LogOut className="h-5 w-5 mx-auto" />
        </button>
      )}
    </aside>
  );
}