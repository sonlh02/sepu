import Link from "next/link"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Nav } from "@/lib/nav"

export default function Tablist({ active }: { active: string }) {
  return (
    <div className="flex justify-center p-4 sm:p-6">
      <Tabs value={active} className="w-full max-w-3xl">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="index" asChild>
            <Link href={Nav.MYTASK_PAGE} className="font-bold">
              <span className="hidden sm:inline">Danh sách phiếu công việc</span>
              <span className="sm:hidden text-xs">Công việc</span>
            </Link>
          </TabsTrigger>
          <TabsTrigger value="inspect" asChild>
            <Link href={Nav.MYTASKINSPECT_PAGE} className="font-bold">
              <span className="hidden sm:inline">Phiếu kiểm tra hoàn tất</span>
              <span className="sm:hidden text-xs">Kiểm tra H.T</span>
            </Link>
          </TabsTrigger>
          {/* <TabsTrigger value="repair" asChild>
            <Link href={Nav.MYTASKREPAIR_PAGE} className="font-bold">
              <span className="hidden sm:inline">Phiếu sửa chữa hoàn tất</span>
              <span className="sm:hidden text-xs">Sửa chữa H.T</span>
            </Link>
          </TabsTrigger> */}
        </TabsList>
      </Tabs>
    </div>
  )
}