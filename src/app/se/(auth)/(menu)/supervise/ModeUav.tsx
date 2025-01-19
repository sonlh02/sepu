'use client'

import { useState, useEffect, Dispatch, SetStateAction } from "react"
import { MapContainer, Marker, Polyline, Popup, Tooltip } from "react-leaflet"
import L, { LatLngExpression } from "leaflet"
import "leaflet/dist/leaflet.css"
import { toast } from 'react-toastify'
import Moment from 'moment'

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

import { defaultMap, defaultFocus, defaultZoom, RouteRaw, PowerData, UavData, Warning, DocumentData } from "./map_data"
import { fetchRoute } from "./fetch_routes"
import { fetchDocuments } from "./fetch_documents"
import UavListItem from "./UavListItem"
import Map from "./Map"

const iconPower = L.icon({
  iconUrl: "/static/map_icons/power.png",
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  tooltipAnchor: [16, 0],
  popupAnchor: [0, -16],
})

const iconUav = L.icon({
  iconUrl: "/static/map_icons/drone.png",
  iconSize: [22, 22],
  iconAnchor: [16, 16],
  tooltipAnchor: [16, 0],
  popupAnchor: [0, -16],
})

const iconWarning = L.icon({
  iconUrl: "/static/map_icons/warning.png",
  iconSize: [20, 20],
  iconAnchor: [16, 16],
  tooltipAnchor: [16, 0],
  popupAnchor: [0, -16],
})

export default function MapSupervise({
  routes,
  lines,
  uavs,
  setUavs,
}: {
  routes: { [key: string]: string }
  lines: Array<RouteRaw>
  uavs: { [key: string]: UavData }
  setUavs: Dispatch<SetStateAction<{[key: string]: UavData}>>
}) {
  const [focus, setFocus] = useState<LatLngExpression | undefined>()
  const [zoom, setZoom] = useState<number>(defaultZoom)
  const [documents, setDocuments] = useState<{ [key: string]: DocumentData }>({})

  // data route
  const [powerline, setPowerline] = useState<String>("")
  const [powers, setPowers] = useState<Array<PowerData>>([])
  const [pLines, setPLines] = useState<Array<LatLngExpression>>([])
  
  // UAV
  const [code, setCode] = useState<string>("")
  const [uavLogs, setUavLogs] = useState<Array<UavData>>([])
  const [warning, setWarning] = useState<Array<UavData>>([])
  const [uavLines, setUavLines] = useState<Array<LatLngExpression>>([])

  // seek
  const [selectDate, setSelectDate] = useState(new Date())
  const [selectRoute, setSelectRoute] = useState(defaultMap)
  const [seek, setSeek] = useState({
    dateInspect: Moment(new Date()).format("YYYY-MM-DD"),
    route_id: ""
  })

  function resetData() {
    // reset data
    setPowers([])
    setPLines([])

    setUavs({})
    setUavLogs([])
    setWarning([])
    setUavLines([])
  }

  function focusRoute(routeId: string, focus: boolean) {
    if (routeId === "") return

    fetchRoute(routeId)
      .then((iroute) => {
        setPowerline(`${iroute.name} (${iroute.code} - ${iroute.num_power} cột)`)
        setPowers(iroute.powers)
        setPLines(iroute.lines)
        
        if(focus) {
          setFocus(iroute.focus)
          setZoom(16)
        }
      })
      .catch((e: Error) => {
        if(e.message) toast.error(e.message)
      })
  }

  function focusUav(docuav: string, uavLogs: Array<UavData>) {
    // set code
    setCode(docuav)

    const locationUav = uavLogs[0] as UavData
    // list UAV
    setUavs({
      [docuav]: locationUav,
    })

    setFocus(locationUav.coordinates)
    setZoom(20)

    // flight history
    setUavLogs(uavLogs)

    setWarning(Object.values(uavLogs).filter((l) => l.warning && l))
  }

  useEffect(() => {
    fetchDocuments(seek)
      .then((response) => setDocuments(response))
      .catch((e: Error) => {
        if(e.message) toast.error(e.message)
      })
  }, [seek])

  useEffect(() => {
    if(uavs[code]) {
      setFocus(uavs[code].coordinates)
      setZoom(20)
      
      setUavLines((uavLines) => [
        ...uavLines,
        uavs[code].coordinates,
      ])

      uavs[code].warning && setWarning((warning) => [
        ...warning,
        uavs[code]
      ])
    }
  }, [uavs, code])

  return (
    <>
      <div className="inset-y-0 left-0 flex w-80 flex-col bg-background shadow-xl bg-slate-200">
        <div className="p-4">
          <Accordion type="single" collapsible>
            <AccordionItem value="search">
              <AccordionTrigger>Tìm kiếm</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className="w-full justify-start text-left font-normal"
                      >
                        {selectDate ? (
                          Moment(selectDate).format("DD/MM/YYYY")
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={selectDate}
                        onSelect={(date) => {
                          if (date) {
                            setSelectDate(date)
                            setSeek({...seek, dateInspect: Moment(date).format("YYYY-MM-DD")})
                          }
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>

                  <Select
                    value={selectRoute.value}
                    onValueChange={(value) => {
                      setSelectRoute({ value, label: routes[value] || defaultMap.label })
                      setSeek({...seek, route_id: value})
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn tuyến" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries({[defaultMap.value]: defaultMap.label, ...routes}).map(([routeId, routeName]) => (
                        <SelectItem key={routeId} value={routeId || `route-${routeId}`}>
                          {routeName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        <div className="overflow-y-auto">
          <ul className="menu pb-32">
            {Object.entries(documents).map(([docId, docData], index) => (
              <div key={index}>
                <UavListItem
                  index={index}
                  docId={docId}
                  docData={docData}
                  resetData={resetData}
                  focusRoute={focusRoute}
                  focusUav={focusUav}
                />
              </div>
            ))}
          </ul>
        </div>
      </div>

      <MapContainer
        className="flex-1 z-0"
        center={defaultFocus}
        zoom={defaultZoom}
        zoomControl={false}
      >
        <Map
          lines={lines}
          focus={focus}
          zoom={zoom}
        />

        {/* Draw power */}
        {Object.values(powers).map((power) => (
          <Marker
            key={power.code}
            position={power.coordinates}
            icon={iconPower}
          >
            <Tooltip>
              <p className="text-lg font-bold">{power.name}</p>
              <p className="font-mono">{power.code}</p>
              <ul className="list-inside list-disc pt-2">
                <li>Vĩ độ: {Object.values(power.coordinates)[0]}</li>
                <li>Kinh độ: {Object.values(power.coordinates)[1]}</li>
              </ul>
            </Tooltip>
          </Marker>
        ))}
        {/* Draw power line */}
        {pLines.length > 0 &&
          pLines.every(
            (line) =>
              Array.isArray(line) &&
              line.length === 2 &&
              line.every((coord) => typeof coord === "number")
          ) && (
            <Polyline pathOptions={{ color: "#9c27b0" }} positions={pLines}>
              <Popup>{powerline}</Popup>
            </Polyline>
          )}

        {/* Draw uav */}
        {Object.entries(uavs).map(([docuav, uavData]) => (
          <Marker 
            key={docuav} 
            position={uavData.coordinates} 
            icon={iconUav}
          >
            <Tooltip>
              <p className="font-bold">{docuav}</p>
              <ul className="list-inside list-disc">
                <li>Kinh độ: {Object.values(uavData.coordinates)[1]}</li>
                <li>Vĩ độ: {Object.values(uavData.coordinates)[0]}</li>
                {Object.values(uavData.coordinates)[2] && (
                  <li>Cao Độ: {Object.values(uavData.coordinates)[2]}</li>
                )}
              </ul>
            </Tooltip>
          </Marker>
        ))}
        
        {/* Draw fly logs */}
        <Polyline pathOptions={{ color: "#8bc34a" }} positions={Object.values(uavLogs).map((uavLog) => uavLog.coordinates)} />

        {/* Draw line */}
        <Polyline pathOptions={{ color: "#c1b116" }} positions={uavLines} />

        {/* Draw warning */}
        {warning && Object.values(warning).map((w, i) => (
          <Marker
            key={i}
            position={w.coordinates}
            icon={iconWarning}
          >
            <Tooltip>{w.warning}</Tooltip>
          </Marker>
        ))}
      </MapContainer>
    </>
  )
}