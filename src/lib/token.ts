// load lib
import { decodeStr } from "@/lib/base64";

export function decodeToken(token: string): [] {
  const payload = token.split(".")[1] || "";
  try {
    return JSON.parse(decodeStr(payload)); 
  } catch(exp) {
    return [];
  }
}