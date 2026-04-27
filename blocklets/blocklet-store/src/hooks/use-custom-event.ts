import { useEffect, useRef } from 'react';

export enum ECustomEvent {
  BLOCKLET_DETAIL_LOADED = 'blocklet-detail-loaded',
  BLOCKLET_LIST_REFRESH = 'blocklet-list-refresh',
}

const CUSTOM_EVENT_NAME = 'custom-event';
export default function useCustomEvent(event: ECustomEvent, handler?: (...args: any[]) => void) {
  const fnRef = useRef(handler);
  fnRef.current = handler;
  const eventName = `${CUSTOM_EVENT_NAME}-${event}`;

  useEffect(() => {
    if (fnRef.current) {
      const fn = (e: any) => fnRef.current!(...e.detail);
      window.addEventListener(eventName, fn);
      return () => window.removeEventListener(eventName, fn);
    }
    return () => {};
  }, [eventName]);

  return (...params: any[]) => {
    window.dispatchEvent(new CustomEvent(eventName, { detail: params }));
  };
}
