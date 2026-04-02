import { normalizeWhitespace } from "@/lib/utils";

function getEnvValue(name: string) {
  const value = process.env[name];

  if (!value) {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function getSupabasePublicEnv() {
  const url = getEnvValue("NEXT_PUBLIC_SUPABASE_URL");
  const anonKey = getEnvValue("NEXT_PUBLIC_SUPABASE_ANON_KEY");

  if (!url || !anonKey) {
    return null;
  }

  return { url, anonKey };
}

export function getSupabaseServiceEnv() {
  const publicEnv = getSupabasePublicEnv();
  const serviceRoleKey = getEnvValue("SUPABASE_SERVICE_ROLE_KEY");

  if (!publicEnv || !serviceRoleKey) {
    return null;
  }

  return { ...publicEnv, serviceRoleKey };
}

export function getAuthorizedAdminEmails() {
  const raw = getEnvValue("AUTHORIZED_ADMIN_EMAILS");

  if (!raw) {
    return [];
  }

  return raw
    .split(",")
    .map((email) => normalizeWhitespace(email).toLowerCase())
    .filter(Boolean);
}

export function hasSupabasePublicConfig() {
  return Boolean(getSupabasePublicEnv());
}

export function hasSupabaseServiceConfig() {
  return Boolean(getSupabaseServiceEnv());
}

export function getSeedExcelPath() {
  return getEnvValue("SEED_XLSX_PATH") ?? "./TRACKER CEO.xlsx";
}
