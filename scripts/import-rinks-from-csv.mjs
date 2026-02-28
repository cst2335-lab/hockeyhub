#!/usr/bin/env node
/**
 * Import/update rinks from CSV via Supabase API (no SQL — avoids escaping issues).
 *
 * Merges:
 * - rinks_rows.csv (our full list, ~740 rows including outdoor)
 * - rinks_rows (1).csv (colleague's data with phone, booking_url — ~58 indoor arenas)
 *
 * Usage:
 *   node scripts/import-rinks-from-csv.mjs [--apply] [--truncate]
 *   --apply: actually upsert; default is dry-run
 *   --truncate: TRUNCATE rinks CASCADE before import (⚠️ deletes bookings)
 */
import { createClient } from '@supabase/supabase-js';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

function loadEnv() {
  const envPath = resolve(process.cwd(), '.env.local');
  if (!existsSync(envPath)) return;
  for (const line of readFileSync(envPath, 'utf8').split('\n')) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const eq = t.indexOf('=');
    if (eq < 0) continue;
    const k = t.slice(0, eq).trim();
    if (!process.env[k]) process.env[k] = t.slice(eq + 1).trim().replace(/^["']|["']$/g, '');
  }
}

function parseCSV(text) {
  const rows = [];
  let cur = [], inQ = false, cell = '';
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === '"') {
      if (inQ && text[i + 1] === '"') { cell += '"'; i++; continue; }
      inQ = !inQ;
      continue;
    }
    if (inQ) { cell += c; continue; }
    if (c === ',') { cur.push(cell); cell = ''; continue; }
    if (c === '\n' || c === '\r') {
      cur.push(cell); cell = '';
      if (cur.some(x => x !== undefined)) rows.push(cur);
      cur = [];
      if (c === '\r' && text[i + 1] === '\n') i++;
      continue;
    }
    cell += c;
  }
  if (cell !== '' || cur.length) { cur.push(cell); rows.push(cur); }
  return rows;
}

function rowsToObjects(headers, rows) {
  return rows.map(r => {
    const o = {};
    headers.forEach((h, i) => { o[h] = r[i] ?? ''; });
    return o;
  });
}

const OUR_COLS = 'id,name,address,city,postal_code,phone,email,hourly_rate,availability_hours,booking_url,amenities,source,manager_id,custom_info,last_synced,peak_hours,created_at,image_url,type,status,submitted_by,ice_condition,last_condition_update,search_vector,external_id,external_source,latitude,longitude,verified,last_synced_at'.split(',');
// Only include columns that exist in the project's rinks table (omit columns not in schema)
const SKIP_COLS = new Set(['external_id', 'external_source', 'latitude', 'longitude', 'search_vector', 'ice_condition', 'last_condition_update', 'submitted_by', 'type', 'status', 'verified']);
const COLS_FOR_UPSERT = OUR_COLS.filter(c => !SKIP_COLS.has(c));

function parseAmenities(v) {
  if (!v || v === '') return null;
  try {
    const s = String(v).replace(/""/g, '"');
    const arr = JSON.parse(s);
    return Array.isArray(arr) ? arr : null;
  } catch { return null; }
}

function toDbRow(row, colleagueById) {
  const id = row.id?.trim();
  if (!id) return null;
  const fromColleague = colleagueById.get(id) || {};
  const merged = { ...row };
  if (fromColleague.phone) merged.phone = fromColleague.phone;
  if (fromColleague.booking_url) merged.booking_url = fromColleague.booking_url;
  if (fromColleague.hourly_rate) merged.hourly_rate = fromColleague.hourly_rate;
  if (fromColleague.availability_hours) merged.availability_hours = fromColleague.availability_hours;
  if (fromColleague.amenities) merged.amenities = fromColleague.amenities;

  const out = {};
  for (const k of COLS_FOR_UPSERT) {
    let v = merged[k];
    if (v === '' || v === undefined || v === null) { out[k] = null; continue; }
    if (k === 'hourly_rate') { out[k] = parseFloat(v) || 0; continue; }
    if (k === 'amenities') { out[k] = parseAmenities(v); continue; }
    if (['verified', 'image_verified'].includes(k)) { out[k] = String(v).toLowerCase() === 'true'; continue; }
    out[k] = String(v).trim();
  }
  return out;
}

async function main() {
  loadEnv();
  const args = new Set(process.argv.slice(2));
  const apply = args.has('--apply');
  const truncate = args.has('--truncate');

  const desktop = process.platform === 'win32'
    ? resolve(process.env.USERPROFILE || '', 'Desktop')
    : resolve(process.env.HOME || '', 'Desktop');
  const ourPath = existsSync(resolve(process.cwd(), 'scripts', 'rinks_rows.csv'))
    ? resolve(process.cwd(), 'scripts', 'rinks_rows.csv')
    : resolve(desktop, 'rinks_rows.csv');
  const colleaguePath = existsSync(resolve(process.cwd(), 'scripts', 'rinks_rows_colleague.csv'))
    ? resolve(process.cwd(), 'scripts', 'rinks_rows_colleague.csv')
    : resolve(desktop, 'rinks_rows (1).csv');

  if (!existsSync(ourPath)) {
    console.error('Missing rinks_rows.csv. Place on Desktop or in scripts/');
    process.exit(1);
  }

  const ourRaw = parseCSV(readFileSync(ourPath, 'utf8'));
  const ourHeaders = ourRaw[0] || OUR_COLS;
  const ourRows = rowsToObjects(ourHeaders, ourRaw.slice(1));
  console.log(`Read ${ourRows.length} rows from ${ourPath}`);

  let colleagueById = new Map();
  if (existsSync(colleaguePath)) {
    const colRaw = parseCSV(readFileSync(colleaguePath, 'utf8'));
    const colHeaders = colRaw[0] || [];
    rowsToObjects(colHeaders, colRaw.slice(1)).forEach(r => {
      if (r.id) colleagueById.set(String(r.id).trim(), r);
    });
    console.log(`Loaded ${colleagueById.size} colleague rows for merge.`);
  } else {
    console.log('No scripts/rinks_rows_colleague.csv — using our CSV only.');
  }

  const dbRows = ourRows.map(r => toDbRow(r, colleagueById)).filter(Boolean);
  console.log(`Prepared ${dbRows.length} rows for upsert.`);

  if (!apply) {
    console.log('Dry-run. Use --apply to upsert.');
    return;
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_KEY.');
    process.exit(1);
  }

  const supabase = createClient(url, key, { auth: { persistSession: false } });

  if (truncate) {
    console.log('Run in Supabase SQL Editor first: TRUNCATE rinks CASCADE;');
    console.log('Then re-run this script without --truncate, or use --apply only if table is empty.');
  }

  const BATCH = 50;
  let ok = 0, err = 0;
  for (let i = 0; i < dbRows.length; i += BATCH) {
    const batch = dbRows.slice(i, i + BATCH);
    const { error } = await supabase.from('rinks').upsert(batch, { onConflict: 'id' });
    if (error) {
      console.error(`Batch ${i / BATCH + 1} error:`, error.message);
      err += batch.length;
    } else {
      ok += batch.length;
    }
  }
  console.log(`Done. Upserted: ${ok}, errors: ${err}`);

  if (ok > 0) {
    console.log('Regenerate search_vector:');
    console.log("  UPDATE rinks SET search_vector = setweight(to_tsvector('english', coalesce(name,'') || ' ' || coalesce(address,'')), 'A') WHERE search_vector IS NULL;");
  }
}

main().catch(e => { console.error(e); process.exit(1); });
