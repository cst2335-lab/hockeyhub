import { createClient } from '@/lib/supabase/client'
import { NextResponse } from 'next/server'

// Static Ottawa rinks data (fallback)
const OTTAWA_RINKS_STATIC = [
  { name: 'Bell Sensplex', address: '1565 Maple Grove Rd, Kanata, ON K2V 1A3', phone: '(613) 599-5353' },
  { name: 'Richcraft Sensplex', address: '4101 Innovation Dr, Kanata, ON K2K 0J3', phone: '(613) 599-7246' },
  { name: 'Jim Durrell Recreation Centre', address: '1265 Walkley Rd, Ottawa, ON K1V 6P9', phone: '(613) 247-4846' },
  { name: 'Bob MacQuarrie Recreation Complex', address: '1490 Youville Dr, Orleans, ON K1C 2X8', phone: '(613) 824-0819' },
  { name: 'Nepean Sportsplex', address: '1701 Woodroffe Ave, Nepean, ON K2G 1W2', phone: '(613) 580-2828' },
  { name: 'Tom Brown Arena', address: '141 Bayview Rd, Ottawa, ON K1Y 4K7', phone: '(613) 247-4850' },
  { name: 'Sandy Hill Arena', address: '22 Somerset St E, Ottawa, ON K1N 6V4', phone: '(613) 564-1287' },
  { name: 'Manotick Arena', address: '5572 Doctor Leach Dr, Manotick, ON K4M 1K6', phone: '(613) 692-4675' },
  { name: 'TD Place Arena', address: '1015 Bank St, Ottawa, ON K1S 3W7', phone: '(613) 232-6767' },
  { name: 'Canadian Tire Centre', address: '1000 Palladium Dr, Kanata, ON K2V 1A5', phone: '(613) 599-0100' },
  { name: 'Minto Recreation Complex - Barrhaven', address: '3500 Cambrian Rd, Nepean, ON K2J 0V1', phone: '(613) 580-2532' },
  { name: 'Walter Baker Sports Centre', address: '100 Malvern Dr, Barrhaven, ON K2J 4S1', phone: '(613) 580-2532' },
  { name: 'Francois Dupuis Recreation Centre', address: '2263 Portobello Blvd, Orleans, ON K4A 0X3', phone: '(613) 824-8508' },
  { name: 'Ray Friel Recreation Complex', address: '1585 Tenth Line Rd, Orleans, ON K1E 3E8', phone: '(613) 748-4222' },
  { name: 'Potvin Arena', address: '10 Hamlet Rd, Gloucester, ON K1J 6X1', phone: '(613) 748-4230' },
  { name: 'Fred Barrett Arena', address: '3280 Leitrim Rd, Gloucester, ON K1V 1H9', phone: '(613) 822-1761' },
  { name: 'Earl Armstrong Arena', address: '2020 Ogilvy Rd, Gloucester, ON K1J 7N9', phone: '(613) 748-4226' },
  { name: 'Bernard Grandmaître Arena', address: '2750 Innes Rd, Gloucester, ON K1B 3J7', phone: '(613) 748-4224' },
  { name: 'Johnny Leroux Stittsville Community Arena', address: '10 Warner-Colpitts Lane, Stittsville, ON K2S 2H3', phone: '(613) 836-3001' },
  { name: 'W. Erskine Johnston Arena', address: '3532 Carp Rd, Carp, ON K0A 1L0', phone: '(613) 839-3267' },
  { name: 'Richmond Memorial Community Centre', address: '6038 Perth St, Richmond, ON K0A 2Z0', phone: '(613) 838-4600' },
  { name: 'Osgoode Community Centre', address: '5660 Osgoode Main St, Osgoode, ON K0A 2W0', phone: '(613) 826-2360' },
  { name: 'Metcalfe Community Centre', address: '2579 Victoria St, Metcalfe, ON K0A 2P0', phone: '(613) 821-1943' },
  { name: 'Navan Memorial Centre', address: '1295 Colonial Rd, Navan, ON K4B 1N1', phone: '(613) 835-2766' }
]

export async function GET(request: Request) {
  try {
    // Check authorization
    const { searchParams } = new URL(request.url)
    const testMode = searchParams.get('test') === 'true'
    
    if (!testMode && process.env.NODE_ENV === 'production') {
      const authHeader = request.headers.get('authorization')
      if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
    }

    console.log('Starting Ottawa rinks sync at:', new Date().toISOString())
    const supabase = createClient()
    
    let newCount = 0
    let updateCount = 0
    let errorCount = 0
    const results: any[] = []

    // Try to fetch from Ottawa Open Data API
    let rinkData: any[] = []
    
    try {
      console.log('Fetching from Ottawa Open Data API...')
      
      // Using ArcGIS REST API
      const apiUrl = 'https://maps.ottawa.ca/arcgis/rest/services/Recreation_Culture_OSM/MapServer/1/query?' +
        new URLSearchParams({
          where: "CATEGORY LIKE '%Arena%' OR FACILITY_TYPE LIKE '%Arena%'",
          outFields: '*',
          f: 'json',
          returnGeometry: 'false'
        })

      const response = await fetch(apiUrl)
      
      if (response.ok) {
        const data = await response.json()
        
        if (data.features && data.features.length > 0) {
          console.log(`Found ${data.features.length} facilities from API`)
          
          // Convert API data format
          rinkData = data.features.map((feature: any) => {
            const attr = feature.attributes || feature.properties || {}
            return {
              name: attr.NAME_EN || attr.NAME || attr.FACILITY_NAME || null,
              address: attr.ADDRESS || attr.LOCATION || null,
              phone: attr.PHONE || attr.PHONE_NUMBER || null,
              hourly_rate: 180, // Default rate
              source: 'ottawa_api',
              last_synced: new Date().toISOString()
            }
          }).filter((rink: any) => rink.name) // Filter out records without names
        }
      }
    } catch (apiError) {
      console.error('Error fetching from Ottawa API:', apiError)
    }

    // Use static data if API returns nothing
    if (rinkData.length === 0) {
      console.log('Using static rink data as fallback')
      rinkData = OTTAWA_RINKS_STATIC.map(rink => ({
        ...rink,
        hourly_rate: 180,
        source: 'static_data',
        last_synced: new Date().toISOString()
      }))
    }

    // Process each rink
    for (const rink of rinkData) {
      try {
        // Check if already exists
        const { data: existing } = await supabase
          .from('rinks')
          .select('id, source, address, phone')
          .eq('name', rink.name)
          .single()

        if (!existing) {
          // Insert new rink
          const { error } = await supabase
            .from('rinks')
            .insert({
              name: rink.name,
              address: rink.address || 'Address not available',
              phone: rink.phone || 'Phone not available',
              hourly_rate: rink.hourly_rate,
              source: rink.source,
              last_synced: rink.last_synced
            })

          if (error) {
            console.error(`Error inserting rink ${rink.name}:`, error)
            errorCount++
          } else {
            newCount++
            results.push({ action: 'inserted', name: rink.name })
          }
        } else if (existing.source === 'ottawa_api' || existing.source === 'static_data') {
          // Only update API-sourced data, don't overwrite manager updates
          const { error } = await supabase
            .from('rinks')
            .update({
              address: rink.address || existing.address,
              phone: rink.phone || existing.phone,
              last_synced: rink.last_synced
            })
            .eq('id', existing.id)

          if (error) {
            console.error(`Error updating rink ${rink.name}:`, error)
            errorCount++
          } else {
            updateCount++
            results.push({ action: 'updated', name: rink.name })
          }
        } else {
          results.push({ action: 'skipped', name: rink.name, reason: 'manager_updated' })
        }
      } catch (error) {
        console.error(`Error processing rink ${rink.name}:`, error)
        errorCount++
      }
    }

    // Log the sync operation
    try {
      await supabase
        .from('rink_updates_log')
        .insert({
          changes: {
            new_rinks: newCount,
            updated_rinks: updateCount,
            errors: errorCount,
            total_processed: rinkData.length,
            details: results,
            timestamp: new Date().toISOString()
          },
          update_type: 'api_sync'
        })
    } catch (logError) {
      console.error('Error logging sync:', logError)
    }

    // Get total count
    const { count } = await supabase
      .from('rinks')
      .select('*', { count: 'exact', head: true })

    const responseData = {
      success: true,
      message: `Sync completed: ${newCount} new, ${updateCount} updated, ${errorCount} errors`,
      stats: {
        new_rinks: newCount,
        updated_rinks: updateCount,
        errors: errorCount,
        total_processed: rinkData.length,
        total_rinks_in_db: count || 0
      },
      timestamp: new Date().toISOString()
    }

    console.log('Sync completed:', responseData)
    return NextResponse.json(responseData)

  } catch (error: any) {
    console.error('Sync failed:', error)
    
    // Try to log the error
    try {
      const supabase = createClient()
      await supabase
        .from('rink_updates_log')
        .insert({
          changes: { 
            error: error.message || 'Unknown error',
            timestamp: new Date().toISOString()
          },
          update_type: 'api_sync_error'
        })
    } catch (logError) {
      console.error('Error logging failure:', logError)
    }

    return NextResponse.json(
      { 
        error: 'Sync failed', 
        details: error?.message || 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

// Support POST method for manual triggering
export async function POST(request: Request) {
  return GET(request)
}