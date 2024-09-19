// load config
import { InspectStatus } from "@/enum/doc_status";
import { InspectType } from "@/enum/inspect_type";

export type InspectData = {
  id: number;
  type: InspectType;
  powerline: {
    id: number;
    name: string;
    code: string;
  };
  powerPoles: {
    from: {
      id: number;
      name: string;
      code: string;
    };
    to: {
      id: number;
      name: string;
      code: string;
    };
  };
  code: string;
  date: Date;
  inspectMethod: string;
  approvers: Array<{
    id: number;
    username: string;
    name: string;
    signature?: string;
    position: string;
    represent: string;
    confirm?: boolean;
  }>;
  workers: Array<{
    id: number;
    username: string;
    name: string;
    position: string;
    lvWork: 1 | 2 | 3 | 4 | 5 | 6 | 7;
    lvSafe: 1 | 2 | 3 | 4 | 5;
    signature?: string;
    leader?: boolean;
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
  images: Array<string>;
  warnings: Array<{
    image: string;
    powerPole: string;
    latitude: number;
    longitude: number;
    altitude: number;
    description: string;
  }>;
  results: Array<{
    title: string;
    body: string;
    keyword: string;
  }>;
};
