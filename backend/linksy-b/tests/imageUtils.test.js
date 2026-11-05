import { describe, expect, it } from "vitest";

import { getImageExtension, validateImage } from "../src/utils/imageUtils.js";

describe("getImageExtension", () => {
  it.each([
    ["image/jpeg", "jpg"],
    ["image/png", "png"],
    ["image/webp", "webp"],
  ])("returns %s extension for a supported image MIME type", (mimeType, extension) => {
    expect(getImageExtension(mimeType)).toBe(extension);
  });

  it("returns null for an unsupported MIME type", () => {
    expect(getImageExtension("image/gif")).toBeNull();
  });
});

describe("validateImage", () => {
  it("returns the extension for a supported uploaded image", () => {
    expect(
      validateImage({ buffer: Buffer.from("image"), mimetype: "image/jpeg" }),
    ).toBe("jpg");
  });

  it.each([undefined, null, {}, { mimetype: "image/png" }, { buffer: Buffer.from("image") }])(
    "rejects a missing or incomplete upload",
    (file) => {
      expect(() => validateImage(file)).toThrow(
        expect.objectContaining({
          statusCode: 400,
          code: "INVALID_FILE_UPLOAD",
        }),
      );
    },
  );

  it("rejects unsupported image MIME types", () => {
    expect(() =>
      validateImage({ buffer: Buffer.from("image"), mimetype: "image/gif" }),
    ).toThrow(
      expect.objectContaining({
        statusCode: 400,
        code: "UNSUPPORTED_FILE_TYPE",
      }),
    );
  });
});
