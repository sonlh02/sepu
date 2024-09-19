export type InspectDocRaw = {
  id: number;
  docNo: string;
  type: "D" | "N";
  dateInspect: string;
  route: {
    id: number;
    name: string;
    code: string;
  };
  powerFi: {
    id: number;
    name: string;
    code: string;
    latitude: number;
    longitude: number;
  };
  powerTi: {
    id: number;
    name: string;
    code: string;
    latitude: number;
    longitude: number;
  };
  routeCode: string;
  powerFrom: string;
  powerTo: string;
  methodInspect: string;
  status: 1 | 2 | 3 | 4 | 5 | 6;
  inspectTeams: Array<{
    id: number;
    username: string;
    name: string;
    position: string;
    lvWork: string;
    lvSafe: string;
    leader?: boolean;
  }>;
  inspectApprovals: Array<{
    id: number;
    username: string;
    name: string;
    position: string;
    confirm?: boolean;
    represent: string;
  }>;
  inspectWorkstations: Array<{
    id: number;
    workstation: {
      id: number;
      name: string;
      code: string;
      activity: boolean;
    };
  }>;
  inspectFlycams: Array<{
    id: number;
    flycam: {
      id: number;
      name: string;
      code: string;
      activity: boolean;
    };
  }>;
  inspectImages: Array<{
    id: number;
    visualData: {
      id: number;
      path: string;
      image: string;
    };
  }>;
  inspectResults: Array<{
    id: number;
    keyword: string;
    title: string;
    result: string;
    pos: number;
  }>;
  incidentFlies: Array<{
    id: number;
    power: {
      id: number;
      name: string;
      code: string;
      latitude: number;
      longitude: number;
    };
    pole?: string;
    line?: string;
    latitude: number;
    longitude: number;
    altitude: number;
    incident: string;
    incidentType: string;
    dateWarning: string;
    lvWarning?: number;
    visualData: {
      id: number;
      path: string;
      image: string;
    };
  }>;
  workstation: string;
  flycam: string;
};

export type RepairDocRaw = {
  id: number;
  docNo: string;
  dateRepair: string;
  route: {
    id: number;
    name: string;
    code: string;
  };
  routeCode: string;
  safeMeasure: string;
  tasks: string;
  result: string;
  unresolved: string;
  powers: string;
  status: 1 | 2 | 3 | 4 | 5;
  repairTeams: Array<{
    id: number;
    username: string;
    name: string;
    position: string;
    lvWork: string;
    lvSafe: string;
    leader?: boolean;
  }>;
  repairApprovals: Array<{
    id: number;
    username: string;
    name: string;
    position: string;
    represent: string;
    confirm?: boolean;
  }>;
  repairImages: Array<{
    id: number;
    visualData: {
      id: number;
      path: string;
      image: string;
    };
  }>;
};