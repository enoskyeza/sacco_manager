import { useQuery } from '@tanstack/react-query';
import { membersApi } from '../api';
import { useSacco } from './useSacco';
import type { Member } from '../types';

/**
 * Hook to fetch current user's member profile
 */
export const useCurrentMember = () => {
  const { currentSacco } = useSacco();

  const query = useQuery<Member>({
    queryKey: ['current-member', currentSacco?.id],
    queryFn: () => membersApi.getCurrentMember(currentSacco!.id),
    enabled: !!currentSacco,
  });

  return query;
};
