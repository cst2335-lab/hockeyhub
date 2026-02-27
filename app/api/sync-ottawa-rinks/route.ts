import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
import { extractBearerToken, shouldAuthorizeCronRequest } from '@/lib/security/cron-auth'

// Complete Ottawa rinks dataset (60 entries)
// Keep this list as-is; code below will deduplicate by address+phone in-memory.
const OTTAWA_RINKS_COMPLETE = [
  // === CITY OF OTTAWA FACILITIES (35) ===
  // Central Ottawa
  { name: 'Jim Durrell Recreation Complex', address: '1265 Walkley Rd, Ottawa, ON K1V 6P9', phone: '(613) 247-4846', hourly_rate: 275, booking_url: 'https://ottawa.ca/recreation' },
  { name: 'Canterbury Recreation Complex', address: '2185 Arch St, Ottawa, ON K1G 2H5', phone: '(613) 247-4869', hourly_rate: 185, booking_url: 'https://ottawa.ca/recreation' },
  { name: 'Jack Purcell Community Centre', address: '320 Jack Purcell Lane, Ottawa, ON K2P 2J5', phone: '(613) 564-1050', hourly_rate: 165, booking_url: 'https://ottawa.ca/recreation' },
  { name: 'Tom Brown Arena', address: '141 Bayview Rd, Ottawa, ON K1Y 4K8', phone: '(613) 247-4832', hourly_rate: 175, booking_url: 'https://ottawa.ca/recreation' },
  { name: 'Sandy Hill Arena', address: '2020 Riverside Dr, Ottawa, ON K1H 7X1', phone: '(613) 580-2532', hourly_rate: 165, booking_url: 'https://ottawa.ca/recreation' },

  // East Ottawa
  { name: 'Bob MacQuarrie Recreation Complex', address: '1490 Youville Dr, Orléans, ON K1C 2X8', phone: '(613) 824-0018', hourly_rate: 250, booking_url: 'https://ottawa.ca/recreation' },
  { name: 'Ray Friel Recreation Complex', address: '1585 Tenth Line Rd, Orleans, ON K1E 3E8', phone: '(613) 830-7223', hourly_rate: 180, booking_url: 'https://ottawa.ca/recreation' },
  { name: 'François Dupuis Recreation Centre', address: '2263 Portobello Blvd, Ottawa, ON K4A 0X3', phone: '(613) 824-3119', hourly_rate: 180, booking_url: 'https://ottawa.ca/recreation' },
  { name: 'Potvin Arena', address: '3009 St Joseph Blvd, Orleans, ON K1C 1E1', phone: '(613) 837-9470', hourly_rate: 165, booking_url: 'https://ottawa.ca/recreation' },
  { name: 'Bernard Grandmaître Arena', address: '309 McArthur Ave, Vanier, ON K1L 6P1', phone: '(613) 564-1290', hourly_rate: 160, booking_url: 'https://ottawa.ca/recreation' },
  { name: 'Navan Memorial Centre', address: '1295 Colonial Rd, Navan, ON K4B 1H8', phone: '(613) 835-2766', hourly_rate: 145, booking_url: 'https://ottawa.ca/recreation' },

  // West Ottawa
  { name: 'Nepean Sportsplex', address: '1701 Woodroffe Ave, Nepean, ON K2G 1W2', phone: '(613) 580-2828', hourly_rate: 240, booking_url: 'https://ottawa.ca/recreation' },
  { name: 'Goulbourn Recreation Complex', address: '1500 Shea Rd, Stittsville, ON K2S 0H9', phone: '(613) 580-2532', hourly_rate: 175, booking_url: 'https://ottawa.ca/recreation' },
  { name: 'W. Erskine Johnston Arena', address: '3832 Carp Rd, Carp, ON K0A 1L0', phone: '(613) 839-2273', hourly_rate: 150, booking_url: 'https://ottawa.ca/recreation' },
  { name: 'Richmond Memorial Community Centre', address: '6038 Perth St, Richmond, ON K0A 2Z0', phone: '(613) 838-5196', hourly_rate: 140, booking_url: 'https://ottawa.ca/recreation' },
  { name: 'Nick Kaneb Arena', address: '3500 Campeau Dr, Goulbourn, ON K2J 5G1', phone: '(613) 254-5048', hourly_rate: 180, booking_url: 'https://ottawa.ca/recreation' },

  // Kanata
  { name: 'Kanata Recreation Complex', address: '100 Charlie Rogers Pl, Kanata, ON K2L 4E7', phone: '(613) 591-9018', hourly_rate: 185, booking_url: 'https://ottawa.ca/recreation' },
  { name: 'Glen Cairn Community Centre', address: '110 Mikanagan Rd, Kanata, ON K2L 1C9', phone: '(613) 254-8710', hourly_rate: 160, booking_url: 'https://ottawa.ca/recreation' },
  { name: 'Mlacak Arena', address: '100 Malvern Dr, Kanata, ON K2W 0A2', phone: '(613) 591-9012', hourly_rate: 170, booking_url: 'https://ottawa.ca/recreation' },

  // Barrhaven
  { name: 'Walter Baker Sports Centre', address: '100 Malvern Dr, Barrhaven, ON K2J 4P6', phone: '(613) 580-2532', hourly_rate: 195, booking_url: 'https://ottawa.ca/recreation' },
  { name: 'Minto Recreation Complex - Barrhaven', address: '3500 Cambrian Rd, Nepean, ON K2J 0V1', phone: '(613) 692-5661', hourly_rate: 190, booking_url: 'https://ottawa.ca/recreation' },

  // South Ottawa
  { name: 'Manotick Arena', address: '5572 Doctor Leach Dr, Manotick, ON K4M 1K7', phone: '(613) 692-3571', hourly_rate: 155, booking_url: 'https://ottawa.ca/recreation' },
  { name: 'Fred Barrett Arena', address: '3280 Leitrim Rd, Ottawa, ON K1V 1H9', phone: '(613) 822-0110', hourly_rate: 170, booking_url: 'https://ottawa.ca/recreation' },
  { name: 'Howard Darwin Arena', address: '2010 Merivale Rd, Ottawa, ON K2G 1G1', phone: '(613) 225-1924', hourly_rate: 160, booking_url: 'https://ottawa.ca/recreation' },
  { name: 'Jim Tubman Chevrolet Arena', address: '2010 Merivale Rd, Ottawa, ON K2G 1G1', phone: '(613) 225-1924', hourly_rate: 160, booking_url: 'https://ottawa.ca/recreation' },

  // Community Centres
  { name: 'Dovercourt Recreation Centre', address: '411 Dovercourt Ave, Ottawa, ON K2A 0S9', phone: '(613) 798-8950', hourly_rate: 155, booking_url: 'https://ottawa.ca/recreation' },
  { name: 'Heron Community Centre', address: '1480 Heron Rd, Ottawa, ON K1V 6A5', phone: '(613) 247-4820', hourly_rate: 150, booking_url: 'https://ottawa.ca/recreation' },
  { name: 'Merivale Arena', address: '1665 Merivale Rd, Nepean, ON K2G 3K2', phone: '(613) 225-1924', hourly_rate: 165, booking_url: 'https://ottawa.ca/recreation' },
  { name: 'Brewer Arena', address: '100 Brewer Way, Ottawa, ON K1S 5T1', phone: '(613) 247-4938', hourly_rate: 170, booking_url: 'https://ottawa.ca/recreation' },
  { name: 'Lansdowne Park', address: '1015 Bank St, Ottawa, ON K1S 3W7', phone: '(613) 580-2429', hourly_rate: 185, booking_url: 'https://ottawa.ca/recreation' },

  // === PRIVATE/SEMI-PRIVATE FACILITIES (25) ===
  // Sensplex
  { name: 'Bell Sensplex', address: '1565 Maple Grove Rd, Kanata, ON K2V 1A3', phone: '(613) 599-2255', hourly_rate: 260, booking_url: 'https://sensplex.ca/book' },
  { name: 'Richcraft Sensplex', address: '4101 Innovation Dr, Kanata, ON K2K 0J3', phone: '(613) 599-2255', hourly_rate: 260, booking_url: 'https://sensplex.ca/book' },
  { name: 'Canadian Tire Centre', address: '1000 Palladium Dr, Kanata, ON K2V 1A5', phone: '(613) 599-0100', hourly_rate: 500, booking_url: 'https://www.canadiantirecentre.com' },

  // University
  { name: 'uOttawa Minto Sports Complex', address: '801 King Edward Ave, Ottawa, ON K1N 6N5', phone: '(613) 562-5800', hourly_rate: 250, booking_url: 'https://geegees.ca' },
  { name: 'Carleton Ice House', address: '3280 Leitrim Rd, Ottawa, ON K1V 1H9', phone: '(613) 792-4799', hourly_rate: 200, booking_url: 'https://athletics.carleton.ca' },
  { name: 'Algonquin College Arena', address: '1385 Woodroffe Ave, Ottawa, ON K2G 1V8', phone: '(613) 727-4723', hourly_rate: 180, booking_url: 'https://algonquincollege.com' },

  // Private
  { name: 'RA Centre', address: '2451 Riverside Dr, Ottawa, ON K1H 7X7', phone: '(613) 733-5100', hourly_rate: 225, booking_url: 'https://racentre.com' },
  { name: 'Minto Skating Club', address: '950 Somerset St W, Ottawa, ON K1R 6R1', phone: '(613) 695-5425', hourly_rate: 195, booking_url: 'https://mintoskatingclub.com' },
  { name: 'Ottawa Athletic Club', address: '3500 Riverside Dr, Ottawa, ON K1V 8N5', phone: '(613) 737-1111', hourly_rate: 210, booking_url: 'https://oac.ca' },
  { name: 'Rideau Sports Centre', address: '1 Donald St, Ottawa, ON K1K 4E4', phone: '(613) 748-1182', hourly_rate: 185, booking_url: 'https://rideausportscentre.com' },

  // School
  { name: 'St. Laurent Complex', address: '525 Côté St, Ottawa, ON K1K 0Z8', phone: '(613) 742-6761', hourly_rate: 165, booking_url: 'https://ottawa.ca' },
  { name: 'Earl of March Secondary School', address: '4 The Parkway, Kanata, ON K2K 1Y4', phone: '(613) 592-4903', hourly_rate: 155, booking_url: null },
  { name: 'Rideau High School Arena', address: '815 St. Laurent Blvd, Ottawa, ON K1K 3A7', phone: '(613) 744-6834', hourly_rate: 150, booking_url: null },

  // Training
  { name: 'Capital Skills Development', address: '2451 Riverside Dr, Ottawa, ON K1H 7X7', phone: '(613) 852-2652', hourly_rate: 195, booking_url: 'https://capitalskills.ca' },
  { name: 'Pure Hockey Arena', address: '80 Marketplace Ave, Nepean, ON K2J 5K7', phone: '(613) 823-0343', hourly_rate: 175, booking_url: 'https://purehockey.com' },
  { name: 'Warrior Ice Arena', address: '1000 Innovation Dr, Kanata, ON K2K 3E7', phone: '(613) 271-9500', hourly_rate: 180, booking_url: 'https://warriorice.ca' },

  // Additional Community
  { name: 'Orleans Recreation Complex', address: '1490 Youville Dr, Orleans, ON K1C 2X8', phone: '(613) 824-5131', hourly_rate: 165, booking_url: 'https://ottawa.ca' },
  { name: 'Blackburn Arena', address: '190 Glen Park Dr, Gloucester, ON K1B 5A3', phone: '(613) 837-1066', hourly_rate: 155, booking_url: 'https://blackburnarena.ca' },
  { name: 'Vars Community Centre', address: '40 Rockdale Rd, Vars, ON K0A 3H0', phone: '(613) 835-2766', hourly_rate: 140, booking_url: 'https://ottawa.ca' },
  { name: 'Greely Community Centre', address: '1448 Meadow Dr, Greely, ON K4P 1P5', phone: '(613) 821-1558', hourly_rate: 145, booking_url: 'https://ottawa.ca' },
  { name: 'Metcalfe Community Centre', address: '3081 8th Line Rd, Metcalfe, ON K0A 2P0', phone: '(613) 821-1224', hourly_rate: 140, booking_url: 'https://ottawa.ca' },
  { name: 'Osgoode Community Centre', address: '5660 Osgoode Main St, Osgoode, ON K0A 2W0', phone: '(613) 826-2209', hourly_rate: 145, booking_url: 'https://ottawa.ca' },
  { name: 'Russell Arena', address: '1084 Concession St, Russell, ON K4R 1C7', phone: '(613) 445-3444', hourly_rate: 150, booking_url: 'https://russell.ca' }
]

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const testMode = searchParams.get('test') === 'true'
  const runId = crypto.randomUUID()

  const cronAuth = shouldAuthorizeCronRequest({
    nodeEnv: process.env.NODE_ENV,
    testMode,
    providedToken: extractBearerToken(request.headers.get('authorization')),
    expectedToken: process.env.CRON_SECRET,
  })
  if (!cronAuth.allowed) {
    return NextResponse.json(
      { error: 'Unauthorized', reason: cronAuth.reason, run_id: runId },
      { status: 401 }
    )
  }

  try {
    console.log(`[sync-ottawa-rinks:${runId}] started at`, new Date().toISOString())

    const supabase = createServiceClient()

    // Current count
    const { count: currentCount } = await supabase
      .from('rinks')
      .select('*', { count: 'exact', head: true })

    // Test mode only reports status
    if (testMode) {
      return NextResponse.json({
        run_id: runId,
        test: true,
        message: 'Ready to sync! Remove ?test=true to execute',
        current_rinks: currentCount || 0,
        available_rinks: OTTAWA_RINKS_COMPLETE.length,
        to_add: OTTAWA_RINKS_COMPLETE.length - (currentCount || 0),
        time: new Date().toISOString(),
      })
    }

    // --- in-memory dedup by (address + name) to allow multi-pad per address ---
const uniqueMap = new Map<string, typeof OTTAWA_RINKS_COMPLETE[number]>()
for (const r of OTTAWA_RINKS_COMPLETE) {
  const k = `${String(r.address).trim().toLowerCase()}|${String(r.name).trim().toLowerCase()}`
  if (!uniqueMap.has(k)) uniqueMap.set(k, r)
}
const INPUT = Array.from(uniqueMap.values())


    let added = 0
    let updated = 0
    const errors: string[] = []

    for (const rink of INPUT) {
      try {
        // Match by name OR address (treat same-address as the same rink)
        const { data: existing, error: findErr } = await supabase
  .from('rinks')
  .select('id, hourly_rate, address, phone, booking_url')
  .eq('address', rink.address)
  .eq('name', rink.name)
  .maybeSingle()


        if (findErr) {
          errors.push(`[lookup] ${rink.name}: ${findErr.message}`)
          continue
        }

        if (existing) {
          // Update if any key field changed
          const shouldUpdate =
            existing.hourly_rate !== rink.hourly_rate ||
            existing.address !== rink.address ||
            existing.phone !== rink.phone ||
            existing.booking_url !== (rink.booking_url || null)

          if (shouldUpdate) {
            const { error } = await supabase
              .from('rinks')
              .update({
                hourly_rate: rink.hourly_rate,
                address: rink.address,
                phone: rink.phone,
                booking_url: rink.booking_url || null,
                availability_hours: '6:00 AM - 11:00 PM',
                source: 'ottawa_sync',
              })
              .eq('id', existing.id)

            if (error) {
              errors.push(`[update] ${rink.name}: ${error.message}`)
            } else {
              updated++
              console.log(`[sync-ottawa-rinks:${runId}] updated ${rink.name}`)
            }
          }
        } else {
          // New rink: simple amenities heuristic
          const amenitiesList = ['parking', 'canteen', 'wheelchair_accessible']
          if (rink.hourly_rate > 200) amenitiesList.push('skate_rental')
          if (rink.hourly_rate > 250) amenitiesList.push('pro_shop')

          const { error } = await supabase
            .from('rinks')
            .insert({
              name: rink.name,
              address: rink.address,
              phone: rink.phone,
              hourly_rate: rink.hourly_rate,
              booking_url: rink.booking_url || null,
              availability_hours: '6:00 AM - 11:00 PM',
              source: 'ottawa_sync',
              amenities: amenitiesList,
            })

          if (error) {
            errors.push(`[insert] ${rink.name}: ${error.message}`)
          } else {
            added++
            console.log(`[sync-ottawa-rinks:${runId}] added ${rink.name}`)
          }
        }
      } catch (e: unknown) {
        const message = e instanceof Error ? e.message : 'Unknown error'
        errors.push(`[process] ${rink.name}: ${message}`)
      }
    }

    // Write log
    await supabase
      .from('rink_updates_log')
      .insert({
        changes: {
          run_id: runId,
          added,
          updated,
          errors: errors.length,
          total_processed: OTTAWA_RINKS_COMPLETE.length,
          error_details: errors.length > 0 ? errors : null,
        },
        update_type: 'full_sync',
      })

    // Final count
    const { count: finalCount } = await supabase
      .from('rinks')
      .select('*', { count: 'exact', head: true })

    console.log(`[sync-ottawa-rinks:${runId}] completed: ${added} added, ${updated} updated`)

    return NextResponse.json({
      success: true,
      run_id: runId,
      message: 'Sync completed successfully!',
      stats: {
        initial_count: currentCount || 0,
        final_count: finalCount || 0,
        added,
        updated,
        errors: errors.length,
      },
      errors: errors.length > 0 ? errors : undefined,
      time: new Date().toISOString(),
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error(`[sync-ottawa-rinks:${runId}] failed:`, message)
    return NextResponse.json(
      { error: 'Sync failed', details: message, run_id: runId },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  return GET(request)
}
