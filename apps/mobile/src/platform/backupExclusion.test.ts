import { excludeDirectoryFromBackup } from "./backupExclusion";

const DIR = "/var/mobile/Containers/Data/Application/X/Documents/SQLite";

describe("excludeDirectoryFromBackup", () => {
  it("marks the database directory on iOS", () => {
    const native = { excludeDirectoryFromBackup: jest.fn(() => true) };
    expect(excludeDirectoryFromBackup(DIR, native, "ios")).toBe("excluded");
    expect(native.excludeDirectoryFromBackup).toHaveBeenCalledWith(DIR);
  });

  it("does nothing on Android, where allowBackup is off", () => {
    const native = { excludeDirectoryFromBackup: jest.fn(() => true) };
    expect(excludeDirectoryFromBackup(DIR, native, "android")).toBe("not_ios");
    expect(native.excludeDirectoryFromBackup).not.toHaveBeenCalled();
  });

  it("is harmless without the native module (Expo Go)", () => {
    expect(excludeDirectoryFromBackup(DIR, null, "ios")).toBe("unavailable");
  });

  it("never throws, so the data still opens", () => {
    const native = {
      excludeDirectoryFromBackup: jest.fn(() => {
        throw new Error("disk full");
      }),
    };
    expect(excludeDirectoryFromBackup(DIR, native, "ios")).toBe("failed");
  });
});
