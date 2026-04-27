import { joinURL, withQuery } from 'ufo';
import { DISCUSS_KIT_DID, BLOCKLET_STORE_DID } from '../constants';

const nameMapDid = {
  'did-comments': DISCUSS_KIT_DID,
  'blocklet-store': BLOCKLET_STORE_DID,
};
const components = window.blocklet.componentMountPoints || [];

export function getComponent(componentDid) {
  const realDid = nameMapDid[componentDid] || componentDid;
  return components.find((item) => item.did === realDid || item.name === realDid);
}

export function hasComponent(idOrName) {
  return !!getComponent(idOrName, components);
}

export function getVersion() {
  // eslint-disable-next-line no-undef
  return __VERSION__ || window.blocklet.version;
}

export async function parseBlockletStoreUrl(url) {
  try {
    const urlInstance = new URL(url);
    urlInstance.pathname = '';
    const res = await fetch(
      withQuery(joinURL(urlInstance.origin, '__blocklet__.js'), {
        type: 'json',
      })
    );
    const data = await res.json();
    const { componentMountPoints = [] } = data;
    const findBlockletStore = componentMountPoints.find((item) => item.did === nameMapDid['blocklet-store']);
    if (findBlockletStore) {
      return joinURL(urlInstance.origin, findBlockletStore.componentMountPoints);
    }
    return false;
  } catch {
    return null;
  }
}
