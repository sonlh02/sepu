// load config
import { RepairStatus } from "@/enum/doc_status";

export type RepairData = {
  id: number;
  powerline: {
    id: number;
    name: string;
    code: string;
  };
  code: string;
  date: Date;
  prepare?: string;
  tasks: string;
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
    workLevel: 1 | 2 | 3 | 4 | 5 | 6 | 7;
    safeLevel: 1 | 2 | 3 | 4 | 5;
    signature?: string;
  }>;
  powers: Array<string>;
  status: RepairStatus;
  result?: string;
  unresolved?: string;
  images: Array<string>;
};
