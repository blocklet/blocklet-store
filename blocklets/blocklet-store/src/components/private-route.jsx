import { useEffect } from 'react';
import { useOutlet } from 'react-router-dom';
import { noop } from 'lodash-es';
import CircularProgress from '@mui/material/CircularProgress';
import Center from '@arcblock/ux/lib/Center';

import { useSessionContext } from '../contexts/session';

export default function PrivateRoute() {
  const { session, events } = useSessionContext();
  const outlet = useOutlet();

  useEffect(() => {
    events.once('logout', () => {
      window.location.href = '/';
    });
  }, []); // eslint-disable-line

  useEffect(() => {
    if (session.initialized && !session.user) {
      // @ts-ignore
      session.login(noop, { openMode: 'redirect', redirect: window.location.href });
    }
  }, [session.initialized]); // eslint-disable-line

  if (session.user) {
    return outlet;
  }

  return (
    <Center>
      <CircularProgress />
    </Center>
  );
}
