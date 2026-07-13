import { describe, it, expect } from "vitest";
import { findImageFile } from "@/lib/find-image-file";

function makeFile(name: string, type: string): File {
  return new File([""], name, { type });
}

describe("findImageFile", () => {
  it("returns the first image file from a list", () => {
    const files = [makeFile("photo.png", "image/png")];
    expect(findImageFile(files)?.name).toBe("photo.png");
  });

  it("returns undefined when no files are present", () => {
    expect(findImageFile([])).toBeUndefined();
  });

  it("returns undefined when no file has an image MIME type", () => {
    const files = [
      makeFile("report.pdf", "application/pdf"),
      makeFile("notes.docx", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"),
    ];
    expect(findImageFile(files)).toBeUndefined();
  });

  it("skips non-image files and returns the first image", () => {
    const files = [
      makeFile("report.pdf", "application/pdf"),
      makeFile("screenshot.jpg", "image/jpeg"),
      makeFile("photo.png", "image/png"),
    ];
    expect(findImageFile(files)?.name).toBe("screenshot.jpg");
  });

  it("accepts all common image MIME types", () => {
    const types = ["image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml"];
    for (const type of types) {
      const files = [makeFile("img", type)];
      expect(findImageFile(files)?.type).toBe(type);
    }
  });

  it("accepts any image/* subtype", () => {
    const files = [makeFile("img.avif", "image/avif")];
    expect(findImageFile(files)?.name).toBe("img.avif");
  });
});
