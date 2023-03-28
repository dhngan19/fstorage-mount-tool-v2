import { ipcRenderer } from 'electron';

const installs = {
  choco: () => ipcRenderer.send('install-choco'),
  psexec: () => ipcRenderer.send('install-psexec'),
  winfsp: () => ipcRenderer.send('install-winfsp'),
  rclone: () => ipcRenderer.send('install-rclone'),
  awscli: () => ipcRenderer.send('install-awscli'),
};

export default installs;
