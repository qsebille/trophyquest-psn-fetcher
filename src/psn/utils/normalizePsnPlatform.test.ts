import test from "node:test";
import assert from "node:assert";
import {normalizePsnPlatform} from "./normalizePsnPlatform.js";

test("prefers PS5 when present", () => {
    assert.strictEqual(normalizePsnPlatform("PS4,PS5"), "PS5");
});

test("returns explicit PS4 platform", () => {
    assert.strictEqual(normalizePsnPlatform("PS4"), "PS4");
});

test("falls back to the original string when unknown", () => {
    assert.strictEqual(normalizePsnPlatform("PSVITA"), "PSVITA");
});
