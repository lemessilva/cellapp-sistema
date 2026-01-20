'use server'

import { createClient } from '@supabase/supabase-js'

export async function listMediaFiles() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    console.error('Supabase credentials missing')
    return []
  }

  const supabase = createClient(supabaseUrl, supabaseKey)

  try {
    const { data, error } = await supabase
      .storage
      .from('midia')
      .list('', {
        limit: 100,
        offset: 0,
        sortBy: { column: 'created_at', order: 'desc' },
      })

    if (error) {
      console.error('Error listing media:', error)
      return []
    }

    // Transformar em URLs públicas
    const files = data.map(file => {
      const { data: { publicUrl } } = supabase
        .storage
        .from('midia')
        .getPublicUrl(file.name)
      
      return {
        name: file.name,
        url: publicUrl,
        created_at: file.created_at,
        metadata: file.metadata
      }
    })

    return files
  } catch (error) {
    console.error('Error in listMediaFiles:', error)
    return []
  }
}
