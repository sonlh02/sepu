import { Dispatch, SetStateAction } from "react"
import { Button } from "@/components/ui/button"
import { ChevronFirst, ChevronLast } from "lucide-react"

export default function Pagination({
  className,
  pages,
  currentPage,
  setCurrentPage,
}: {
  className?: string
  pages: number
  currentPage: number
  setCurrentPage: Dispatch<SetStateAction<number>>
}) {
  currentPage = Math.max(currentPage, 1)

  const startPage = Math.max(
    currentPage - 2 - Math.max(2 - (pages - currentPage), 0),
    1
  )
  const endPage = Math.min(
    currentPage + 2 + Math.max(3 - currentPage, 0),
    pages
  )

  return (
    <div className={`flex justify-center items-center space-x-1${className || ""}`}>
      <Button
        variant="outline"
        size="icon"
        onClick={() => setCurrentPage(1)}
        disabled={currentPage === 1}
      >
        <ChevronFirst className="h-4 w-4" />
      </Button>

      {startPage > 1 && <span className="px-2">...</span>}

      {range(startPage, endPage).map((page) => (
        <Button
          key={page}
          variant={currentPage === page ? "default" : "outline"}
          size="icon"
          onClick={() => setCurrentPage(page)}
        >
          {page}
        </Button>
      ))}

      {endPage < pages && <span className="px-2">...</span>}

      <Button
        variant="outline"
        size="icon"
        onClick={() => setCurrentPage(pages)}
        disabled={currentPage === pages}
      >
        <ChevronLast className="h-4 w-4" />
      </Button>
    </div>
  )
}

function range(start: number, stop: number): Array<number> {
  return Array.from(
    { length: stop - start + 1 },
    (_, index) => start + index
  )
}