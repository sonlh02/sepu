// load package
import { NextRequest, NextResponse } from 'next/server';
// load lib
import { Nav } from "@/lib/nav";
import { SE } from "@/lib/api";
import { fetchWithBA } from "@/lib/fetch_data";
import { decodeToken } from "@/lib/token";
 
export async function middleware(request: NextRequest) {
  const accessToken = request.cookies.get("access-token")?.value || null;
  const refreshToken = request.cookies.get("refresh-token")?.value || null;
  let menuItems = request.cookies.get("menu")?.value || null;

  if(!accessToken) {
    if(refreshToken) {
      return await fetchWithBA(SE.API_REFRESHTOKEN, {
        method: "POST",
        body: JSON.stringify({ refresh_token: refreshToken }),
      })
        .then((data) => {
          const tokenData: any = decodeToken(data.accessToken);
          const refreshData: any = decodeToken(data.refreshToken);
          const menus = tokenData.info.menu.split(",") || [];

          let response = NextResponse.next();
          if(request.nextUrl.pathname === Nav.HOME_PAGE || request.nextUrl.pathname === Nav.LOGIN_PAGE) {
            if ((menus.length == 1 && menus[0] == "FULL") || menus.includes("powl-map")) {
              response = NextResponse.redirect(new URL(Nav.SUPERVISE_PAGE, request.url));
            } else {
              response = NextResponse.redirect(new URL(Nav.MYTASK_PAGE, request.url));
            }
          }

          const tokenTime = tokenData.exp*1000;
          const refreshTime = refreshData.exp*1000;
          response.cookies.set("token-type", data.type, { expires: new Date(refreshTime) });
          response.cookies.set("refresh-token", data.refreshToken, { expires: new Date(refreshTime) });

          response.cookies.set("access-token", data.accessToken, { expires: new Date(tokenTime) });
          
          response.cookies.set("username", tokenData.info.username, { expires: new Date(refreshTime) });
          response.cookies.set("name", tokenData.info.name, { expires: new Date(refreshTime) });
          response.cookies.set("avatar", tokenData.info.avatar || "", { expires: new Date(refreshTime) });
          response.cookies.set("menu", tokenData.info.menu, { expires: new Date(refreshTime) });
          return response;
        })
        .catch((e: Error) => {
          const response = NextResponse.redirect(new URL(Nav.LOGIN_PAGE, request.url));
          response.cookies.set("token-type", "", { expires: new Date().getTime()-1 });
          response.cookies.set("access-token", "", { expires: new Date().getTime()-1 });
          response.cookies.set("refresh-token", "", { expires: new Date().getTime()-1 });
          return response;
        });
    } else {
      if(request.nextUrl.pathname !== Nav.LOGIN_PAGE)
        return NextResponse.redirect(new URL(Nav.LOGIN_PAGE, request.url));
      return NextResponse.next();
    }
  } else {
    if(request.nextUrl.pathname === Nav.HOME_PAGE || request.nextUrl.pathname === Nav.LOGIN_PAGE) {
      const menus = menuItems?.split(",") || [];
      if ((menus.length == 1 && menus[0] == "FULL") || menus.includes("powl-map")) {
        return NextResponse.redirect(new URL(Nav.SUPERVISE_PAGE, request.url))
      } else {
        return NextResponse.redirect(new URL(Nav.MYTASK_PAGE, request.url))
      }
    }
    return NextResponse.next();
  }
}
 
export const config = {
  matcher: [
    '/',
    '/se/:path*',
    '/public/:path*',
  ]
}