import { timingSafeEqual } from "node:crypto";

const GRAPH_VERSION = process.env.INSTAGRAM_GRAPH_VERSION || "v23.0";

function json(res, status, body) {
  res.status(status).setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(body));
}

async function graphPost(path, params, token) {
  const url = new URL(`https://graph.facebook.com/${GRAPH_VERSION}/${path}`);
  for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value);
  url.searchParams.set("access_token", token);
  const response = await fetch(url, { method: "POST" });
  const data = await response.json();
  if (!response.ok || data.error) {
    throw new Error(`Instagram API request failed (${response.status}): ${data.error?.message || "unknown error"}`);
  }
  return data;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return json(res, 405, { error: "Method not allowed" });
  }

  const expected = process.env.AGENT_CRON_SECRET;
  const authorization = req.headers.authorization;
  const match = typeof authorization === "string"
    ? authorization.match(/^Bearer\\s+(.+)$/i)
    : null;
  const supplied = match?.[1];
  const expectedBytes = expected ? Buffer.from(expected, "utf8") : null;
  const suppliedBytes = supplied ? Buffer.from(supplied, "utf8") : null;
  const authorized = Boolean(
    expectedBytes &&
    suppliedBytes &&
    expectedBytes.length === suppliedBytes.length &&
    timingSafeEqual(expectedBytes, suppliedBytes)
  );

  if (!authorized) {
    return json(res, 401, { error: "Unauthorized" });
  }

  if (process.env.IG_AUTO_PUBLISH !== "true") {
    return json(res, 409, { error: "Auto-publishing is disabled. Set IG_AUTO_PUBLISH=true after validating credentials and content." });
  }

  const igUserId = process.env.IG_USER_ID;
  const token = process.env.IG_ACCESS_TOKEN;
  const imageUrl = process.env.IG_PUBLIC_IMAGE_URL;
  if (!igUserId || !token || !imageUrl) {
    return json(res, 503, { error: "Missing server-side Instagram configuration." });
  }

  try {
    const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
    const caption = (process.env.IG_DEFAULT_CAPTION || "Day-by-day progress with GKFXL ⚡").trim() + `\n\nDay update • ${today}\n#GKFXL #100DaysOfBuilding`;
    const container = await graphPost(`${igUserId}/media`, {
      image_url: imageUrl,
      caption
    }, token);
    if (!container.id) throw new Error("Instagram did not return a media container ID.");

    const published = await graphPost(`${igUserId}/media_publish`, {
      creation_id: container.id
    }, token);
    if (!published.id) throw new Error("Instagram did not return a published media ID.");

    return json(res, 200, { ok: true, published: true, mediaId: published.id, date: today });
  } catch (error) {
    // Avoid logging tokens, request URLs, or API response payloads.
    console.error("Instagram publishing failed:", error.message);
    return json(res, 502, { error: "Instagram publishing failed. Check server logs for the redacted error message." });
  }
}
