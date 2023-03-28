import { ipcRenderer } from 'electron';

const main = {
  connectWithRclone: (values: unknown) => {
    ipcRenderer.send('connect-rclone-btn-click', values);
  },
  checkConfig: (name: string) => {
    ipcRenderer.send('check-config', name);
  },
  installWinFsp: () => {
    ipcRenderer.send('install-winfsp');
  },
  mountDisk: ({configName, bucketName}: {configName: string; bucketName: string}) => {
    ipcRenderer.send('mount-disk', {configName, bucketName});
  },
  getBucketList: (name: string, filePath: string) => {
    ipcRenderer.send('get-bucket-list', name, filePath);
  },
  // ngandh2 begin
  getVersion: () => {
    ipcRenderer.send('get-version');
  },
  getFileList: (pathFile: string) => {
    ipcRenderer.send('get-file-list', pathFile);
  },
  getFolderList: (path: string) => {
    ipcRenderer.send('get-folder-list', path);
  },
  getProcessList: () => {
    ipcRenderer.send('get-process-list');
  },
  uploadFile: (pathStorage: string, transfer: number) => {
    ipcRenderer.send('upload-file', pathStorage, transfer);
  },
  uploadFolder: (pathStorage: string, transfer: number) => {
    ipcRenderer.send('upload-folder', pathStorage, transfer);
  },
  downloadFile: (pathStorage: string, transfer: number) => {
    ipcRenderer.send('download-file', pathStorage, transfer)
  },
  downloadFolder: (pathStorage: string, transfer: number) => {
    ipcRenderer.send('download-folder', pathStorage, transfer)
  },
  clearProcess: () => {
    ipcRenderer.send('clear-process')
  },
  refreshProcessList: () => {
    ipcRenderer.send('refresh-process-list')
  },
  deleteFile: (name: string, path: string) => {
    ipcRenderer.send('delete-file',name, path);
  },
  deleteFolder: (name: string, path: string) => {
    ipcRenderer.send('delete-folder', name, path);
  },
  createBucket: (name: string) => {
    ipcRenderer.send('create-bucket', name);
  },
  cancelProcess: (pid: string) => {
    ipcRenderer.send('cancel-process', pid);
  },
  getDetailDir: (name: string, path: string) => {
    ipcRenderer.send('get-detail-dir', name, path);
  },
  getFolderSync: (buttonId: string) => {
    ipcRenderer.send('get-folder-sync', buttonId);
  },
  manualSync: (pathFrom: string,id:string, pathTo: string, transfer: number, pathSave: string) => {
    ipcRenderer.send('manual-sync',id, pathFrom, pathTo, transfer, pathSave);
  },
  stopManualSync: (id: string) => {
    ipcRenderer.send('stop-manual-sync',id);
  },
  getFileSaveLog: () => {
    ipcRenderer.send('get-file-save-log');
  },
  // ngandh2 end
  unMountDisk: (pid: unknown) => {
    ipcRenderer.send('unmount-disk', pid);
  },
  unmountSelectedBucket: (ppid: number) => {
    ipcRenderer.send('unmount-selected-bucket', ppid);
  },
  exitApp: () => {
    ipcRenderer.send('exit-app');
  },
  minimizeApp: () => {
    ipcRenderer.send('minimize-app');
  },
  restartApp: () => {
    ipcRenderer.send('restart-app');
  },
  linkToSidebar: () => {
    ipcRenderer.send('link-to-sidebar');
  },
  configsDump: () => {
    ipcRenderer.send('rclone-config-dump');
  },
  configDelete: (name: string) => {
    ipcRenderer.send('rclone-config-delete', name);
  },
  mountAtStartup: (arr: Array<any>) => {
    ipcRenderer.send('mounted-at-startup', arr);
  },
  getRunAtStartup: () => {
    ipcRenderer.send('get-run-at-startup');
  },
  setRunAtStartup: (isEnabled: boolean) => {
    ipcRenderer.send('set-run-at-startup', isEnabled);
  }
};

export default main;
