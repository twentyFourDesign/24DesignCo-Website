import { api } from "@/lib/cms/http";
import { clearSession } from "@/lib/cms/auth";

export const POST = api(async () => {
  await clearSession();
  return { ok: true };
});
