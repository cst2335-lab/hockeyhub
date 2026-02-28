import fs from 'fs';
import path from 'path';

const sqlPath = path.join(process.cwd(), 'scripts', 'rinks_rows.sql');
let sql = fs.readFileSync(sqlPath, 'utf8');

// Replace search_vector values with NULL (tsvector escaping causes SQL errors).
// Preserve external_id and external_source. After import run:
// UPDATE rinks SET search_vector = setweight(to_tsvector('english', coalesce(name,'') || ' ' || coalesce(address,'')), 'A');
// .*? matches until ', '3741', or ', null, - use [\s\S] to include newlines
sql = sql.replace(/, null, null, '[\s\S]*?', ((?:'\d+'|null)), ((?:'[^']*'|null)), /g, ', null, null, NULL, $1, $2, ');

fs.writeFileSync(sqlPath, sql);
console.log('Replaced search_vector with NULL. Run UPDATE after import to regenerate.');
