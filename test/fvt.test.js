// test/fvt.test.js
import request from "supertest";
import expressApp from "../server/app.js";
import mongoose from "mongoose";

describe("Functional Verification Tests", () => {
  afterAll(async () => {
    await mongoose.connection.close();
  });

  it("returns 200 and 'API is running...' for root endpoint", async () => {
    const response = await request(expressApp).get("/");
    expect(response.status).toBe(200);
    expect(response.text).toBe("API is running...");
  });

  it("fetches public courses from /api/public/items", async () => {
    const response = await request(expressApp).get("/api/public/items");
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
  });
});
