'use server'

export async function uploadFile(file: File, bucket: string = 'uploads') {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    // Use Service Role Key to bypass RLS
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseKey) {
      console.error('As variáveis NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY não estão definidas.')
      throw new Error(
        'Configuração de armazenamento indisponível.'
      )
    }

    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(supabaseUrl, supabaseKey)

    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
    const filePath = `${fileName}`

    // Convert to Buffer to avoid Node.js File issues
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: true
      })

    if (uploadError) {
      console.error('ERRO SUPABASE (Lib):', uploadError)
      throw uploadError
    }

    const { data } = supabase.storage.from(bucket).getPublicUrl(filePath)

    if (!data.publicUrl) {
       throw new Error('URL pública gerada é vazia')
    }

    return data.publicUrl
  } catch (error) {
    console.error('Erro no upload para Supabase:', error)
    throw error
  }
}

export async function uploadToMidiaBucket(file: File) {
  return uploadFile(file, 'midia')
}
