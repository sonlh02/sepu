"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ChevronRight, ChevronLeft, User, Briefcase } from "lucide-react"
import Link from "next/link"
import { getCookie } from "cookies-next"
import { fetchWithToken } from "@/lib/fetch_data"
import { SE } from "@/lib/api"
import { Gender } from "@/enum/gender"
import { toast } from "react-toastify"
import { ProfileData, ProfileRawData } from "./profile/profile_data"
import { Nav } from "@/lib/nav"
import Image from "next/image";

export default function RightPanel({ className }: { className?: string }) {
  const [isRightExpanded, setIsRightExpanded] = useState(false)
  const [username, setUsername] = useState<string>("")
  const [avatar, setAvatar] = useState<string>("")
  const [data, setData] = useState<ProfileData | null>(null)

  useEffect(() => {
    setUsername(getCookie("name") || "")
    setAvatar(getCookie("avatar") || "")
    fetchData()
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

  return (
    <aside
      className={`bg-white transition-all duration-300 ease-in-out ${
        isRightExpanded ? "w-64" : "w-12"
      } relative ${className}`}
    >
      <Button
        variant="ghost"
        size="icon"
        className="absolute -left-4 top-1/2 transform -translate-y-1/2 bg-white rounded-full shadow-md"
        onClick={() => setIsRightExpanded(!isRightExpanded)}
      >
        {isRightExpanded ? (
          <ChevronRight className="h-4 w-4" />
        ) : (
          <ChevronLeft className="h-4 w-4" />
        )}
      </Button>
      {isRightExpanded ? (
        <div className="p-6 h-full overflow-auto">
          <div className="flex items-center mb-6">
            <Image
              src={`${process.env.NEXT_PUBLIC_API_URL}/${avatar}`}
              alt="User avatar"
              width={40} // Corresponds to w-10 (10 * 4px)
              height={40} // Corresponds to h-10 (10 * 4px)
              className="rounded-full mr-3"
            />
            <div>
              <h3 className="font-bold">{username}</h3>
              <p className="text-sm text-gray-500">{data?.email}</p>
            </div>
          </div>
          <nav className="space-y-2">
            <Link href={Nav.PROFILE_PAGE} className="flex items-center p-2 rounded-lg hover:bg-gray-100">
              <User className="h-5 w-5 mr-2" />
              <span>Personal Information</span>
            </Link>
            <Link href={Nav.MYTASK_PAGE} className="flex items-center p-2 rounded-lg hover:bg-gray-100">
              <Briefcase className="h-5 w-5 mr-2" />
              <span>My Work</span>
            </Link>
          </nav>
        </div>
      ) : (
        <div className="flex flex-col items-center mt-4 space-y-4">
          <Image
            src={`${process.env.NEXT_PUBLIC_API_URL}/${avatar}`}
            alt="User avatar"
            width={10} // Corresponds to w-10 (10 * 4px)
            height={10} // Corresponds to h-10 (10 * 4px)
            className="w-10 h-10 rounded-full"
          />
          <Link href={Nav.PROFILE_PAGE} className="p-1 rounded-full hover:bg-gray-100">
            <User className="h-5 w-5" />
          </Link>
          <Link href={Nav.MYTASK_PAGE} className="p-1 rounded-full hover:bg-gray-100">
            <Briefcase className="h-5 w-5" />
          </Link>
        </div>
      )}
    </aside>
  )
}