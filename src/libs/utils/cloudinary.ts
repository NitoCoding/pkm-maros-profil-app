// Cloudinary utility functions for image transformations

interface CloudinaryConfig {
  cloudName: string;
  defaultTransformation?: string;
}

// Default Cloudinary configuration
const CLOUDINARY_CONFIG: CloudinaryConfig = {
  cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || '', // Ganti dengan cloud name Anda
  defaultTransformation: 'f_auto,q_auto'
};

/**
 * Transform Cloudinary URL with specific parameters
 */
export function transformCloudinaryUrl(
  originalUrl: string,
  transformations: string
): string {
  // Check if it's already a Cloudinary URL
  if (!originalUrl.includes('cloudinary.com')) {
    return originalUrl;
  }

  // If URL already has transformations, replace them
  if (originalUrl.includes('/upload/')) {
    const parts = originalUrl.split('/upload/');
    if (parts.length === 2) {
      return `${parts[0]}/upload/${transformations}/${parts[1]}`;
    }
  }

  // If no transformations exist, add them
  return originalUrl.replace('/upload/', `/upload/${transformations}/`);
}

/**
 * Get optimized image URL for CardStok component
 * Aspect ratio: 4:3 (300x225px)
 */
export function getCardStokImageUrl(
  originalUrl: string,
  width: number = 900,
  height: number = 900
): string {
  const transformations = [
    'c_fill',           // Crop to fill
    'g_face',           // Gravity face (for portrait photos)
    'w_' + width,       // Width
    'h_' + height,      // Height
    'f_auto',           // Auto format
    'q_auto',           // Auto quality
    'fl_progressive'    // Progressive loading
  ].join(',');

  return transformCloudinaryUrl(originalUrl, transformations);
}

/**
 * Get responsive image URL for different screen sizes
 */
export function getResponsiveImageUrl(
  originalUrl: string,
  sizes: { [key: string]: { width: number; height: number } }
): { [key: string]: string } {
  const responsiveUrls: { [key: string]: string } = {};

  Object.entries(sizes).forEach(([breakpoint, dimensions]) => {
    responsiveUrls[breakpoint] = getCardStokImageUrl(
      originalUrl,
      dimensions.width,
      dimensions.height
    );
  });

  return responsiveUrls;
}

/**
 * Get thumbnail image URL (smaller version)
 */
export function getThumbnailUrl(
  originalUrl: string,
  size: number = 150
): string {
  const transformations = [
    'c_fill',
    'g_face',
    'w_' + size,
    'h_' + size,
    'f_auto',
    'q_auto'
  ].join(',');

  return transformCloudinaryUrl(originalUrl, transformations);
}

/**
 * Get image with specific crop and gravity
 */
export function getCroppedImageUrl(
  originalUrl: string,
  width: number,
  height: number,
  gravity: 'face' | 'center' | 'auto' = 'face'
): string {
  const transformations = [
    'c_fill',
    'g_' + gravity,
    'w_' + width,
    'h_' + height,
    'f_auto',
    'q_auto'
  ].join(',');

  return transformCloudinaryUrl(originalUrl, transformations);
}

/**
 * Get image with blur effect (for loading states)
 */
export function getBlurredImageUrl(originalUrl: string): string {
  const transformations = [
    'e_blur:1000',
    'w_300',
    'h_225',
    'f_auto',
    'q_auto'
  ].join(',');

  return transformCloudinaryUrl(originalUrl, transformations);
}

/**
 * Get image with specific format
 */
export function getFormattedImageUrl(
  originalUrl: string,
  format: 'webp' | 'jpg' | 'png' | 'auto' = 'auto'
): string {
  const transformations = [
    'f_' + format,
    'q_auto'
  ].join(',');

  return transformCloudinaryUrl(originalUrl, transformations);
}

/**
 * Get image with specific quality
 */
export function getQualityImageUrl(
  originalUrl: string,
  quality: number = 80
): string {
  const transformations = [
    'q_' + quality,
    'f_auto'
  ].join(',');

  return transformCloudinaryUrl(originalUrl, transformations);
}

/**
 * Get optimal resolution for w-300px based on use case
 */
export function getOptimalResolution(
  useCase: 'cardStok' | 'portrait' | 'square' | 'landscape' | 'thumbnail' = 'cardStok'
): { width: number; height: number } {
  const resolutions = {
    cardStok: { width: 300, height: 225 }, // 4:3 - Cocok untuk foto pegawai
    portrait: { width: 300, height: 400 }, // 3:4 - Foto portrait tinggi
    square: { width: 300, height: 300 }, // 1:1 - Foto persegi
    landscape: { width: 300, height: 169 }, // 16:9 - Foto landscape
    thumbnail: { width: 150, height: 113 } // 4:3 - Thumbnail kecil
  };

  return resolutions[useCase];
}

/**
 * Get responsive resolutions for different screen sizes
 */
export function getResponsiveResolutions(
  baseWidth: number = 300,
  aspectRatio: '4:3' | '3:4' | '1:1' | '16:9' = '4:3'
): { [key: string]: { width: number; height: number } } {
  const ratios = {
    '4:3': 0.75,    // height = width * 0.75
    '3:4': 1.33,    // height = width * 1.33
    '1:1': 1,       // height = width * 1
    '16:9': 0.5625  // height = width * 0.5625
  };

  const ratio = ratios[aspectRatio];

  return {
    sm: { width: Math.round(baseWidth * 0.5), height: Math.round(baseWidth * 0.5 * ratio) },
    md: { width: Math.round(baseWidth * 0.75), height: Math.round(baseWidth * 0.75 * ratio) },
    lg: { width: baseWidth, height: Math.round(baseWidth * ratio) },
    xl: { width: Math.round(baseWidth * 1.25), height: Math.round(baseWidth * 1.25 * ratio) },
    '2xl': { width: Math.round(baseWidth * 1.5), height: Math.round(baseWidth * 1.5 * ratio) }
  };
}

// Predefined sizes for different use cases
export const IMAGE_SIZES = {
  // CardStok - 4:3 ratio (300x225px)
  cardStok: { width: 300, height: 225 },
  cardStokTall: { width: 300, height: 240 }, // Sedikit lebih tinggi untuk detail lebih baik
  
  // Portrait - 3:4 ratio (300x400px)
  portrait: { width: 300, height: 400 },
  portraitMedium: { width: 300, height: 360 },
  
  // Square - 1:1 ratio (300x300px)
  square: { width: 300, height: 300 },
  squareMedium: { width: 250, height: 250 },
  
  // Landscape - 16:9 ratio (300x169px)
  landscape: { width: 300, height: 169 },
  landscapeWide: { width: 300, height: 200 },
  
  // Thumbnails
  cardStokThumbnail: { width: 150, height: 113 }, // 4:3 ratio
  thumbnail: { width: 100, height: 100 }, // 1:1 ratio
  thumbnailPortrait: { width: 100, height: 133 }, // 3:4 ratio
  
  // Large versions
  cardStokLarge: { width: 600, height: 450 }, // 4:3 ratio
  profile: { width: 200, height: 200 }, // 1:1 ratio
} as const;

// Responsive breakpoints
export const RESPONSIVE_SIZES = {
  sm: { width: 200, height: 150 },
  md: { width: 300, height: 225 },
  lg: { width: 400, height: 300 },
  xl: { width: 500, height: 375 }
} as const; 