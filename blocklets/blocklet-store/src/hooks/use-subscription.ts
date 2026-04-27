import { useRef, useEffect } from 'react';
import get from 'lodash/get';
import { WsClient } from '@arcblock/ws';
import { useSessionContext } from '../contexts/session';

const RELAY_SOCKET_PREFIX = '/.well-known/service';
const getAppId = () => get(window, 'blocklet.appPid') || get(window, 'blocklet.appId') || '';
const getAppPrefix = () => (get(window, 'env.apiPrefix') || '/').replace(/\/$/, '').replace(RELAY_SOCKET_PREFIX, '');
const getRelayChannel = (token: string) => `relay:${getAppId()}:${token}`;
const getRelayProtocol = () => (window.location.protocol === 'https:' ? 'wss:' : 'ws:');
const getSocketHost = () => new URL(window.location.href).host;

export default function useSubscription(vaultId: string) {
  const socket = useRef<WsClient | null>(null);
  const subscription = useRef<{
    vaultId: string;
    subscription: PushSubscription;
    on: (event: string, callback: (response: any) => void) => void;
  } | null>(null);

  useEffect(() => {
    if (getAppId()) {
      const needReconnect = !socket.current || socket.current.isConnected() === false;
      if (needReconnect) {
        socket.current = new WsClient(
          `${getRelayProtocol()}//${getSocketHost()}${getAppPrefix()}${RELAY_SOCKET_PREFIX}/relay`,
          {
            longpollerTimeout: 5000, // connection timeout
            heartbeatIntervalMs: 30 * 1000,
          }
        );
        socket.current.connect();
      }
    }

    return () => {
      if (socket.current) {
        socket.current.disconnect?.();
        socket.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (vaultId) {
      const channel = getRelayChannel(vaultId);

      let needSubscription = false;
      if (subscription.current) {
        if (subscription.current.vaultId !== vaultId) {
          socket.current?.unsubscribe(getRelayChannel(subscription.current.vaultId));
          needSubscription = true;
        }
      } else {
        needSubscription = true;
      }

      if (needSubscription) {
        subscription.current = socket.current.subscribe(channel);
        if (subscription.current) {
          subscription.current.vaultId = vaultId;
        }
      }
    }
  }, [vaultId]);

  return subscription.current;
}

type ReviewResponse = {
  response: {
    status: string;
    blockletId: string;
  };
};

/**
 * @description 监听 app.space.* 服务端事件
 */
export function useReviewMessage(callback: (response: ReviewResponse) => void) {
  const { session } = useSessionContext();
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  const userId = session?.user?.did;
  const sub = useSubscription(userId);
  useEffect(() => {
    if (sub && userId) {
      sub.on('blocklet.reviewed', (response) => {
        callbackRef.current(response);
      });
    }
  }, [userId, sub]);
}
