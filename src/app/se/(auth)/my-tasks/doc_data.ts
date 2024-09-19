// load config
import { InspectStatus, RepairStatus } from "@/enum/doc_status";
import { InspectType } from "@/enum/inspect_type";

export type InspectData = {
  id: number;
  code: string;
  type: InspectType;
  powerline: string;
  powerPoleFrom: string;
  powerPoleTo: string;
  date: Date;
  inspectMethod: string;
  workers: Array<{
    username: string;
    name: string;
    position: string;
    lvWork: string;
    lvSafe: string;
    leader?: boolean;
  }>;
  approvers: Array<{
    username: string;
    name: string;
    position: string;
    confirm?: boolean;
    represent: string;
  }>;
  workstations: Array<{
    id: number;
    name: string;
    code: string;
    activity: boolean;
  }>;
  flycams: Array<{
    id: number;
    name: string;
    code: string;
    activity: boolean;
  }>;
  status: InspectStatus;
  images: Array<{
    id: number;
    name: string;
    path: string;
  }>;
  incidentFlies: Array<{
    id: number;
    powerPole: {
      id: number;
      name: string;
    };
    latitude: number;
    longitude: number;
    altitude: number;
    description: string;
    image: string;
  }>;
  results: {
    corridor: string;
    steel_col: string;
    col_foundation: string;
    structure: string;
    insulate: string;
    electric_wire: string;
    earthing: string;
    holding_rope: string;
    anti_lightning: string;
    anti_vibration: string;
    heat_coupling: string;
    processed: string;
    discharge: string;
    other: string;
    suggest: string;
  };
};

export type RepairData = {
  id: number;
  code: string;
  powerline: string;
  date: Date;
  workers: Array<{
    username: string;
    name: string;
    position: string;
    lvWork: string;
    lvSafe: string;
    leader?: boolean;
  }>;
  approvers: Array<{
    username: string;
    name: string;
    position: string;
    represent: string;
    confirm?: boolean;
  }>;
  prepare: string;
  tasks: string;
  result: string;
  unresolved: string;
  powers: string;
  status: RepairStatus;
  images: Array<{
    id: number;
    name: string;
    path: string;
  }>;
};

export type WarningData = {
  id?: number;
  powerPole?: number;
  latitude?: number;
  longitude?: number;
  altitude?: number;
  image?: string;
  object?: number;
  description?: string;
};

export type IncidentData = {
  id: number;
  index?: string;
  path: string;
};

export type ImageData = {
  id: number;
  name: string;
  path: string;
};

export type PagingDoc = {
  it: number;
  ia: number;
  rt: number;
  ra: number;
};