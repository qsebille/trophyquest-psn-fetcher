import assert from "node:assert";
import test from "node:test";

import {buildInsertPlaceholders} from "./postgres-utils.js";

test("builds placeholders for the first row", () => {
    const placeholders = buildInsertPlaceholders(["id", "name"], 0);

    assert.strictEqual(placeholders, "($1, $2)");
});

test("builds placeholders with the proper offset", () => {
    const placeholders = buildInsertPlaceholders(["first", "second", "third"], 2);

    assert.strictEqual(placeholders, "($7, $8, $9)");
});
