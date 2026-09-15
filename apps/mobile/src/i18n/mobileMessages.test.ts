import { describe, expect, it } from "vite-plus/test";

import { translateMobileText } from "./mobileMessages";

describe("translateMobileText", () => {
  it("translates the shared mobile labels into natural Japanese", () => {
    expect(translateMobileText("ja", "Settings")).toBe("設定");
    expect(translateMobileText("ja", "No environments connected")).toBe(
      "接続されている環境はありません",
    );
    expect(translateMobileText("ja", "No threads in T3 Code")).toBe("T3 Code にタスクはありません");
  });

  it("keeps English and unknown strings unchanged", () => {
    expect(translateMobileText("en", "Settings")).toBe("Settings");
    expect(translateMobileText("ja", "A user supplied project name")).toBe(
      "A user supplied project name",
    );
  });
});
