import Image from "next/image";
import { 
  getCardStokImageUrl, 
  getThumbnailUrl, 
  getCroppedImageUrl,
  getBlurredImageUrl,
  IMAGE_SIZES 
} from "@/libs/utils/cloudinary";

interface OptimizedImageProps {
  src: string;
  alt: string;
  size?: keyof typeof IMAGE_SIZES;
  width?: number;
  height?: number;
  className?: string;
  fill?: boolean;
  priority?: boolean;
  placeholder?: "blur" | "empty";
  gravity?: "face" | "center" | "auto";
  quality?: number;
}

export default function OptimizedImage({
  src,
  alt,
  size = "cardStok",
  width,
  height,
  className = "",
  fill = false,
  priority = false,
  placeholder = "blur",
  gravity = "face",
  quality = 80
}: OptimizedImageProps) {
  // Get optimized image URL based on size or custom dimensions
  let optimizedSrc = src;
  let blurredSrc = src;

  if (src.includes('cloudinary.com')) {
    if (width && height) {
      optimizedSrc = getCroppedImageUrl(src, width, height, gravity);
    } else {
      const dimensions = IMAGE_SIZES[size];
      optimizedSrc = getCardStokImageUrl(src, dimensions.width, dimensions.height);
    }
    blurredSrc = getBlurredImageUrl(src);
  }

  // Common props
  const commonProps = {
    src: optimizedSrc,
    className,
    priority,
    unoptimized: false, // Let Cloudinary handle optimization
    ...(placeholder === "blur" && {
      placeholder: "blur" as const,
      blurDataURL: blurredSrc
    })
  };

  // Render based on fill prop
  if (fill) {
    return (
      <Image
        {...commonProps}
        fill
        alt={alt}
        sizes="(max-width: 768px) 100vw, 300px"
      />
    );
  }

  // Render with specific dimensions
  const dimensions = width && height ? { width, height } : IMAGE_SIZES[size];
  
  return (
    <Image
      alt={alt}
      {...commonProps}
      {...dimensions}
    />
  );
}

// Specialized components for common use cases
export function CardStokImage({ src, alt, ...props }: Omit<OptimizedImageProps, 'size'>) {
  return <OptimizedImage src={src} alt={alt} size="cardStok" {...props} />;
}

export function ThumbnailImage({ src, alt, ...props }: Omit<OptimizedImageProps, 'size'>) {
  return <OptimizedImage src={src} alt={alt} size="thumbnail" {...props} />;
}

export function ProfileImage({ src, alt, ...props }: Omit<OptimizedImageProps, 'size'>) {
  return <OptimizedImage src={src} alt={alt} size="profile" {...props} />;
} 