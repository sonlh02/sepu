// load package
import { LatLngExpression } from "leaflet";
// load lib
import { fetchWithToken } from "@/lib/fetch_data";
import { SE } from "@/lib/api";
// load config
import { Status } from "@/enum/status";
// load data, content from app
import { RouteData, PowerData } from "./map_data";

export type RoutesRawData = {
  data: {
    routes: Array<{
      id: number;
      code: string;
      name: string;
      note: string;
      numPower: number;
    }>;
  };
};

export async function fetchRoutes(): Promise<{ [key: string]: string }> {
  const data = await fetchWithToken(SE.API_MAPROUTES)
    .then((response) => response as RoutesRawData);

  let routeDatas: { [key: string]: string } = {};

  data.data.routes.forEach((route) => {
    routeDatas[route.id] = `${route.name} (${route.code})`;
  });

  return routeDatas;
}

export type RouteRawData = {
  data: {
    route: {
      id: number;
      code: string;
      name: string;
      note: string;
      numPower: number;
    };
    lines: Array<LatLngExpression>;
    powers: Array<{
      id: number;
      name: string;
      code: string;
      latitude: number;
      longitude: number;
      status: number;
      note: string;
      powerItems: Array<{
        id: number;
        equipment: string;
        text: string;
        quantity: number;
        status: number;
        note: string;
      }>;
      // origin: string;
      // prevLat: number;
      // prevLong: number;
    }>;
  };
};

export async function fetchRoute(routeId: string): Promise<RouteData> {
  const data = await fetchWithToken(`${SE.API_MAPROUTE}/${routeId}`)
    .then((response) => response as RouteRawData);

  let powers: Array<PowerData> = [];
  let focus = { latitude: 0, longitude: 0, count: 0 };
  data.data.powers.forEach((power) => {
    powers.push({
      name: power.name,
      code: power.code,
      coordinates: [power.latitude, power.longitude],
      status: {
        1: Status.Okay,
        2: Status.Warning,
        3: Status.Error,
      }[power.status] || Status.Okay,
      warning: power.powerItems?.filter((item) => item.status != 1 && item.note).map((item) => item.note),
    });

    if(power.latitude && power.longitude) {
      focus.latitude += power.latitude;
      focus.longitude += power.longitude;
      focus.count += 1;
    }
  });

  return {
    name: data.data.route.name,
    code: data.data.route.code,
    num_power: focus.count,
    focus: focus.count != 0 ? [focus.latitude/focus.count, focus.longitude/focus.count] : [0, 0],
    lines: data.data.lines,
    powers: powers,
  };
}
