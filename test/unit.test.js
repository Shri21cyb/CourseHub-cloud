// test/unit.test.js
import { getWelcomeMessage, getPortMessage } from "../utils.js";

describe("Unit Tests", () => {
  it("returns the correct welcome message", () => {
    expect(getWelcomeMessage()).toBe("Welcome to My Shopping Cart!");
  });

  it("returns the correct port message", () => {
    expect(getPortMessage()).toBe("Server running on port ");
  });
});
