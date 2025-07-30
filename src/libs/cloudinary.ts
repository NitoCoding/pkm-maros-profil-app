import { v2 as cloudinary } from 'cloudinary'

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

// Upload image to Cloudinary with better quality settings
export async function uploadImageToCloudinary(
  file: File,
  folder: string = 'berita'
): Promise<string> {
  try {
    // Convert file to base64
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64 = buffer.toString('base64')
    const dataURI = `data:${file.type};base64,${base64}`

    // Upload to Cloudinary with improved quality settings
    const result = await cloudinary.uploader.upload(dataURI, {
      folder: folder,
      resource_type: 'auto',
      transformation: [
        // Maintain aspect ratio while setting reasonable max dimensions
        { width: 1920, height: 1080, crop: 'limit' }, // HD resolution limit
        { quality: 'auto:best', fetch_format: 'auto' }, // Best quality auto-format
        { flags: 'progressive' } // Progressive JPEG for better loading
      ],
      // Additional upload options for better quality
      eager: [
        {
          width: 1920,
          height: 1080,
          crop: 'limit',
          quality: 'auto:best',
          fetch_format: 'auto'
        },
        {
          width: 1280,
          height: 720,
          crop: 'limit',
          quality: 'auto:good',
          fetch_format: 'auto'
        },
        {
          width: 800,
          height: 600,
          crop: 'limit',
          quality: 'auto:good',
          fetch_format: 'auto'
        }
      ],
      eager_async: true,
      // Preserve original quality for high-res images
      quality_analysis: true,
      // Better compression settings
      compression: 'auto',
      // Maintain color profile
      colorspace: 'srgb'
    })

    return result.secure_url
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error)
    throw new Error('Failed to upload image')
  }
}

// Delete image from Cloudinary
export async function deleteImageFromCloudinary(publicId: string): Promise<void> {
  try {
    await cloudinary.uploader.destroy(publicId)
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error)
    throw new Error('Failed to delete image')
  }
}

// Get optimized image URL with better quality
export function getOptimizedImageUrl(
  publicId: string,
  options?: {
    width?: number
    height?: number
    quality?: string
    format?: string
    crop?: string
  }
): string {
  const { 
    width = 1920, 
    height = 1080, 
    quality = 'auto:best', 
    format = 'auto',
    crop = 'limit'
  } = options || {}
  
  return cloudinary.url(publicId, {
    width,
    height,
    crop,
    quality,
    fetch_format: format,
    flags: 'progressive',
    colorspace: 'srgb'
  })
}

// Get responsive image URLs for different screen sizes
export function getResponsiveImageUrls(publicId: string) {
  return {
    // Original/Full HD
    original: cloudinary.url(publicId, {
      quality: 'auto:best',
      fetch_format: 'auto',
      flags: 'progressive'
    }),
    // Desktop HD
    desktop: cloudinary.url(publicId, {
      width: 1920,
      height: 1080,
      crop: 'limit',
      quality: 'auto:best',
      fetch_format: 'auto',
      flags: 'progressive'
    }),
    // Tablet
    tablet: cloudinary.url(publicId, {
      width: 1280,
      height: 720,
      crop: 'limit',
      quality: 'auto:good',
      fetch_format: 'auto',
      flags: 'progressive'
    }),
    // Mobile
    mobile: cloudinary.url(publicId, {
      width: 800,
      height: 600,
      crop: 'limit',
      quality: 'auto:good',
      fetch_format: 'auto',
      flags: 'progressive'
    }),
    // Thumbnail
    thumbnail: cloudinary.url(publicId, {
      width: 400,
      height: 300,
      crop: 'fill',
      quality: 'auto:good',
      fetch_format: 'auto'
    })
  }
}

// Upload with specific quality settings for different use cases
export async function uploadImageWithQuality(
  file: File,
  folder: string = 'berita',
  quality: 'high' | 'medium' | 'low' = 'high'
): Promise<string> {
  try {
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64 = buffer.toString('base64')
    const dataURI = `data:${file.type};base64,${base64}`

    const qualitySettings = {
      high: {
        width: 1920,
        height: 1080,
        quality: 'auto:best',
        eager: [
          { width: 1920, height: 1080, crop: 'limit', quality: 'auto:best' },
          { width: 1280, height: 720, crop: 'limit', quality: 'auto:good' }
        ]
      },
      medium: {
        width: 1280,
        height: 720,
        quality: 'auto:good',
        eager: [
          { width: 1280, height: 720, crop: 'limit', quality: 'auto:good' },
          { width: 800, height: 600, crop: 'limit', quality: 'auto:good' }
        ]
      },
      low: {
        width: 800,
        height: 600,
        quality: 'auto:eco',
        eager: [
          { width: 800, height: 600, crop: 'limit', quality: 'auto:eco' },
          { width: 400, height: 300, crop: 'limit', quality: 'auto:eco' }
        ]
      }
    }

    const settings = qualitySettings[quality]

    const result = await cloudinary.uploader.upload(dataURI, {
      folder: folder,
      resource_type: 'auto',
      transformation: [
        { width: settings.width, height: settings.height, crop: 'limit' },
        { quality: settings.quality, fetch_format: 'auto' },
        { flags: 'progressive' }
      ],
      eager: settings.eager,
      eager_async: true,
      quality_analysis: true,
      compression: 'auto',
      colorspace: 'srgb'
    })

    return result.secure_url
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error)
    throw new Error('Failed to upload image')
  }
} 