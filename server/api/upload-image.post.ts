import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const supabase = createClient(config.public.supabase.url, config.supabaseServiceKey)

  // Get user from session
  const user = event.context.user
  if (!user) {
    throw createError({
      statusCode: 401,
      message: 'Unauthorized'
    })
  }

  const formData = await readFormData(event)
  const file = formData.get('file') as File
  const altText = formData.get('alt_text') as string

  if (!file) {
    throw createError({
      statusCode: 400,
      message: 'No file provided'
    })
  }

  if (!altText || altText.trim().length === 0) {
    throw createError({
      statusCode: 400,
      message: 'Alt text is required for accessibility'
    })
  }

  // Validate file type
  if (!file.type.startsWith('image/')) {
    throw createError({
      statusCode: 400,
      message: 'Only image files are allowed'
    })
  }

  // Validate file size (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    throw createError({
      statusCode: 400,
      message: 'Image must be smaller than 5MB'
    })
  }

  try {
    // Generate unique filename
    const timestamp = Date.now()
    const extension = file.name.split('.').pop()
    const fileName = `${user.id}/${timestamp}.${extension}`

    // Convert File to ArrayBuffer then to Buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('post-images')
      .upload(fileName, buffer, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      console.error('Supabase storage error:', error)
      throw new Error('Failed to upload image')
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('post-images')
      .getPublicUrl(fileName)

    return {
      url: urlData.publicUrl,
      file_name: file.name,
      alt_text: altText
    }
  } catch (error: any) {
    console.error('Image upload error:', error)
    throw createError({
      statusCode: 500,
      message: error.message || 'Failed to upload image'
    })
  }
})
