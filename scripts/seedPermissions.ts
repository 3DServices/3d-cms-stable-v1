/**
 * scripts/seedPermissions.ts — Push the permission catalog to the backend.
 *
 * Reads every permission from `src/auth/permissionCatalog.ts`, fetches the
 * existing permissions from the API, and creates any that are missing.
 *
 * Usage:
 *   npx ts-node --esm scripts/seedPermissions.ts
 *
 * Environment:
 *   VITE_API_BASE_URL — backend base URL (default: http://localhost:5000)
 *   SEED_ACCOUNT_ROOT — account_root to own the permissions (default: "engine")
 *   SEED_CREATED_BY   — actor UID for audit trail (default: "system")
 *   SEED_AUTH_TOKEN    — JWT access token for an admin session
 *
 * The script is idempotent — running it multiple times will not create
 * duplicates because it skips any permission_name the backend already has.
 */

import {
  PERMISSION_CATALOG,
  type CatalogModuleName,
} from "../src/auth/permissionCatalog";

// ── Config ──────────────────────────────────────────────────────────────────

const API_BASE =
  process.env.VITE_API_BASE_URL || "http://localhost:5000";
const ACCOUNT_ROOT = process.env.SEED_ACCOUNT_ROOT || "engine";
const CREATED_BY = process.env.SEED_CREATED_BY || "system";
const AUTH_TOKEN = process.env.SEED_AUTH_TOKEN || "";

if (!AUTH_TOKEN) {
  console.error(
    "ERROR: SEED_AUTH_TOKEN is required. Pass a valid admin JWT.\n" +
      "  SEED_AUTH_TOKEN=<token> npx ts-node --esm scripts/seedPermissions.ts",
  );
  process.exit(1);
}

// ── Helpers ─────────────────────────────────────────────────────────────────

async function apiFetch<T>(
  path: string,
  opts: RequestInit = {},
): Promise<T> {
  const url = `${API_BASE}${path}`;
  const res = await fetch(url, {
    ...opts,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${AUTH_TOKEN}`,
      ...(opts.headers as Record<string, string>),
    },
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`${res.status} ${res.statusText} — ${url}\n${body}`);
  }
  return res.json() as Promise<T>;
}

interface ExistingPermission {
  permission_uid: string;
  permission_name: string;
  permission_module: string;
}

// ── Main ────────────────────────────────────────────────────────────────────

async function main() {
  console.log(`\n🔑 NAVAS Permission Seed Script`);
  console.log(`   API: ${API_BASE}`);
  console.log(`   Account root: ${ACCOUNT_ROOT}`);
  console.log(`   Created by: ${CREATED_BY}\n`);

  // 1. Fetch existing permissions
  console.log("Fetching existing permissions...");
  const existingRes = await apiFetch<{
    status: string;
    data: ExistingPermission[];
  }>(`/rbac/permissions?account_root=${ACCOUNT_ROOT}`);

  const existingNames = new Set(
    (existingRes.data ?? []).map((p) => p.permission_name),
  );
  console.log(`  Found ${existingNames.size} existing permissions.\n`);

  // 2. Build the full list from the catalog
  const entries = (
    Object.entries(PERMISSION_CATALOG) as [CatalogModuleName, readonly string[]][]
  ).flatMap(([moduleName, perms]) =>
    perms.map((permName) => ({
      permission_name: permName,
      permission_description: permName
        .replace(/^can_/, "")
        .replace(/_/g, " "),
      permission_module: moduleName,
      account_root: ACCOUNT_ROOT,
      created_by: CREATED_BY,
    })),
  );

  const toCreate = entries.filter(
    (e) => !existingNames.has(e.permission_name),
  );

  console.log(
    `  Catalog has ${entries.length} permissions total.` +
      ` ${toCreate.length} new, ${entries.length - toCreate.length} already exist.\n`,
  );

  if (toCreate.length === 0) {
    console.log("Nothing to seed — all permissions already exist.");
    return;
  }

  // 3. Create missing permissions (sequential to avoid overwhelming the API)
  let created = 0;
  let failed = 0;
  const errors: { name: string; error: string }[] = [];

  for (const entry of toCreate) {
    try {
      await apiFetch<{ status: string }>("/rbac/permissions/create", {
        method: "POST",
        body: JSON.stringify({ data: entry }),
      });
      created++;
      if (created % 25 === 0) {
        console.log(`  ... created ${created}/${toCreate.length}`);
      }
    } catch (err) {
      failed++;
      const msg = err instanceof Error ? err.message : String(err);
      errors.push({ name: entry.permission_name, error: msg });
    }
  }

  // 4. Summary
  console.log(`\n--- Seed Complete ---`);
  console.log(`  Created: ${created}`);
  console.log(`  Skipped (existing): ${entries.length - toCreate.length}`);
  console.log(`  Failed:  ${failed}`);

  if (errors.length > 0) {
    console.log(`\nFailed permissions:`);
    for (const e of errors) {
      console.log(`  ${e.name}: ${e.error}`);
    }
    process.exit(1);
  }

  console.log(`\nAll ${created} new permissions seeded successfully.`);
}

main().catch((err) => {
  console.error("\nFatal error:", err);
  process.exit(1);
});
