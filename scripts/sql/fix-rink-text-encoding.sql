-- Fix rink name/address text that stored Unicode replacement (U+FFFD / chr(65533))
-- after bad CSV/SQL encoding during import. Only verified Ottawa/Gatineau French forms.
-- Safe to re-run (idempotent UPDATEs).
--
-- Affected (16 rows at time of write):
--   8x Ar�na * names (+ mirrored address)
--   1x Bernard Grandma�tre Arena
--   7x Outdoor Rink addresses (beauséjour, vérendrye, michèle, cécile, orléans, émerillon, pères-blancs)

BEGIN;

UPDATE public.rinks
SET
  name = replace(name, 'Ar' || chr(65533) || 'na', 'Aréna'),
  address = replace(address, 'Ar' || chr(65533) || 'na', 'Aréna')
WHERE position(('Ar' || chr(65533) || 'na') in name) > 0
   OR position(('Ar' || chr(65533) || 'na') in coalesce(address, '')) > 0;

UPDATE public.rinks
SET
  name = replace(name, 'Grandma' || chr(65533) || 'tre', 'Grandmaître'),
  address = replace(address, 'Grandma' || chr(65533) || 'tre', 'Grandmaître')
WHERE position(('Grandma' || chr(65533) || 'tre') in name) > 0
   OR position(('Grandma' || chr(65533) || 'tre') in coalesce(address, '')) > 0;

UPDATE public.rinks SET address = replace(address, 'beaus' || chr(65533) || 'jour', 'beauséjour')
WHERE position(('beaus' || chr(65533) || 'jour') in coalesce(address, '')) > 0;

UPDATE public.rinks SET address = replace(address, 'v' || chr(65533) || 'rendrye', 'vérendrye')
WHERE position(('v' || chr(65533) || 'rendrye') in coalesce(address, '')) > 0;

UPDATE public.rinks SET address = replace(address, 'mich' || chr(65533) || 'le', 'michèle')
WHERE position(('mich' || chr(65533) || 'le') in coalesce(address, '')) > 0;

UPDATE public.rinks SET address = replace(address, 'c' || chr(65533) || 'cile', 'cécile')
WHERE position(('c' || chr(65533) || 'cile') in coalesce(address, '')) > 0;

UPDATE public.rinks SET address = replace(address, 'orl' || chr(65533) || 'ans', 'orléans')
WHERE position(('orl' || chr(65533) || 'ans') in coalesce(address, '')) > 0;

UPDATE public.rinks SET address = replace(address, chr(65533) || 'merillon', 'émerillon')
WHERE position((chr(65533) || 'merillon') in coalesce(address, '')) > 0;

UPDATE public.rinks SET address = replace(address, 'p' || chr(65533) || 'res-blancs', 'pères-blancs')
WHERE position(('p' || chr(65533) || 'res-blancs') in coalesce(address, '')) > 0;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'rinks' AND column_name = 'search_vector'
  ) THEN
    UPDATE public.rinks
    SET search_vector = setweight(
      to_tsvector('english', coalesce(name, '') || ' ' || coalesce(address, '')),
      'A'
    )
    WHERE name ILIKE 'Aréna%'
       OR name ILIKE '%Grandmaître%'
       OR address ILIKE '%beauséjour%'
       OR address ILIKE '%vérendrye%'
       OR address ILIKE '%michèle%'
       OR address ILIKE '%cécile%'
       OR address ILIKE '%orléans%'
       OR address ILIKE '%émerillon%'
       OR address ILIKE '%pères-blancs%';
  END IF;
END $$;

COMMIT;
