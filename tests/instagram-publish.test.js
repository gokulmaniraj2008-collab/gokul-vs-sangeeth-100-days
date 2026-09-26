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
