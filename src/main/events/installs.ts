import type { IpcMain, WebContents } from 'electron';
import { app } from 'electron';

import util from 'util';
import path from 'path';
import log from 'electron-log';
import { execFile as exec } from 'child_process';

import { linkToSideBar } from './linkSidebar';
import { events } from './constants';

// const exec = util.promisify(execFile);

const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'assets')
    : path.join(__dirname, '../../../assets');

  const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths);
  };

interface ListUnexpandedValues {
    path: string;
    exists: boolean;
    value: any;
}

interface ExecPromise {
  // error: ErrorConstructor;
  finishEventName: string;
  result: boolean;
}

const { choco, psexec, rclone, winfsp, awscli } = events.installs;
const scripts = ["choco", "psexec", "rclone", "winfsp", "awscli"];

const execInstallScript = (webContents: WebContents, scriptName: string) => {

  return new Promise<ExecPromise>((resolve, reject) => {
    if (!scripts.includes(scriptName)) {
        // eslint-disable-next-line @typescript-eslint/no-throw-literal
        reject(new Error("Script not exist"));
    }

    const finishEventName = `income-${scriptName}-setup-finish`;
    const dataEventName = `income-${scriptName}-setup-process`;

    const installBatFile = getAssetPath('script', `${scriptName}.bat`); // path.join(__dirname, '../install-tool-script', `${scriptName}.bat`);
    console.log('installBatFile', installBatFile);
    const proc = exec(installBatFile);

    proc.stdout?.on("data", (data) => {
        log.info(data);
        webContents.send(dataEventName, data.toString());
    })
    proc.stderr?.on("data", (data) => {
        log.info(data);
        webContents.send(dataEventName, data.toString());
    })

    proc.on("error", (data) => { log.error("[ERROR]", data.message) });

    proc.on("exit", (code, signal) => {
        console.log("[EXIT]", code);
        if (code === 0) {
            // webContents.send(finishEventName, true);
            resolve({finishEventName, result: true });
        } else {
            // webContents.send(finishEventName, false);
            resolve({finishEventName, result: false });
        }
    });

    // if (scriptName === 'rclone') {
    //     await linkToSideBar();
    // }
  });
}

const installChoco = async (webContents: WebContents) => {
  try {
    const { finishEventName, result } = await execInstallScript(webContents, "choco");
    webContents.send(finishEventName, result);
    console.log('choco_result', result);
  } catch (error) {
    console.error(error);
  }
}

const installPsexec = async (webContents: WebContents) => {
  try {
    const { finishEventName, result } = await execInstallScript(webContents, "psexec");
    webContents.send(finishEventName, result);
    console.log('cpsexec_result', result);
  } catch (error) {
    console.error(error);
  }
}

const installWinfsp = async (webContents: WebContents) => {
  try {
    const { finishEventName, result } = await execInstallScript(webContents, "winfsp");
    webContents.send(finishEventName, result);
    console.log('winfsp_result', result);
  } catch (error) {
    console.error(error);
  }
}

const installRclone = async (webContents: WebContents) => {
  try {
    const { finishEventName, result } = await execInstallScript(webContents, "rclone");
    webContents.send(finishEventName, result);
    console.log('rclone_result', result);
  } catch (error) {
    console.error(error);
  }
}

const installAwsCLI = async (webContents: WebContents) => {
  try {
    const { finishEventName, result } = await execInstallScript(webContents, "awscli");
    webContents.send(finishEventName, result);
    console.log('awscli_result', result);
  } catch (error) {
    console.error(error);
  }
}

export const initInstallsEventListener = (ipcMain: IpcMain, webContents: WebContents) => {
    ipcMain.on(choco, async () => {
      await installChoco(webContents);
    });

    ipcMain.on(psexec, async () => {
      await installPsexec(webContents);
    });

    ipcMain.on(winfsp, async () => {
      await installWinfsp(webContents);
    });

    ipcMain.on(rclone, async () => {
      await installRclone(webContents);
    });

    ipcMain.on(awscli, async () => {
      await installAwsCLI(webContents);
      // await linkToSideBar();
    });

    // ipcMain.on(psexec, () => installPsexec(webContents));

    // ipcMain.on(winfsp, () => installWinfsp(webContents));

    // ipcMain.on(rclone, () => installRclone(webContents));
}
