"use client";

import { useState } from "react";
import { MapContainer, Marker, Polyline, Popup, Tooltip } from "react-leaflet";
import L, { LatLngExpression } from "leaflet";
import "leaflet/dist/leaflet.css";
import { toast } from "react-toastify";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  defaultMap,
  defaultFocus,
  defaultZoom,
  RouteRaw,
  PowerData,
  UavData,
  Warning,
} from "./map_data";
import { fetchRoute } from "./fetch_routes";
import Map from "./Map";

const iconUav = L.icon({
  iconUrl: "/static/map_icons/drone.png",
  iconSize: [22, 22],
  iconAnchor: [16, 16],
  tooltipAnchor: [16, 0],
  popupAnchor: [0, -16],
});

const iconPower = L.icon({
  iconUrl: "/static/map_icons/power.png",
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  tooltipAnchor: [16, 0],
  popupAnchor: [0, -16],
});

const iconWarning = L.icon({
  iconUrl: "/static/map_icons/warning.png",
  iconSize: [20, 20],
  iconAnchor: [16, 16],
  tooltipAnchor: [16, 0],
  popupAnchor: [0, -16],
});

const iconError = L.icon({
  iconUrl: "/static/map_icons/error.png",
  iconSize: [20, 20],
  iconAnchor: [16, 16],
  tooltipAnchor: [16, 0],
  popupAnchor: [0, -16],
});

export default function MapSupervise({
  routes,
  lines,
  uavs,
}: {
  routes: { [key: string]: string };
  lines: Array<RouteRaw>;
  uavs: { [key: string]: UavData };
}) {
  const [focus, setFocus] = useState<LatLngExpression | undefined>();
  const [zoom, setZoom] = useState<number>(defaultZoom);
  const [selectRoute, setSelectRoute] = useState(defaultMap.value);

  const [powerline, setPowerline] = useState<string>("");
  const [powers, setPowers] = useState<Array<PowerData>>([]);
  const [pLines, setPLines] = useState<Array<LatLngExpression>>([]);
  const [warnings, setWarnings] = useState<Array<Warning>>([]);

  function focusOn(routeId: string) {
    fetchRoute(routeId)
      .then((iroute) => {
        setPowerline(
          `${iroute.name} (${iroute.code} - ${iroute.num_power} cột)`
        );
        setPowers(iroute.powers);
        setPLines(iroute.lines);
        setFocus(iroute.focus);
        setZoom(16);

        setWarnings(
          iroute.powers
            .filter(
              (item) => item.warning != undefined && item.warning.length > 0
            )
            .map((item) => ({
              coordinates: item.coordinates,
              status: item.status,
              warning: item.warning,
            }))
        );
      })
      .catch((e: Error) => {
        if (e.message) toast.error(e.message);
      });
  }

  function returnMap() {
    setPowers([]);
    setPLines([]);
    setFocus(defaultFocus);
    setZoom(defaultZoom);
  }

  return (
    <>
      <div className="absolute left-0 top-0 w-80 p-3 pb-0 z-10">
        <Select
          value={selectRoute}
          onValueChange={(value) => {
            setSelectRoute(value);
            if (value !== defaultMap.value) {
              focusOn(value);
            } else {
              returnMap();
            }
          }}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Chọn tuyến" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={defaultMap.value || "default"}>
              {defaultMap.label}
            </SelectItem>
            {Object.entries(routes).map(([routeId, routeName]) => (
              <SelectItem key={routeId} value={routeId || `route-${routeId}`}>
                {routeName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <MapContainer
        className="flex-1 z-0"
        center={defaultFocus}
        zoom={defaultZoom}
        zoomControl={false}
      >
        <Map lines={lines} focus={focus} zoom={zoom} />

        {powers.map((power) => (
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

        {warnings.map((item, index) => (
          <Marker
            key={index}
            position={item.coordinates}
            icon={item.status == "warning" ? iconWarning : iconError}
          >
            <Tooltip>
              <p className="font-bold">Cảnh báo</p>
              <div className="list-inside list-disc">
                {item.warning?.map((w, k) => (
                  <div key={k}>- {w}</div>
                ))}
              </div>
            </Tooltip>
          </Marker>
        ))}

        {Object.entries(uavs).map(([docuav, uavData]) => (
          <Marker key={docuav} position={uavData.coordinates} icon={iconUav}>
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
      </MapContainer>
    </>
  );
}
