type WelcomeChannels = 'income-check-admin';
type SetupChannels =
  | 'income-choco-setup-process'
  | 'income-choco-setup-finish'
  | 'income-psexec-setup-process'
  | 'income-psexec-setup-finish'
  | 'income-winfsp-setup-process'
  | 'income-winfsp-setup-finish'
  | 'income-rclone-setup-process'
  | 'income-rclone-setup-finish'
  | 'income-awscli-setup-process';

type MainChannels =
  | 'income-connect-rclone-result'
  | 'income-check-config-result'
  | 'income-complete-install-choco-result'
  | 'income-mount-disk-result'
  | 'income-get-buckets-result'
  | 'income-unmount-result'
  | 'income-awscli-setup-finish'
  | 'rclone-config-dump-result'
  | 'rclone-config-delete-result'
  | 'income-unmount-selected-bucket-result'
  | 'mounted-at-startup-result'
  | 'get-run-at-startup-result'
  | 'set-run-at-startup-result'
  | 'income-get-file-result'
  | 'income-upload-file-result'
  | 'income-upload-folder-result'
  | 'download-file-result'
  | 'download-folder-result'
  | 'upload-file-process-result'
  | 'upload-folder-process-result'
  | 'delete-result'
  | 'create-bucket-result'
  | 'get-detail-dir-result'
  | 'get-folder-sync-result'
  | 'get-folder-list-result'
  | 'manual-sync-result'
  | 'get-version-result'
  | 'get-file-save-log-result';

declare global {
  type Channels = WelcomeChannels | SetupChannels | MainChannels;
  interface MainApi {
    connectWithRclone: (args: unknown) => void;
    checkConfig: (name: string) => void;
    installWinFsp: () => void;
    mountDisk: ({configName, bucketName}: {configName: string; bucketName: string}) => void;
    getBucketList: (name: string) => void;
    // ngandh2 begin
    getFileList: (name: string) => void;
    getFolderList: (path: string) => void;
    uploadFile: (pathStorage: string, transfer: number) => void;
    uploadFolder: (pathStorage: string, transfer: number) => void;
    downloadFile: (pathStorage:string, transfer: number) => void;
    downloadFolder: (pathStorage:string, transfer: number) => void;
    clearProcess: () => void;
    getProcessList: () => void;
    refreshProcessList: () => void;
    deleteFile: (name:string, path: string) => void;
    deleteFolder: (name:string, path: string) => void;
    createBucket: (name: string) => void;
    cancelProcess: (pid: string) => void;
    getDetailDir: (name: string, path: string) => void;
    getFolderSync: (button: string) => void;
    manualSync: (id:string, pathFrom:string, pathTo: string, transfer: number, pathSave: string) => void;
    stopManualSync: (id: string) => void;
    getVersion:() => void;
    getFileSaveLog: () => void;
    // ngandh2 end
    unMountDisk: (pid: unknown) => void;
    unmountSelectedBucket: (ppid: number) => void;
    exitApp: () => void;
    minimizeApp: () => void;
    restartApp: () => void;
    linkToSidebar: () => void;
    configsDump: () => void;
    configDelete: (name: string) => void;
    mountAtStartup: (mounted: Array<any>) => void;
    setRunAtStartup: (isEnabled: boolean) => void;
    getRunAtStartup: () => void;
  }
  interface ValidateApi {
    isAdmin: () => void;
  }
  interface IpcApi {
    sendMessage(channel: Channels, args: unknown[]): void;
    on(
      channel: Channels,
      func: (...args: any[]) => void
    ): (() => void) | undefined;
    once(channel: Channels, func: (...args: unknown[]) => void): void;
  }
  interface InstallApi {
    choco: () => void;
    psexec: () => void;
    winfsp: () => void;
    rclone: () => void;
    awscli: () => void;
  }
  interface ElectronApi {
    main: MainApi;
    validates: ValidateApi;
    ipcRenderer: IpcApi;
    installs: InstallApi;
    log: (type: 'info'|'error', data: any) => void;
  }

  interface Window {
    electron: ElectronApi;
  }
}

export {};
