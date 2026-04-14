import { describe, expect, it } from "vitest";

import { createApiHealthState } from "~/utils/apiHealth";

describe("apiHealth helpers", () => {
  it("creates a predictable empty state", () => {
    expect(createApiHealthState()).toEqual({
      checked: false,
      ok: null,
    });
  });
});

