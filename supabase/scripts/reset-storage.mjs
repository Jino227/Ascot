import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  for (const line of fs.readFileSync(filePath, "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (!match || process.env[match[1]]) continue;
    process.env[match[1]] = match[2].replace(/^['"]|['"]$/g, "");
  }
}

loadEnvFile(".env.local");

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceRoleKey) {
  throw new Error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY before running this script.");
}

const supabase = createClient(url, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function listFiles(bucket, path = "") {
  const { data, error } = await supabase.storage.from(bucket).list(path, {
    limit: 1000,
    offset: 0,
    sortBy: { column: "name", order: "asc" },
  });

  if (error) throw new Error(`${bucket}/${path}: ${error.message}`);

  const files = [];
  for (const entry of data ?? []) {
    const entryPath = path ? `${path}/${entry.name}` : entry.name;
    if (entry.id === null) files.push(...await listFiles(bucket, entryPath));
    else files.push(entryPath);
  }
  return files;
}

async function removeBucketFiles(bucket) {
  const files = await listFiles(bucket);
  for (let index = 0; index < files.length; index += 100) {
    const batch = files.slice(index, index + 100);
    const { error } = await supabase.storage.from(bucket).remove(batch);
    if (error) throw new Error(`${bucket}: ${error.message}`);
  }
  console.log(`${bucket}: removed ${files.length} file(s)`);
}

for (const bucket of ["collections", "media"]) {
  await removeBucketFiles(bucket);
}

console.log("Storage reset complete.");
