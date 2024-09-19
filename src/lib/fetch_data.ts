// load package
import { getCookie, deleteCookie } from "cookies-next";
// load lib
import { SE } from "@/lib/api";
import { saveToken } from "@/lib/cookie";

export async function fetchWithToken (
  pathname: string,
  data?: RequestInit | undefined | any,
  times?: number | null,
): Promise<any> {
  const tokenType = getCookie("token-type");  
  const accessToken = getCookie("access-token");
  const refreshToken = getCookie("refresh-token");
  
  if(!refreshToken) 
    return new Promise(function() {
      throw new Error("Hết phiên đăng nhập.");
    });

  return fetchData(pathname, `${tokenType} ${accessToken}`, data)
    .then(response => {
      if(response.status === 401) {

        // refresh token
        deleteCookie("access-token");
        return fetchWithBA(SE.API_REFRESHTOKEN, {
          method: "POST",
          body: JSON.stringify({ refresh_token: refreshToken }),
        }).then(newToken => {
          // save token
          saveToken(newToken);
          return fetchData(pathname, `${newToken.type} ${newToken.accessToken}`, data)
            .then(res => res.json());
        })
      } else {
        return response.json();
      }
    }).then(data => {
      if(data.error) {
        throw new Error(data.error_description);
      }
      return data;
    })
}

export async function fetchWithBA (
  pathname: string,
  data?: RequestInit | undefined | any
): Promise<any> {
  const credentialUsername = process.env.NEXT_PUBLIC_CREDENTIAL_USERNAME;
  const credentialPassword = process.env.NEXT_PUBLIC_CREDENTIAL_PASSWORD;

  const token = `Basic ${btoa(
    `${credentialUsername}:${credentialPassword}`
  )}`;
  return fetchData(pathname, token, data)
    .then(response => response.json())
    .then(data => {
      if(data.error) {
        throw new Error(data.error_description);
      }
      return data;
    });
}

function fetchData(pathname: string, token: string, data?: RequestInit | undefined | any) {
  const method = data?.method || "GET";
  let headers: { [key: string]: string } = {
    Authorization: token,
    cache: "no-store",
  };

  if (data?.headers?.["Content-Type"] !== null) {
    headers = {
      ...headers,
      "Content-Type": data?.headers?.["Content-Type"] || "application/json",
    };
  }

  return fetch(`${process.env.NEXT_PUBLIC_API_URL}/${pathname}`, {
    ...data,
    method,
    headers,
  })
  .then((response) => {
    if(response.status === 500)
      throw new Error("Mất kết nối server.");

    return response;
  });
}