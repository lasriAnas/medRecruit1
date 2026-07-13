export function findImageFile(files: Iterable<File>): File | undefined {
  return Array.from(files).find((f) => f.type.startsWith("image/"));
}
