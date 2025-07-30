import { NextRequest, NextResponse } from 'next/server'
import { uploadImageWithQuality } from '@/libs/cloudinary'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const folder = formData.get('folder') as string || 'berita'
    const quality = formData.get('quality') as 'high' | 'medium' | 'low' || 'high'

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'File must be an image' },
        { status: 400 }
      )
    }

    // Validate file size (increased to 10MB for HD images)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size must be less than 10MB' },
        { status: 400 }
      )
    }

    // Upload with specified quality
    const imageUrl = await uploadImageWithQuality(file, folder, quality)

    return NextResponse.json({
      success: true,
      url: imageUrl,
      quality: quality,
      message: 'Image uploaded successfully with HD quality'
    })
  } catch (error: any) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to upload image' },
      { status: 500 }
    )
  }
} 