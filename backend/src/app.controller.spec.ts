import { describe, expect, it, beforeEach } from "bun:test";
import { AppController } from "./app.controller";

describe("AppController", () => {
  let controller: AppController;

  beforeEach(() => {
    controller = new AppController();
  });

  describe("getHealth", () => {
    it("should return operational ok status object", () => {
      const result = controller.getHealth();
      expect(result).toEqual({ status: "ok" });
    });
  });
});
