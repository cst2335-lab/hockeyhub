#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

function loadEnvFromDotLocal() {
  const envPath = resolve(process.cwd(), '.env.local');
  if (!existsSync(envPath)) return;
  const text = readFileSync(envPath, 'utf8');
  for (const line of text.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx < 0) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const rawVal = trimmed.slice(eqIdx + 1).trim();
    if (!key || process.env[key]) continue;
    const unquoted =
      (rawVal.startsWith('"') && rawVal.endsWith('"')) ||
      (rawVal.startsWith("'") && rawVal.endsWith("'"))
        ? rawVal.slice(1, -1)
        : rawVal;
    process.env[key] = unquoted;
  }
}

function usage() {
  console.log('Usage: npm run db:mark-top20-images -- [--apply]');
  console.log('  default: dry-run only');
  console.log('  --apply: update selected rows with image_verified=true');
}

async function main() {
  loadEnvFromDotLocal();
  const args = new Set(process.argv.slice(2));
  if (args.has('--help') || args.has('-h')) {
    usage();
    return;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_KEY.');
    process.exitCode = 1;
    return;
  }

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: sampleRows, error: sampleError } = await supabase
    .from('rinks')
    .select('*')
    .limit(1);
  if (sampleError) {
    console.error('Failed to read rinks table:', sampleError.message);
    process.exitCode = 1;
    return;
  }
  const sample = sampleRows?.[0] ?? {};
  const hasImageUrl = Object.prototype.hasOwnProperty.call(sample, 'image_url');
  const hasImageVerified = Object.prototype.hasOwnProperty.call(sample, 'image_verified');
  if (!hasImageUrl || !hasImageVerified) {
    console.warn('rinks.image_url and/or rinks.image_verified is missing in current schema.');
    console.warn('Run docs/SQL_RINK_IMAGE_COLUMNS.sql first, then re-run this script.');
    return;
  }

  const { data, error } = await supabase
    .from('rinks')
    .select('id, name, image_url, image_verified, source, data_source')
    .not('image_url', 'is', null)
    .neq('image_url', '')
    .order('name', { ascending: true })
    .limit(20);

  if (error) {
    console.error('Failed to fetch candidates:', error.message);
    process.exitCode = 1;
    return;
  }

  const candidates = data ?? [];
  if (candidates.length === 0) {
    console.log('No rink records with image_url found.');
    return;
  }

  console.log(`Selected ${candidates.length} candidate rows (dry-run preview):`);
  for (const row of candidates) {
    console.log(
      `${row.id} | ${row.name} | verified=${Boolean(row.image_verified)} | source=${row.source ?? row.data_source ?? 'n/a'}`
    );
  }

  if (!args.has('--apply')) {
    console.log('\nDry-run complete. Re-run with --apply to update image_verified=true.');
    return;
  }

  const ids = candidates.map((row) => row.id);
  const { error: updateError } = await supabase
    .from('rinks')
    .update({ image_verified: true })
    .in('id', ids);

  if (updateError) {
    console.error('Failed to update image_verified:', updateError.message);
    process.exitCode = 1;
    return;
  }

  console.log(`Updated ${ids.length} rows: image_verified=true`);
}

main().catch((err) => {
  console.error('Unexpected error:', err);
  process.exitCode = 1;
});
