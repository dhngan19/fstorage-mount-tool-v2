import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';
import log from 'electron-log';

import { main, validates, installs } from './context-bridge';
// export type Channels = 'ipc-example';

contextBridge.exposeInMainWorld('electron', {
  ipcRenderer: {
    sendMessage(channel: Channels, args: unknown[]) {
      ipcRenderer.send(channel, args);
    },
    on(channel: Channels, func: (args: any) => void) {
      const subscription = (_event: IpcRendererEvent, args: any) =>
        func(args);

      ipcRenderer.on(channel, subscription);

      return () => {
        ipcRenderer.removeListener(channel, subscription);
      };
    },
    once(channel: Channels, func: (...args: unknown[]) => void) {
      ipcRenderer.once(channel, (_event, ...args) => func(...args));
    },
  },
  main,
  validates,
  installs,
  log: (type: 'info'|'error', data: any) => {
    // eslint-disable-next-line @typescript-eslint/dot-notation
    ipcRenderer.send("log", [type, data]);
  }
});
