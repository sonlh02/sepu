// load package
import { setCookie, getCookie } from "cookies-next";
// load lib
import { decodeToken } from "@/lib/token";

export function saveToken (data: { type: string, accessToken: string, refreshToken: string }): void {

  const refreshData: any = decodeToken(data.refreshToken);
  const refreshTime = refreshData.exp*1000;
  setCookie("token-type", data.type, { expires: new Date(refreshTime) });
  setCookie("refresh-token", data.refreshToken, { expires: new Date(refreshTime) });

  const tokenData: any = decodeToken(data.accessToken);
  const tokenTime = tokenData.exp*1000;
  setCookie("access-token", data.accessToken, { expires: new Date(tokenTime) });
  
  setCookie("username", tokenData.info.username, { expires: new Date(refreshTime) });
  setCookie("name", tokenData.info.name, { expires: new Date(refreshTime) });
  setCookie("avatar", tokenData.info.avatar || "", { expires: new Date(refreshTime) });
  setCookie("menu", tokenData.info.menu, { expires: new Date(refreshTime) });
}