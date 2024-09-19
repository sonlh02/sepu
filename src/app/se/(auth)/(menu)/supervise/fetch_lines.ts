// load package
import { LatLngExpression } from "leaflet";
// load lib
import { fetchWithToken } from "@/lib/fetch_data";
import { SE } from "@/lib/api";
// load data, content from app
import { RouteRaw } from "./map_data";

export type LineRawData = {
  data: {
    lines: Array<RouteRaw>;
  };
};

export async function fetchLines(route_id: string): Promise<Array<RouteRaw>> {
  const data = await fetchWithToken(`${SE.API_MAPLINES}?route_id=${route_id}`)
    .then((response) => response as LineRawData);

  const lines: Array<RouteRaw> = data.data.lines;
  return lines;
}
