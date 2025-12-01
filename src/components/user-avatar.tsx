'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface UserAvatarProps {
  name: string;
  imageUrl?: string | null;
}

// React Compiler handles memoization automatically
export function UserAvatar({ name, imageUrl }: UserAvatarProps) {
  // Get first initial from name
  const initial = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 1); // Only first letter

  return (
    <Avatar className="h-9 w-9">
      {imageUrl ? (
        <AvatarImage src={imageUrl} alt={name} />
      ) : (
        <AvatarFallback>{initial}</AvatarFallback>
      )}
    </Avatar>
  );
}
