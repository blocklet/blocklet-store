import { watch } from 'fs';
import path from 'path';

export default function watchAndRebuildLib(libPath, libName) {
  return {
    name: 'watch-and-rebuild-lib',
    configureServer(server) {
      watch(libPath, { recursive: true }, async (eventType, filename) => {
        server.restart(true);
      });
    },
  };
}
