import { useLocalStorageState, useReactive } from 'ahooks';

const PAGE_STATE_KEY = 'page-state';

export default function usePageState(defaultValue = {}, persistence = true, path = window.location.pathname) {
  const [pageState, setPageState] = useLocalStorageState(PAGE_STATE_KEY, { defaultValue: {} });
  const state = useReactive(pageState);
  function syncState() {
    setPageState(state);
  }

  if (!(path in pageState) && persistence) {
    state[path] = defaultValue;
    syncState();
  }

  return new Proxy(
    {},
    {
      get: (target, prop) => {
        try {
          return state[path][prop];
        } catch {
          return undefined;
        }
      },
      set: (target, prop, value) => {
        try {
          const data = {
            ...(state[path] || {}),
            [prop]: value,
          };
          state[path] = data;
          syncState();
          return true;
        } catch {
          return false;
        }
      },
      deleteProperty: (target, prop) => {
        try {
          const data = { ...(state[path] || {}) };
          delete data[prop];
          delete state[path][prop];
          syncState();
          return true;
        } catch {
          return false;
        }
      },
      ownKeys: () => Object.keys(state[path] || {}),
    }
  );
}
