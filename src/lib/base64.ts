export function decodeStr(string: string): string {
  try {
    return decodeURIComponent(
      Array.prototype.map
        .call(atob(string), function (c) {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join("")
    );
  } catch (exp) {
    return "";
  }
}