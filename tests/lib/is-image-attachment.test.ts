import { describe, it, expect } from "vitest";
import { isImageAttachment } from "@/lib/is-image-attachment";

describe("isImageAttachment", () => {
  it.each(["jpg", "jpeg", "png", "gif", "webp", "svg"])(
    "returns true for .%s",
    (ext) => expect(isImageAttachment(`photo.${ext}`)).toBe(true),
  );

  it("is case-insensitive", () => {
    expect(isImageAttachment("photo.JPG")).toBe(true);
    expect(isImageAttachment("photo.PNG")).toBe(true);
    expect(isImageAttachment("photo.JPEG")).toBe(true);
  });

  it("returns false for document types", () => {
    expect(isImageAttachment("report.pdf")).toBe(false);
    expect(isImageAttachment("notes.docx")).toBe(false);
    expect(isImageAttachment("data.xlsx")).toBe(false);
  });

  it("returns false for a file with no extension", () => {
    expect(isImageAttachment("Makefile")).toBe(false);
  });

  it("returns false for an empty string", () => {
    expect(isImageAttachment("")).toBe(false);
  });

  it("handles filenames with multiple dots correctly", () => {
    expect(isImageAttachment("my.holiday.photo.jpg")).toBe(true);
    expect(isImageAttachment("archive.tar.gz")).toBe(false);
  });

  it("returns false for extensions that partially match", () => {
    expect(isImageAttachment("file.jpgg")).toBe(false);
    expect(isImageAttachment("file.pngg")).toBe(false);
  });
});
