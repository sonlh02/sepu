// load config
import { InspectStatus, RepairStatus } from "@/enum/doc_status";
import { InspectType } from "@/enum/inspect_type";
// load data, content from app
import { InspectDocRaw, RepairDocRaw } from "./doc_raw";
import { InspectData, RepairData } from "./doc_data";

export function inspectDataProcessing(docRaw: InspectDocRaw): InspectData {
  return {
    id: docRaw.id,
    code: docRaw.docNo,
    type: {
      D: InspectType.Day,
      N: InspectType.Night,
    }[docRaw.type],
    powerline: docRaw.routeCode,
    powerPoleFrom: docRaw.powerFrom,
    powerPoleTo: docRaw.powerTo,
    date: new Date(docRaw.dateInspect),
    inspectMethod: docRaw.methodInspect,
    workers: docRaw.inspectTeams.map((userRawData) => ({
      username: userRawData.username,
      name: userRawData.name,
      position: userRawData.position,
      lvWork: userRawData.lvWork,
      lvSafe: userRawData.lvSafe,
      leader: userRawData.leader,
    })),
    approvers: docRaw.inspectApprovals.map((userRawData) => ({
      username: userRawData.username,
      name: userRawData.name,
      position: userRawData.position,
      confirm: userRawData.confirm,
      represent: userRawData.represent,
    })),
    workstations: docRaw.inspectWorkstations.map((iw) => ({
      id: iw.workstation.id,
      name: iw.workstation.name,
      code: iw.workstation.code,
      activity: iw.workstation.activity,
    })),
    flycams: docRaw.inspectFlycams.map((iu) => ({
      id: iu.flycam.id,
      name: iu.flycam.name,
      code: iu.flycam.code,
      activity: iu.flycam.activity,
    })),
    status: {
      1: InspectStatus.Created,
      2: InspectStatus.Confirmed,
      3: InspectStatus.Ready,
      4: InspectStatus.Submited,
      5: InspectStatus.Approved,
      6: InspectStatus.Completed,
    }[docRaw.status],
    images: docRaw.inspectImages.map((imageRaw) => ({
      id: imageRaw.visualData.id,
      name: imageRaw.visualData.image,
      path: imageRaw.visualData.path,
    })),
    incidentFlies: docRaw.incidentFlies.map((incidentRaw) => ({
      id: incidentRaw.id,
      powerPole: {
        id: incidentRaw.power.id,
        name: incidentRaw.power.name,
      },
      latitude: incidentRaw.latitude,
      longitude: incidentRaw.longitude,
      altitude: incidentRaw.altitude,
      description: incidentRaw.incident,
      image: incidentRaw.visualData.path,
    })),
    results: {
      corridor:
        docRaw.inspectResults.find((result) => result.keyword === "corridor")
          ?.result || "",
      steel_col:
        docRaw.inspectResults.find((result) => result.keyword === "steel_col")
          ?.result || "",
      col_foundation:
        docRaw.inspectResults.find((result) => result.keyword === "col_foundation")
          ?.result || "",
      structure:
        docRaw.inspectResults.find((result) => result.keyword === "structure")
          ?.result || "",
      insulate:
        docRaw.inspectResults.find((result) => result.keyword === "insulate")
          ?.result || "",
      electric_wire:
        docRaw.inspectResults.find((result) => result.keyword === "electric_wire")
          ?.result || "",
      earthing:
        docRaw.inspectResults.find((result) => result.keyword === "earthing")
          ?.result || "",
      holding_rope:
        docRaw.inspectResults.find((result) => result.keyword === "holding_rope")
          ?.result || "",
      anti_lightning:
        docRaw.inspectResults.find((result) => result.keyword === "anti_lightning")
          ?.result || "",
      anti_vibration:
        docRaw.inspectResults.find((result) => result.keyword === "anti_vibration")
          ?.result || "",
      heat_coupling:
        docRaw.inspectResults.find((result) => result.keyword === "heat_coupling")
          ?.result || "",
      processed:
        docRaw.inspectResults.find((result) => result.keyword === "processed")
          ?.result || "",
      discharge:
        docRaw.inspectResults.find((result) => result.keyword === "discharge")
          ?.result || "",
      other:
        docRaw.inspectResults.find((result) => result.keyword === "other")
          ?.result || "",
      suggest:
        docRaw.inspectResults.find((result) => result.keyword === "suggest")
          ?.result || "",
    },
  };
}

export function repairDataProcessing(docRaw: RepairDocRaw): RepairData {
  return {
    id: docRaw.id,
    code: docRaw.docNo,
    powerline: docRaw.routeCode,
    date: new Date(docRaw.dateRepair),
    workers: docRaw.repairTeams.map((userRawData) => ({
      username: userRawData.username,
      name: userRawData.name,
      position: userRawData.position,
      lvWork: userRawData.lvWork,
      lvSafe: userRawData.lvSafe,
      leader: userRawData.leader,
    })),
    approvers: docRaw.repairApprovals.map((userRawData) => ({
      username: userRawData.username,
      name: userRawData.name,
      position: userRawData.position,
      represent: userRawData.represent,
      confirm: userRawData.confirm,
    })),
    prepare: docRaw.safeMeasure,
    tasks: docRaw.tasks,
    result: docRaw.result,
    unresolved: docRaw.unresolved,
    powers: docRaw.powers,
    status: {
      1: RepairStatus.Created,
      2: RepairStatus.Confirmed,
      3: RepairStatus.Submited,
      4: RepairStatus.Approved,
      5: RepairStatus.Completed,
    }[docRaw.status],
    images: docRaw.repairImages.map((imageRaw) => ({
      id: imageRaw.visualData.id,
      name: imageRaw.visualData.image,
      path: imageRaw.visualData.path,
    })),
  };
}
