import { useQuery } from '@tanstack/react-query';
import { userService } from '@/services/user.service';

export function useAuth() {
  const { data: user, isLoading } = useQuery({
    queryKey: ['auth-user'],
    queryFn: userService.getMe,
    retry: false,
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
  };
} 