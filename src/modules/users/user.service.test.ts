import { jest, describe, it, expect } from "@jest/globals";

const findUniqueMock = jest.fn<(args: unknown) => Promise<unknown>>();
const upsertMock = jest.fn<(args: unknown) => Promise<unknown>>();
const updateManyMock = jest.fn<(args: unknown) => Promise<{ count: number }>>();
const findUniqueOrThrowMock = jest.fn<(args: unknown) => Promise<unknown>>();

jest.unstable_mockModule("../../config/database", () => ({
  prisma: {
    profile: {
      findUnique: findUniqueMock,
      upsert: upsertMock,
      updateMany: updateManyMock,
      findUniqueOrThrow: findUniqueOrThrowMock,
    },
  },
}));

jest.unstable_mockModule("../../config/env", () => ({
  env: { SUPABASE_URL: "https://proj.supabase.co/" },
}));

const { isOwnAvatarUrl, upsertUserProfile, updateUserProfile } = await import(
  "./user.service"
);

const USER = "11111111-1111-1111-1111-111111111111";
const OTHER = "22222222-2222-2222-2222-222222222222";
const BASE = "https://proj.supabase.co/storage/v1/object/public/finchoApp/avatars/";
const OWN_URL = `${BASE}${USER}/1790445752380.jpg`;

describe("isOwnAvatarUrl", () => {
  it("accepts a file in the user's own avatars folder", () => {
    expect(isOwnAvatarUrl(OWN_URL, USER)).toBe(true);
  });

  it.each([
    ["another domain", "https://example.com/a.jpg"],
    ["another bucket", `https://proj.supabase.co/storage/v1/object/public/otro/avatars/${USER}/a.jpg`],
    ["another folder", `https://proj.supabase.co/storage/v1/object/public/finchoApp/recibos/${USER}/a.jpg`],
    ["another user's folder", `${BASE}${OTHER}/a.jpg`],
    ["a userId prefix of another", `${BASE}${USER}0/a.jpg`],
    ["a nested path", `${BASE}${USER}/x/a.jpg`],
    ["path traversal", `${BASE}${USER}/../${OTHER}/a.jpg`],
    ["encoded traversal", `${BASE}${USER}/%2e%2e/a.jpg`],
    ["a query string", `${OWN_URL}?download=1`],
    ["a fragment", `${OWN_URL}#x`],
    ["a non-jpg file", `${BASE}${USER}/a.png`],
  ])("rejects %s", (_case, url) => {
    expect(isOwnAvatarUrl(url, USER)).toBe(false);
  });
});

describe("profile writes validate avatarUrl", () => {
  it("upsert saves an own avatarUrl", async () => {
    findUniqueMock.mockResolvedValue(null);
    upsertMock.mockResolvedValue({ id: USER, avatarUrl: OWN_URL });

    await upsertUserProfile(USER, { avatarUrl: OWN_URL });

    expect(upsertMock).toHaveBeenCalledWith(
      expect.objectContaining({
        create: expect.objectContaining({ avatarUrl: OWN_URL }),
      }),
    );
  });

  it("update saves an own avatarUrl", async () => {
    updateManyMock.mockResolvedValue({ count: 1 });
    findUniqueOrThrowMock.mockResolvedValue({ id: USER, avatarUrl: OWN_URL });

    await updateUserProfile(USER, { avatarUrl: OWN_URL });

    expect(updateManyMock).toHaveBeenCalledWith(
      expect.objectContaining({ data: { avatarUrl: OWN_URL } }),
    );
  });

  it("upsert rejects an external URL with 400 and writes nothing", async () => {
    findUniqueMock.mockResolvedValue(null);

    await expect(
      upsertUserProfile(USER, { avatarUrl: "https://example.com/a.jpg" }),
    ).rejects.toMatchObject({ statusCode: 400 });
    expect(upsertMock).not.toHaveBeenCalled();
  });

  it("update rejects another user's folder with 400 and writes nothing", async () => {
    await expect(
      updateUserProfile(USER, { avatarUrl: `${BASE}${OTHER}/a.jpg` }),
    ).rejects.toMatchObject({ statusCode: 400 });
    expect(updateManyMock).not.toHaveBeenCalled();
  });

  it("update without avatarUrl is not affected", async () => {
    updateManyMock.mockResolvedValue({ count: 1 });
    findUniqueOrThrowMock.mockResolvedValue({ id: USER });

    await updateUserProfile(USER, { fullName: "Seba" });

    expect(updateManyMock).toHaveBeenCalledWith(
      expect.objectContaining({ data: { fullName: "Seba" } }),
    );
  });
});

describe("avatarUrl: null removes the photo (HU-03)", () => {
  it("PATCH schema accepts null and rejects an invalid URL", async () => {
    const { updateProfileSchema } = await import("./users.schema");

    expect(updateProfileSchema.parse({ avatarUrl: null })).toEqual({ avatarUrl: null });
    expect(() => updateProfileSchema.parse({ avatarUrl: "no-es-url" })).toThrow();
  });

  it("update saves avatarUrl = null", async () => {
    updateManyMock.mockResolvedValue({ count: 1 });
    findUniqueOrThrowMock.mockResolvedValue({ id: USER, avatarUrl: null });

    await updateUserProfile(USER, { avatarUrl: null });

    expect(updateManyMock).toHaveBeenCalledWith(
      expect.objectContaining({ data: { avatarUrl: null } }),
    );
  });
});
