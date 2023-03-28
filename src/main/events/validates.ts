import type { IpcMain, WebContents } from 'electron';
import { exec } from 'child_process';
import { events } from './constants'

const isAdmin = (webContents: WebContents) => {
    const eventName = events.validates.isAdminResult;
    exec('NET SESSION', (err, so, se) => {
        if (err || se.length !== 0)
            webContents.send(eventName, false);
        else if (se.length === 0) {
            webContents.send(eventName, true);
        }
    });
}

export const initValidatesEventListener = (ipcMain: IpcMain, webContents: WebContents) => {
    ipcMain.on(events.validates.isAdmin, () => isAdmin(webContents));
}
