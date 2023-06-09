export const events = {
    validates: {
        isAdmin: "check-is-admin",
        isAdminResult: "income-check-admin"
    },
    installs: {
        choco: "install-choco",
        psexec: "install-psexec",
        winfsp: "install-winfsp",
        rclone: "install-rclone",
        awscli: "install-awscli"
    },
    settings: {
        rclone: {
            connect: "connect-rclone-btn-click",
            connectResult: "income-connect-rclone-result",
            checkConfig: "check-config",
            checkConfigResult: "income-check-config-result",
            mount: "mount-disk",
            mountResult: "income-mount-disk-result",
            unmount: "unmount-disk",
            unmountResult: "income-unmount-result",
            unmountSelected: "unmount-selected-bucket",
            unmountSelectedResult: "income-unmount-selected-bucket-result",
            getBucketList: "get-bucket-list",
            getBucketListResult: "income-get-buckets-result",
            // ngandh2 begin
            getVersion: "get-version",
            getVersionResult: "get-version-result",
            getFileList: "get-file-list",
            getFileListResult: "income-get-file-result",
            getFolderList: "get-folder-list",
            getFolderListResult: "get-folder-list-result",
            uploadFile: "upload-file",
            uploadFileResult: "income-upload-file-result",
            uploadFileProcessResult: "upload-file-process-result",
            uploadFolder: "upload-folder",
            uploadFolderResult: "income-upload-folder-result",
            downloadFile: "download-file",
            downloadFileResult: "download-file-result",
            downloadProcessResult: "download-process-result",
            downloadFolder: "download-folder",
            downloadFolderResult: "download-folder-result",
            clearProcess: "clear-process",
            getProcessList : "get-process-list",
            refreshProcessList: "refresh-process-list",
            deleteFile: "delete-file",
            deleteFolder: "delete-folder",
            deleteResult: "delete-result",
            createBucket: 'create-bucket',
            createBucketResult: 'create-bucket-result',
            cancelProcess: 'cancel-process',
            getDetailDir: 'get-detail-dir',
            getDetailDirResult: 'get-detail-dir-result',
            getFolderSync: 'get-folder-sync',
            getFolderSyncResult: 'get-folder-sync-result',
            manualSync: 'manual-sync',
            manualSyncResult: 'manual-sync-result',
            stopManualSync: 'stop-manual-sync',
            getFileSaveLog: 'get-file-save-log',
            getFileSaveLogResult: 'get-file-save-log-result',
            // ngandh2 end
            configsDump: "rclone-config-dump",
            configsDumpResult: "rclone-config-dump-result",
            configDelete: "rclone-config-delete",
            configDeleteResult: "rclone-config-delete-result",
            mountedAtStartup: "mounted-at-startup",
            mountedAtStartupResult: "mounted-at-startup-result",
            getRunAtStartup: "get-run-at-startup",
            getRunAtStartupResult: "get-run-at-startup-result",
            setRunAtStartup: "set-run-at-startup",
            setRunAtStartupResult: "set-run-at-startup-result"
        },
        app: {
            linkToSidebar: "link-to-sidebar",
            exitApp: "exit-app",
            minimizeApp: "minimize-app",
            restartApp: "restart-app",
        }
    }
}
