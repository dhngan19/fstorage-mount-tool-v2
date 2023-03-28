import type { IpcMain, BrowserWindow, App } from 'electron';
import { initValidatesEventListener } from './validates';
import { initSettingsEventListener } from './settings';
import { initInstallsEventListener } from './installs';

const EventsHandler = (app: App, ipcMain: IpcMain, mainWindow: BrowserWindow | null) => {
    if (mainWindow) {
        const { webContents } = mainWindow;

        initValidatesEventListener(ipcMain, webContents);

        initSettingsEventListener(app, ipcMain, webContents);

        initInstallsEventListener(ipcMain, webContents);
    }
}

export default EventsHandler;
