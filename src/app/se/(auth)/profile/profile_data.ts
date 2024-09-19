// load config
import { Gender } from "@/enum/gender";

export type ProfileRawData = {
  data: {
    user: {
      id: number;
      username: string;
      name: string;
      phone: string;
      email: string;
      role: {
        id: number;
        name: string;
      };
      activity: boolean;
      avatar?: string;
      signature?: string;
      gender: 1 | 2;
      department: string;
      position: string;
      lvWork: 1 | 2 | 3 | 4 | 5 | 6 | 7;
      lvSafe: 1 | 2 | 3 | 4 | 5;
      language?: string;
    };
  };
  message: string;
};

export type ProfileData = {
  id: number;
  username: string;
  displayName: string;
  phone: string;
  email: string;
  gender?: Gender;
  role: string;
  activity: boolean;
  department: string;
  position: string;
  workLevel: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  safeLevel: 1 | 2 | 3 | 4 | 5;
  avatar?: string;
  signature?: string;
  groups?: string;
};