import assert from "node:assert";
import test from "node:test";

import {normalizePlatform} from "./psn-titles-trophy-sets.js";

test("prefers PS5 when present", () => {
    assert.strictEqual(normalizePlatform("PS4,PS5"), "PS5");
});

test("returns explicit PS4 platform", () => {
    assert.strictEqual(normalizePlatform("PS4"), "PS4");
});

test("falls back to the original string when unknown", () => {
    assert.strictEqual(normalizePlatform("PSVITA"), "PSVITA");
});
