import http from "k6/http";
import { check, group, sleep } from "k6";
import { Rate, Trend, Counter } from "k6/metrics";

const forbiddenRate = new Rate("forbidden_rate");
const guardLatency = new Trend("guard_latency_ms", true);
const s200 = new Counter("status_200");
const s403 = new Counter("status_403");
const sOther = new Counter("status_other");

const BASE = __ENV.BASE_URL || "http://127.0.0.1:3000";

const CREDENTIALS = {
  admin: { email: "bob@test.com", password: "secret123" },
  editor: { email: "charlie@test.com", password: "secret123" },
  viewer: { email: "dana@test.com", password: "secret123" },
};

export const options = {
  summaryTrendStats: ["avg", "min", "med", "max", "p(90)", "p(95)", "p(99)"],
  scenarios: {
    stress: {
      executor: "ramping-vus",
      startVUs: 0,
      stages: [
        { duration: "10s", target: 50 },
        { duration: "30s", target: 150 },
        { duration: "10s", target: 0 },
      ],
      tags: { scenario: "stress" },
    },
    constant_load: {
      executor: "constant-arrival-rate",
      rate: 100,
      timeUnit: "1s",
      duration: "50s",
      preAllocatedVUs: 30,
      maxVUs: 80,
      tags: { scenario: "constant" },
    },
  },
  thresholds: {
    guard_latency_ms: ["p(99)<1000"],
    forbidden_rate: ["rate<0.01"],
    http_req_failed: ["rate<0.01"],
    http_req_duration: ["p(95)<2000"],
    "http_req_duration{scenario:stress}": ["p(95)<2000"],
    "http_req_duration{scenario:constant}": ["p(95)<1500"],
  },
};

export function setup() {
  const tokens = {};

  for (const [role, creds] of Object.entries(CREDENTIALS)) {
    const res = http.post(`${BASE}/auth/login`, JSON.stringify(creds), {
      headers: { "Content-Type": "application/json" },
    });

    if (res.status !== 200) {
      throw new Error(`Login failed for ${role}: ${res.status} ${res.body}`);
    }

    tokens[role] = res.json("access_token");
    console.log(`token obtained for ${role}`);
  }

  const res = http.post(
    `${BASE}/elements`,
    JSON.stringify({ name: "Fixture k6", description: "seed CI" }),
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${tokens.admin}`,
      },
    },
  );

  if (res.status !== 201) {
    throw new Error(`setup failed creating fixture: ${res.status} ${res.body}`);
  }

  const fixtureId = res.json("id");
  console.log(`fixture created: ${fixtureId}`);
  return { tokens, fixtureId };
}

export default function (data) {
  const { tokens, fixtureId } = data;
  const roles = ["admin", "editor", "viewer"];
  const role = roles[Math.floor(Math.random() * roles.length)];

  const headers = {
    Authorization: `Bearer ${tokens[role]}`,
    "Content-Type": "application/json",
  };

  const CASES = [
    {
      method: "GET",
      path: `/elements/${fixtureId}`,
      expect: { admin: 200, editor: 200, viewer: 200 },
    },
    {
      method: "PATCH",
      path: `/elements/${fixtureId}`,
      body: JSON.stringify({ name: "Updated by k6" }),
      expect: { admin: 200, editor: 200, viewer: 403 },
    },
  ];

  const cas = CASES[Math.floor(Math.random() * CASES.length)];
  const expectedStatus = cas.expect[role];

  group(`${cas.method} as ${role}`, () => {
    const start = Date.now();
    const res = http.request(cas.method, `${BASE}${cas.path}`, cas.body ?? null, {
      headers,
      responseCallback: http.expectedStatuses(200, 201, 403),
    });
    guardLatency.add(Date.now() - start);

    if (res.status === 200) s200.add(1);
    else if (res.status === 403) s403.add(1);
    else sOther.add(1);

    if (res.status !== expectedStatus) {
      console.warn(`FALLO: ${role} ${cas.method} → ${res.status} | ${res.error}`);
    }

    check(res, {
      [`${role} → ${expectedStatus}`]: (r) => r.status === expectedStatus,
      "no network error": (r) => r.status !== 0,
      "no privilege escalation": (r) =>
        !(role === "viewer" && cas.method !== "GET" && r.status !== 403),
    });

    if (expectedStatus === 403) {
      forbiddenRate.add(res.status !== 403);
    } else {
      forbiddenRate.add(res.status === 403);
    }
  });

  sleep(0.2);
}

export function teardown(data) {
  const res = http.del(`${BASE}/elements/${data.fixtureId}`, null, {
    headers: {
      Authorization: `Bearer ${data.tokens.admin}`,
      "Content-Type": "application/json",
    },
  });
  console.log(`fixture deleted — status: ${res.status}`);
}

export function handleSummary(data) {
  const forbidden = data.metrics.forbidden_rate?.values;
  const latencyP99 = data.metrics.guard_latency_ms?.values?.["p(99)"] ?? 0;
  const latencyP95 = data.metrics.guard_latency_ms?.values?.["p(95)"] ?? 0;
  const latencyAvg = data.metrics.guard_latency_ms?.values?.["avg"] ?? 0;
  const totalReqs = data.metrics.http_reqs?.values?.count ?? 0;
  const failRate = data.metrics.http_req_failed?.values?.rate ?? 0;
  const correctness = forbidden ? ((1 - forbidden.rate) * 100).toFixed(2) : "N/A";
  const n200 = data.metrics.status_200?.values?.count ?? 0;
  const n403 = data.metrics.status_403?.values?.count ?? 0;
  const nOther = data.metrics.status_other?.values?.count ?? 0;

  return {
    stdout: `
╔══════════════════════════════════════════╗
║          RBAC Stress Test Summary        ║
╠══════════════════════════════════════════╣
║  Guard correctness : ${String(correctness + "%").padEnd(20)}║
║  Guard avg latency : ${String(latencyAvg.toFixed(2) + "ms").padEnd(20)}║
║  Guard p95 latency : ${String(latencyP95.toFixed(2) + "ms").padEnd(20)}║
║  Guard p99 latency : ${String(latencyP99.toFixed(2) + "ms").padEnd(20)}║
║  Total requests    : ${String(totalReqs).padEnd(20)}║
║  HTTP fail rate    : ${String((failRate * 100).toFixed(2) + "%").padEnd(20)}║
╠══════════════════════════════════════════╣
║  200 OK             : ${String(n200).padEnd(20)}║
║  403 Forbidden      : ${String(n403).padEnd(20)}║
║  Other (unexpected) : ${String(nOther).padEnd(20)}║
╚══════════════════════════════════════════╝
    `,
  };
}
