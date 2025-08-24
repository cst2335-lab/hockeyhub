import { createClient } from '@/lib/supabase/client'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const testMode = searchParams.get('test') === 'true'
  
  // Skip auth check in test mode
  if (!testMode) {
    const authHeader = request.headers.get('authorization')
    if (process.env.NODE_ENV === 'production') {
      if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
    }
  }
  
  try {
    console.log('Sync started at:', new Date().toISOString())
    
    const supabase = createClient()
    
    // Get current count
    const { count: currentCount } = await supabase
      .from('rinks')
      .select('*', { count: 'exact', head: true })
    
    // In test mode, just return current stats
    if (testMode) {
      return NextResponse.json({
        test: true,
        message: 'API is working! Use without ?test=true to run actual sync',
        current_rinks: currentCount,
        time: new Date().toISOString()
      })
    }
    
    // Your actual sync code here...
    // For now, just log and return success
    
    // Log the sync
    await supabase
      .from('rink_updates_log')
      .insert({
        changes: { 
          test: testMode ? 'Test run' : 'Production sync',
          current_count: currentCount
        },
        update_type: 'api_sync'
      })
    
    return NextResponse.json({
      success: true,
      message: 'Sync completed',
      current_rinks: currentCount,
      time: new Date().toISOString()
    })
    
  } catch (error: any) {
    console.error('Sync error:', error)
    return NextResponse.json(
      { error: 'Failed', details: error?.message },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  return GET(request)
}