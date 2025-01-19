"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
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
  User,
  Briefcase,
  Menu,
} from "lucide-react"
import { deleteCookie, getCookie } from "cookies-next"
import { useRouter } from "next/navigation"
import { Nav } from "@/lib/nav"
import { useEffect, useState } from "react"
import { fetchWithToken } from "@/lib/fetch_data"
import { SE } from "@/lib/api"
import { ProfileData, ProfileRawData } from "./profile/profile_data"
import { Gender } from "@/enum/gender"
import { toast } from "react-toastify"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"

const sidebarItems = [
  { icon: Home, label: "Trang chủ", link: Nav.DASHBOARD_PAGE, wright: "dashboard" },
  { icon: Activity, label: "Giám sát", link: Nav.SUPERVISE_PAGE, wright: "map" },
  {
    icon: BarChart2,
    label: "Thống kê",
    wright: "statistic",
    subItems: [
      { label: "Thống kê chung", link: Nav.STATISTIC_PAGE, wright: "statistic" },
      { label: "Thống kê phiếu công việc", link: Nav.STATISTIC_REPORT_DOC_PAGE, wright: "statistic" },
      { label: "Thống kê tiến độ", link: Nav.STATISTIC_REPORT_WORKPROGRESS_PAGE, wright: "statistic" },
    ],
  },
  { icon: Map, label: "Quản lý tuyến", link: Nav.ROUTE_PAGE, wright: "route" },
  { icon: Inspect, label: "Quản lý phiếu kiểm tra", link: Nav.INSPECTDOC_PAGE, wright: "inspectdoc" },
  { icon: Briefcase, label: "Quản lý công việc", link: Nav.MYTASK_PAGE, wright: "inspectdoc" },
  { icon: Pin, label: "Sửa chữa", link: Nav.REPAIRDOC_PAGE, wright: "repairdoc" },
  {
    icon: Ratio,
    label: "Thiết bị",
    wright: ["workstation", "flycam"],
    subItems: [
      { label: "Quản lý máy trạm", link: Nav.WORKSTATION_PAGE, wright: "workstation" },
      { label: "Quản lý thiết bị bay", link: Nav.UAV_PAGE, wright: "flycam" },
    ],
  },
  {
    icon: AlertCircle,
    label: "Cảnh báo",
    wright: ["incident", "incidentfly"],
    subItems: [
      { label: "Danh sách cảnh báo bay", link: Nav.INCIDENTFLY_PAGE, wright: "incidentfly" },
    ],
  },
  {
    icon: Users,
    label: "Người dùng",
    wright: ["user", "role"],
    subItems: [
      { label: "Quản lý người dùng", link: Nav.USER_PAGE, wright: "user" },
      { label: "Quản lý vai trò", link: Nav.ROLE_PAGE, wright: "role" },
    ],
  },
]

function menuIncludes(menu: Array<string>, item: string): boolean {
  return ["FULL", `powl-${item}`, `powl-${item}-view`].some((string) =>
    menu.includes(string)
  )
}

export default function Sidebar({ className }: { className?: string }) {
  const router = useRouter()
  const [username, setUsername] = useState<string>("")
  const [avatar, setAvatar] = useState<string>("")
  const [data, setData] = useState<ProfileData | null>()
  const [isExpanded, setIsExpanded] = useState(false)
  const [expandedItem, setExpandedItem] = useState<string | null>(null)
  const [menuItems, setMenuItems] = useState<Array<string>>([])
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    setUsername(getCookie("name") || "")
    setAvatar(getCookie("avatar") || "")
    setMenuItems(getCookie("menu")?.split(",") || [])

    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  function fetchData() {
    fetchWithToken(SE.API_PROFILE)
      .then((response) => response as ProfileRawData)
      .then((data) => {
        if (!data.data) return

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
        })
      })
      .catch((e: Error) => {
        if (e.message) toast.error(e.message)
      })
  }

  useEffect(fetchData, [])

  const handleItemClick = (label: string) => {
    if (expandedItem === label) {
      setExpandedItem(null)
    } else {
      setExpandedItem(label)
    }
  }

  const handleMouseEnter = () => {
    if (!isMobile) setIsExpanded(true)
  }

  const handleMouseLeave = () => {
    if (!isMobile) {
      setIsExpanded(false)
      setExpandedItem(null)
    }
  }

  const renderMenuItem = (item: any, index: number) => {
    const isItemExpanded = expandedItem === item.label
    const hasPermission = Array.isArray(item.wright)
      ? item.wright.some((w: string) => menuIncludes(menuItems, w))
      : menuIncludes(menuItems, item.wright)

    if (!hasPermission) return null

    return (
      <div key={index}>
        {item.subItems ? (
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start mb-1",
              isExpanded || isMobile ? "px-4" : "px-0",
              isItemExpanded && "bg-accent"
            )}
            onClick={() => handleItemClick(item.label)}
          >
            <item.icon className={cn("h-5 w-5", (isExpanded || isMobile) ? "mr-2" : "mx-auto")} />
            {(isExpanded || isMobile) && (
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
              className={cn("w-full justify-start mb-1", (isExpanded || isMobile) ? "px-4" : "px-0")}
            >
              <item.icon className={cn("h-5 w-5", (isExpanded || isMobile) ? "mr-2" : "mx-auto")} />
              {(isExpanded || isMobile) && <span>{item.label}</span>}
            </Button>
          </Link>
        )}
        {isItemExpanded && item.subItems && (
          <div className="ml-6 mt-2 space-y-2">
            {item.subItems.map((subItem: any, subIndex: number) => (
              menuIncludes(menuItems, subItem.wright) && (
                <Link key={subIndex} href={subItem.link}>
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-sm py-1"
                  >
                    <ChevronRight className="h-4 w-4 mr-2" />
                    {subItem.label}
                  </Button>
                </Link>
              )
            ))}
          </div>
        )}
      </div>
    )
  }

  const handleLogout = () => {
    deleteCookie("token-type")
    deleteCookie("refresh-token")
    deleteCookie("access-token")
    deleteCookie("username")
    deleteCookie("menu")
    router.push(Nav.LOGIN_PAGE)
  }

  const SidebarContent = () => (
    <>
      <div className="p-1 flex">
        {isExpanded || isMobile ? (
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
              {!isExpanded && !isMobile && (
                <TooltipContent side="right">{item.label}</TooltipContent>
              )}
            </Tooltip>
          ))}
        </TooltipProvider>
      </nav>
      {isExpanded || isMobile ? (
        <Popover>
          <PopoverTrigger asChild>
            <div className="mt-auto p-4 flex items-center cursor-pointer">
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
              <ChevronDown className="h-4 w-4 text-gray-500" />
            </div>
          </PopoverTrigger>
          <PopoverContent className="w-56">
            <div className="space-y-2">
              <Button variant="ghost" className="w-full justify-start" asChild>
                <Link href={Nav.PROFILE_PAGE}>
                  <User className="mr-2 h-4 w-4" />
                  Thông tin cá nhân
                </Link>
              </Button>
              <Button variant="ghost" className="w-full justify-start" asChild>
                <Link href={Nav.MYTASK_PAGE}>
                  <Briefcase className="mr-2 h-4 w-4" />
                  Công việc của tôi
                </Link>
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-100"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Đăng xuất
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      ) : (
        <Popover>
          <PopoverTrigger asChild>
            <button
              className="mt-auto text-gray-500 hover:text-gray-700 text-center p-4 w-full"
              type="button"
            >
              <Avatar className="h-8 w-8 mx-auto">
                <AvatarImage
                  src={`${process.env.NEXT_PUBLIC_API_URL}/${avatar}`}
                  alt="User avatar"
                />
                <AvatarFallback>AVT</AvatarFallback>
              </Avatar>
            </button>
          </PopoverTrigger>
          <PopoverContent side="right" className="w-56">
            <div className="space-y-2">
              <Button variant="ghost" className="w-full justify-start" asChild>
                <Link href="/profile">
                  <User className="mr-2 h-4 w-4" />
                  Thông tin cá nhân
                </Link>
              </Button>
              <Button variant="ghost" className="w-full justify-start" asChild>
                <Link href="/my-work">
                  <Briefcase className="mr-2 h-4 w-4" />
                  Công việc của tôi
                </Link>
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-100"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Đăng xuất
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      )}
    </>
  )

  if (isMobile) {
    return (
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[300px] sm:w-[400px]">
          <SidebarContent />
        </SheetContent>
      </Sheet>
    )
  }

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
      <SidebarContent />
    </aside>
  )
}