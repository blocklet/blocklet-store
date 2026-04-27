import { useMemo } from 'react';
import { useSessionContext } from '../contexts/session';

export default function useUser() {
  const { session } = useSessionContext();
  const org = useMemo(() => session.user?.org, [session.user]);

  return useMemo(
    () => ({
      ...session.user,
      isGuest: session.user === null,
      isOwner: session.user?.role === 'owner',
      isAdmin: session.user?.role === 'admin',
      isDeveloper: session.user?.role === 'developer',
      hasOwner: session.user?.passports.some((passport) => passport.role === 'owner'),
      hasAdmin: session.user?.passports.some((passport) => passport.role === 'admin'),
      hasDeveloper: session.user?.passports.some((passport) => passport.role === 'developer'),
      org: session.user?.org || '',
      isOrgOwner: org && org.ownerDid === session.user?.did,
    }),
    [session, org]
  );
}
