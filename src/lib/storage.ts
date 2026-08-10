import { createClient } from '@supabase/supabase-js';

let _supabase: ReturnType<typeof createClient> | null = null;

function getSupabase() {
  if (_supabase) return _supabase;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  _supabase = createClient(url, key);
  return _supabase;
}

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE = 2 * 1024 * 1024; // 2MB
const BUCKET = 'servicios';

export interface UploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

/**
 * Upload a service image to Supabase Storage.
 * Validates type and size before uploading.
 * Returns the public URL on success.
 */
export async function uploadServiceImage(
  file: File,
  businessSlug: string,
): Promise<UploadResult> {
  const supabase = getSupabase();
  if (!supabase) {
    return { success: false, error: 'Storage no configurado' };
  }

  // Validate type
  if (!ALLOWED_TYPES.includes(file.type)) {
    return { success: false, error: 'Solo se permiten imágenes JPG, PNG o WebP' };
  }

  // Validate size
  if (file.size > MAX_SIZE) {
    return { success: false, error: 'La imagen no debe superar los 2MB' };
  }

  const ext = file.type === 'image/jpeg' ? 'jpg'
    : file.type === 'image/png' ? 'png' : 'webp';
  const path = `${businessSlug}.${ext}`;

  try {
    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: true,
        contentType: file.type,
      });

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from(BUCKET)
      .getPublicUrl(path);

    return { success: true, url: publicUrl };
  } catch (err) {
    console.error('[storage] Upload error:', err);
    return { success: false, error: 'Error al subir la imagen' };
  }
}
