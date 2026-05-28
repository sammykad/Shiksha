export function getSafeAuthCallbackUrl(callbackUrl: string | undefined) {
  if (!callbackUrl) return "/dashboard";

  if (callbackUrl.startsWith("/") && !callbackUrl.startsWith("//")) {
    return callbackUrl;
  }

  try {
    const url = new URL(callbackUrl);
    return `${url.pathname}${url.search}${url.hash}` || "/dashboard";
  } catch {
    return "/dashboard";
  }
}

export function appendAuthCallbackUrl(
  url: string,
  callbackUrl: string,
  extraParams?: Record<string, string | undefined>
) {
  const [pathname, query = ""] = url.split("?");
  const params = new URLSearchParams(query);

  params.set("callbackUrl", callbackUrl);

  for (const [key, value] of Object.entries(extraParams ?? {})) {
    if (value) params.set(key, value);
  }

  return `${pathname}?${params.toString()}`;
}

export function getAbsoluteAuthCallbackUrl(callbackUrl: string) {
  if (typeof window === "undefined") return callbackUrl;
  return new URL(callbackUrl, window.location.origin).toString();
}
