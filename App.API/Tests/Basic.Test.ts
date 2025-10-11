import request from "supertest";
import { beforeAll, afterAll, describe, test, expect } from "@jest/globals";

import app from "../Server/index";
import { AppDataSource, connectDB } from "../Server/Database";

beforeAll(async () => {
  await connectDB();
});
afterAll(async () => AppDataSource?.close());

describe("API tests", () => {
  // The most basic test
  test("API should return a 200 status", (done) => {
    request(app)
      .get("/api/users/testme")
      .then((response) => {
        expect(response.statusCode).toBe(200);
        expect(response.body.success).toBe(true);
        done();
      });
  });
});
