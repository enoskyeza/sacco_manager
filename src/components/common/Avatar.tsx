interface AvatarProps {
  name: string;
  imageUrl?: string | null;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  bgColor?: string;
  textColor?: string;
}

const sizeClasses = {
  sm: 'w-8 h-8 text-sm',
  md: 'w-9 h-9 text-base',
  lg: 'w-10 h-10 text-base',
  xl: 'w-12 h-12 text-lg',
};

export default function Avatar({ 
  name, 
  imageUrl, 
  size = 'md',
  bgColor = 'bg-blue-500',
  textColor = 'text-white'
}: AvatarProps) {
  
  const getInitials = (fullName: string): string => {
    const words = fullName.trim().split(' ');
    if (words.length >= 2) {
      return `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase();
    }
    return fullName.substring(0, 2).toUpperCase();
  };

  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt={name}
        className={`${sizeClasses[size]} rounded-full object-cover`}
      />
    );
  }

  return (
    <div className={`${sizeClasses[size]} ${bgColor} rounded-full flex items-center justify-center ${textColor} font-semibold`}>
      {getInitials(name)}
    </div>
  );
}
