import test from "node:test";
import assert from "node:assert/strict";
import handler from "../api/instagram-publish.js";

function responseRecorder() {
  return {
    statusCode: 200,
    headers: {},
    body: undefined,
    status(code) { this.statusCode = code; return this; },
    setHeader(name, value) { this.headers[name] = value; return this; },
    end(body) { this.body = body; },
    json() { return JSON.parse(this.body); }
  };
}

const originalEnv = { ...process.env };
const originalFetch = globalThis.fetch;

function setEnv(values) {
  for (const key of [
    "AGENT_CRON_SECRET", "IG_AUTO_PUBLISH", "IG_USER_ID",
    "IG_ACCESS_TOKEN", "IG_PUBLIC_IMAGE_URL", "IG_DEFAULT_CAPTION"
  ]) delete process.env[key];
  Object.assign(process.env, values);
}

test.afterEach(() => {
  for (const key of [
    "AGENT_CRON_SECRET", "IG_AUTO_PUBLISH", "IG_USER_ID",
    "IG_ACCESS_TOKEN", "IG_PUBLIC_IMAGE_URL", "IG_DEFAULT_CAPTION"
  ]) {
    if (originalEnv[key] === undefined) delete process.env[key];
    else process.env[key] = originalEnv[key];
  }
  globalThis.fetch = originalFetch;
});

test("rejects requests without valid bearer authentication", async () => {
  setEnv({ AGENT_CRON_SECRET: "secret-value", IG_AUTO_PUBLISH: "true" });
  const res = responseRecorder();
  await handler({ method: "POST", headers: {} }, res);
  assert.equal(res.statusCode, 401);
  assert.deepEqual(res.json(), { error: "Unauthorized" });
});

test("rejects non-POST requests", async () => {
  setEnv({});
  const res = responseRecorder();
  await handler({ method: "GET", headers: {} }, res);
  assert.equal(res.statusCode, 405);
  assert.equal(res.headers.Allow, "POST");
});

test("does not call Instagram when auto-publishing is disabled", async () => {
  setEnv({ AGENT_CRON_SECRET: "secret-value", IG_AUTO_PUBLISH: "false" });
  globalThis.fetch = async () => { throw new Error("fetch should not be called"); };
  const res = responseRecorder();
  await handler({ method: "POST", headers: { authorization: "Bearer secret-value" } }, res);
  assert.equal(res.statusCode, 409);
  assert.match(res.json().error, /disabled/i);
});

test("skips publishing when today's marker is in recent media", async () => {
  setEnv({
    AGENT_CRON_SECRET: "secret-value",
    IG_AUTO_PUBLISH: "true",
    IG_USER_ID: "test-user",
    IG_ACCESS_TOKEN: "test-token",
    IG_PUBLIC_IMAGE_URL: "https://example.com/test.jpg"
  });
  let calls = 0;
  globalThis.fetch = async (input, options) => {
    calls += 1;
    assert.equal(options?.method, undefined);
    const url = new URL(input);
    assert.match(url.pathname, /test-user\/media$/);
    return {
      ok: true,
      status: 200,
      async json() {
        const today = new Intl.DateTimeFormat("en-CA", {
          timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit", day: "2-digit"
        }).format(new Date());
        return { data: [{ id: "existing-post", caption: `Daily progress\nDay update • ${today}` }] };
      }
    };
  };
  const res = responseRecorder();
  await handler({ method: "POST", headers: { authorization: "Bearer secret-value" } }, res);
  assert.equal(res.statusCode, 200);
  assert.equal(res.json().skipped, true);
  assert.equal(res.json().published, false);
  assert.equal(calls, 1);
});


test("returns 503 when required Instagram configuration is missing", async () => {
  setEnv({ AGENT_CRON_SECRET: "secret-value", IG_AUTO_PUBLISH: "true" });
  globalThis.fetch = async () => { throw new Error("fetch should not be called"); };
  const res = responseRecorder();
  await handler({ method: "POST", headers: { authorization: "Bearer secret-value" } }, res);
  assert.equal(res.statusCode, 503);
  assert.match(res.json().error, /configuration/i);
});

test("publishes through mocked Graph API calls when no duplicate exists", async () => {
  setEnv({
    AGENT_CRON_SECRET: "secret-value",
    IG_AUTO_PUBLISH: "true",
    IG_USER_ID: "test-user",
    IG_ACCESS_TOKEN: "test-token",
    IG_PUBLIC_IMAGE_URL: "https://example.com/test.jpg",
    IG_DEFAULT_CAPTION: "Test progress"
  });
  const calls = [];
  globalThis.fetch = async (input, options) => {
    const url = new URL(input);
    calls.push({ url, method: options?.method });
    if (url.pathname.endsWith("/test-user/media") && !options?.method) {
      return { ok: true, status: 200, async json() { return { data: [] }; } };
    }
    if (url.pathname.endsWith("/test-user/media") && options?.method === "POST") {
      assert.equal(url.searchParams.get("image_url"), "https://example.com/test.jpg");
      assert.match(url.searchParams.get("caption"), /Day update • \d{4}-\d{2}-\d{2}/);
      return { ok: true, status: 200, async json() { return { id: "container-123" }; } };
    }
    if (url.pathname.endsWith("/test-user/media_publish")) {
      assert.equal(url.searchParams.get("creation_id"), "container-123");
      return { ok: true, status: 200, async json() { return { id: "published-456" }; } };
    }
    throw new Error("Unexpected mocked Graph API request");
  };
  const res = responseRecorder();
  await handler({ method: "POST", headers: { authorization: "Bearer secret-value" } }, res);
  assert.equal(res.statusCode, 200);
  assert.equal(res.json().published, true);
  assert.equal(res.json().mediaId, "published-456");
  assert.equal(calls.length, 3);
});

test("returns a generic 502 when Instagram API fails", async () => {
  setEnv({
    AGENT_CRON_SECRET: "secret-value",
    IG_AUTO_PUBLISH: "true",
    IG_USER_ID: "test-user",
    IG_ACCESS_TOKEN: "test-token",
    IG_PUBLIC_IMAGE_URL: "https://example.com/test.jpg"
  });
  globalThis.fetch = async () => ({
    ok: false,
    status: 500,
    async json() { return { error: { message: "mock failure" } }; }
  });
  const res = responseRecorder();
  await handler({ method: "POST", headers: { authorization: "Bearer secret-value" } }, res);
  assert.equal(res.statusCode, 502);
  assert.match(res.json().error, /publishing failed/i);
  assert.doesNotMatch(JSON.stringify(res.json()), /mock failure|test-token/);
});
