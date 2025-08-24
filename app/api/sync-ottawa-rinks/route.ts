import { createClient } from '@/lib/supabase/client'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  // Check authorization in production
  const authHeader = request.headers.get('authorization')
  if (process.env.NODE_ENV === 'production') {
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  try {
    console.log('Starting Ottawa rinks sync...')
    
    // Fetch from Ottawa Open Data API
    const response = await fetch(
      'https://www.arcgis.com/sharing/rest/content/items/8010886de94e4a2d9081c9e94a34f896/data'
    )
    
    const data = await response.json()
    
    // Parse Ottawa facilities data
    const facilities = data.operationalLayers?.[0]?.featureCollection?.layers?.[0]?.featureSet?.features || []
    
    const supabase = createClient()
    let newCount = 0
    let updateCount = 0
    
    // Process each facility
    for (const facility of facilities) {
      const props = facility.properties || facility.attributes || {}
      
      // Filter for arenas/rinks
      if (props.FACILITY_TYPE?.includes('Arena') || 
          props.NAME?.toLowerCase().includes('arena') ||
          props.NAME?.toLowerCase().includes('rink')) {
        
        const rinkData = {
          name: props.NAME || props.FACILITY_NAME,
          address: props.ADDRESS || props.LOCATION || 'Address not available',
          phone: props.PHONE || 'Phone not available',
          hourly_rate: 180, // Default rate
          source: 'ottawa_api',
          last_synced: new Date().toISOString()
        }
        
        if (!rinkData.name) continue
        
        // Check if exists
        const { data: existing } = await supabase
          .from('rinks')
          .select('id, source')
          .eq('name', rinkData.name)
          .single()
        
        if (!existing) {
          // Insert new rink
          const { error } = await supabase
            .from('rinks')
            .insert(rinkData)
          
          if (!error) newCount++
        } else if (existing.source === 'ottawa_api') {
          // Update only if it's from API (don't override manager updates)
          const { error } = await supabase
            .from('rinks')
            .update({
              address: rinkData.address,
              phone: rinkData.phone,
              last_synced: rinkData.last_synced
            })
            .eq('id', existing.id)
          
          if (!error) updateCount++
        }
      }
    }
    
    // Alternative API if first one doesn't work
    if (facilities.length === 0) {
      console.log('Trying alternative API...')
      
      // Try City of Ottawa REST API
      const altResponse = await fetch(
        'https://maps.ottawa.ca/arcgis/rest/services/RecreationCulture/MapServer/1/query?' +
        'where=1%3D1&outFields=*&f=json'
      )
      
      const altData = await altResponse.json()
      
      if (altData.features) {
        for (const feature of altData.features) {
          const attr = feature.attributes
          
          if (attr.FACILITY_TYPE?.includes('Arena')) {
            const rinkData = {
              name: attr.NAME_EN || attr.NAME,
              address: attr.ADDRESS || 'Address not available',
              phone: attr.PHONE || 'Phone not available',
              hourly_rate: 180,
              source: 'ottawa_api',
              last_synced: new Date().toISOString()
            }
            
            if (!rinkData.name) continue
            
            // Check and insert/update
            const { data: existing } = await supabase
              .from('rinks')
              .select('id')
              .eq('name', rinkData.name)
              .single()
            
            if (!existing) {
              await supabase.from('rinks').insert(rinkData)
              newCount++
            }
          }
        }
      }
    }
    
    // Log the sync
    await supabase
      .from('rink_updates_log')
      .insert({
        changes: { 
          new_rinks: newCount,
          updated_rinks: updateCount,
          total_processed: facilities.length,
          timestamp: new Date().toISOString()
        },
        update_type: 'api_sync'
      })
    
    // Get total count
    const { count } = await supabase
      .from('rinks')
      .select('*', { count: 'exact', head: true })
    
    return NextResponse.json({
      success: true,
      message: `Sync completed: ${newCount} new, ${updateCount} updated`,
      stats: {
        new_rinks: newCount,
        updated_rinks: updateCount,
        total_rinks: count
      },
      time: new Date().toISOString()
    })
    
  } catch (error: any) {
    console.error('Sync error:', error)
    
    // Still log the error
    const supabase = createClient()
    await supabase
      .from('rink_updates_log')
      .insert({
        changes: { error: error.message },
        update_type: 'api_sync_error'
      })
    
    return NextResponse.json(
      { error: 'Sync failed', details: error?.message },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  return GET(request)
}