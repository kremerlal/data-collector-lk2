import { useEffect, useState } from 'react';
import { api } from '../api/client';
import type { UserInfo } from '../types';

export function useCurrentUser() {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .getMe()
      .then(setUser)
      .catch(() => setUser({ email: 'local-dev@example.com', display_name: 'Local Dev' }))
      .finally(() => setLoading(false));
  }, []);

  return { user, loading };
}
