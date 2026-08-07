import assert from "node:assert/strict";
import { type AddressInfo } from "node:net";
import test from "node:test";
import { createApp } from "../src/app";

test("GET /api/health returns the service status", async (t) => {
  const server = createApp().listen(0);

  t.after(
    () =>
      new Promise<void>((resolve, reject) => {
        server.close((error) => (error ? reject(error) : resolve()));
      }),
  );

  const address = server.address();
  if (!address || typeof address === "string") {
    throw new Error("No se pudo obtener el puerto del servidor de prueba");
  }

  const response = await fetch(
    `http://127.0.0.1:${(address as AddressInfo).port}/api/health`,
  );

  assert.equal(response.status, 200);
  const body = await response.json();
  assert.equal(body.status, "ok");
  assert.equal(typeof body.timestamp, "string");
});
