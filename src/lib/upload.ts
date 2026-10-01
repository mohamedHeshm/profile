import { supabase } from './supabase'

const TYPES: Record<string, string> = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' }
const MAX = 5 * 1024 * 1024

/** Validates and uploads an image into the caller's own folder; returns its public URL. */
export async function uploadImage(uid: string, file: File): Promise<string> {
  const ext = TYPES[file.type]
  if (!ext) throw new Error('Use a JPG, PNG or WebP image.')
  if (file.size > MAX) throw new Error('Image must be 5 MB or smaller.')
  const path = `${uid}/${crypto.randomUUID()}.${ext}`
  const { error } = await supabase.storage.from('media').upload(path, file, { contentType: file.type })
  if (error) throw new Error('Unable to upload image. Try again.')
  return supabase.storage.from('media').getPublicUrl(path).data.publicUrl
}
