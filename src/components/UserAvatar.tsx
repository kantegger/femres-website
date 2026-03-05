import React from 'react';

interface UserAvatarProps {
  name: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function UserAvatar({ name, size = 'md', className = '' }: UserAvatarProps) {
  const getInitials = (name: string) => {
    const cleanName = name.trim();
    
    // Check if it's Chinese characters
    const chineseRegex = /[\u4e00-\u9fa5]/;
    if (chineseRegex.test(cleanName)) {
      // Take first Chinese character
      return cleanName.match(chineseRegex)?.[0] || cleanName[0];
    }
    
    // For English names, take first letter of first and last name
    const parts = cleanName.split(' ');
    if (parts.length > 1) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return cleanName.slice(0, 2).toUpperCase();
  };

  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base'
  };

  const initials = getInitials(name);

  // Generate consistent color based on name
  const colors = [
    'bg-purple-500',
    'bg-pink-500',
    'bg-indigo-500',
    'bg-blue-500',
    'bg-green-500',
    'bg-yellow-500',
    'bg-red-500',
    'bg-orange-500'
  ];
  
  const colorIndex = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
  const bgColor = colors[colorIndex];

  return (
    <div 
      className={`${sizeClasses[size]} ${bgColor} rounded-full flex items-center justify-center text-white font-semibold ${className}`}
      title={name}
    >
      {initials}
    </div>
  );
}