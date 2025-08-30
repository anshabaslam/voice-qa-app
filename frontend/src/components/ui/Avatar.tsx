import React from 'react';

interface AvatarProps {
  size?: number;
  src?: string;
  alt?: string;
  className?: string;
}

export function Avatar({ size = 32, src, alt = "Avatar", className = "" }: AvatarProps) {
  const [imageError, setImageError] = React.useState(false);

  const handleImageError = () => {
    setImageError(true);
  };

  const initials = alt
    .split(' ')
    .map(name => name.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div
      className={`relative inline-flex items-center justify-center overflow-hidden bg-gray-300 dark:bg-gray-600 ${className}`}
      style={{ width: size, height: size }}
    >
      {src && !imageError ? (
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-cover"
          onError={handleImageError}
        />
      ) : (
        <span
          className="text-gray-600 dark:text-gray-300 font-medium select-none"
          style={{ fontSize: size * 0.4 }}
        >
          {initials}
        </span>
      )}
    </div>
  );
}