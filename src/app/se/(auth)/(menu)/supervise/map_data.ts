// load package
import { LatLngExpression } from "leaflet";
// load config
import { Status } from "@/enum/status";

// define
export const defaultMap = {value: "", label: "-- Bản đồ --"};
export const defaultFocus: LatLngExpression = [21.033333, 105.849998];
export const defaultZoom: number = 12;
export const timeDisplay: number = 300000;

export type RouteRaw = {
  id: number;
  code: string; 
  name: string; 
  num_power: number;
  line: Array<Array<LatLngExpression>>;
}

export type UavData = {
  time?: number;
  locationName: string;
  coordinates: LatLngExpression;
  warning?: string;
};

export type PowerData = {
  name: string;
  code: string;
  coordinates: LatLngExpression;
  status: Status;
  warning?: Array<string>;
};

export type RouteData = {
  name: string;
  code: string;
  num_power: number;
  focus: LatLngExpression;
  lines: Array<LatLngExpression>;
  powers: Array<PowerData>;
};

export type Warning = {
  coordinates: LatLngExpression;
  status: Status;
  warning: Array<string> | undefined;
};

export type DocumentData = {
  docId: number;
  docNo: string;
  type: string;
  powerline: {
    id: number,
    name: string,
    code: string,
  },
  powerPoles: {
    from: {
      id: number,
      name: string,
      code: string,
    },
    to: {
      id: number,
      name: string,
      code: string,
    }
  },
  date: Date;
  workers: Array<string>;
  workstations?: string;
  flyDevices: Array<string>;
};