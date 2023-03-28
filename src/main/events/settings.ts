/* eslint-disable @typescript-eslint/no-loop-func */
/* eslint-disable promise/always-return */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import { App, dialog, IpcMain, WebContents, Notification } from 'electron';
import { exec, execSync } from 'child_process';
import log from 'electron-log';
import findProcess from 'find-process';
import path from 'path';
import fs from 'fs';
import { events } from './constants';
// const AutoLaunch = require('auto-launch');

interface ConnectWithRclonePayload {
  access_key: string;
  access_secret: string;
  endpoint: string;
  region: string;
  provider: string;
}

const psexecCmd = 'psexec -accepteula -nobanner -s';

const connectWithRclone = (
  webContents: WebContents,
  values: ConnectWithRclonePayload
) => {
  const eventName = events.settings.rclone.connectResult;
  if (
    values &&
    values.access_key &&
    values.access_secret &&
    values.endpoint &&
    values.region
  ) {
    const exeArgsString = `${psexecCmd} rclone config create ${values.provider} s3 provider Ceph env_auth false access_key_id ${values.access_key} secret_access_key ${values.access_secret} region ${values.region} endpoint ${values.endpoint}`;
    exec(exeArgsString, (err, data, se) => {
      if (err) {
        log.error(`connect with rclone: ${err}`);
        webContents.send(eventName, false);
        return;
      }
      log.info(data.toString());
      webContents.send(eventName, true);
    });

    exec(
      `rclone config create ${values.provider} s3 provider Ceph env_auth false access_key_id ${values.access_key} secret_access_key ${values.access_secret} region ${values.region} endpoint ${values.endpoint}`
    );
    return;
  }

  webContents.send(eventName, null);
};

const checkConfig = (webContents: WebContents, name: string) => {
  // const exec = require('child_process').exec;
  // const rclone = path.join(__dirname, 'rclone.exe');
  const eventName = events.settings.rclone.checkConfigResult;
  exec(`rclone lsf ${name}:`, (err, data, stderr) => {
    if (err) {
      log.error(err);
      webContents.send(eventName, false);
      return;
    }
    // const result = data.toString();
    // console.log('result', result);
    // console.log('stderr', stderr);
    // let incomeResult = false;
    // if (result && result !== "") {
    // ipcRenderer.send("check-config-result", true)
    // incomeResult = true;
    // }
    // log.info(`income-check-config-result: ${incomeResult}`);
    webContents.send(eventName, true);
  });
};

const getBucketList = (webContents: WebContents, name: string) => {
  const eventName = events.settings.rclone.getBucketListResult;
  exec(`rclone lsf ${name}:`, (err, stdout, stderr) => {
    if (err) {
      log.error('Error while get buckets', err.message);
      return webContents.send(eventName, {
        success: false,
        data: [],
      });
    }
    log.info(stdout);
    // log.info(stderr);

    const list = stdout
      .toString()
      .split('\n')
      .filter((bucket) => bucket !== '')
      .map((bucket) => {
        const bucketName = bucket.replace('/', '');
        return {
          value: bucketName,
          label: bucketName,
        };
      });

    // list.unshift({
    //     value: "all",
    //     label: "Tất cả"
    // });
    log.info('[BUCKETS]', list);

    return webContents.send(eventName, {
      success: true,
      data: list,
    });
  });
};

const mountDisk = (
  webContents: WebContents,
  mountOpts: { configName: string; bucketName: string }
) => {
  const eventName = events.settings.rclone.mountResult;
  exec(
    `${psexecCmd} -d rclone mount ${mountOpts.configName}:${mountOpts.bucketName} * --vfs-cache-mode full`,
    (err, data, stderr) => {
      if (err) {
        log.info('[==== MOUNT DISK ERROR ====]');
        log.error('code', err.code?.toString());
        log.error('message', err.message);
        log.error('signal', err.signal);
        log.info('[==== END ====]');
        // eslint-disable-next-line prefer-const
        let mountResult: {
          isMounted: boolean;
          pid?: number | null;
          currentMount: {
            configName: string;
            bucketName: string;
            ppid?: number;
          };
        } = {
          isMounted: false,
          pid: null,
          currentMount: {
            ...mountOpts,
            ppid: undefined,
          },
        };
        if (err.signal === null && err.message.includes('rclone started on')) {
          mountResult.isMounted = true;
          mountResult.pid = err.code;
          mountResult.currentMount.ppid = err.code;
        }
        return webContents.send(eventName, mountResult);
      }

      return webContents.send(eventName, true);
    }
  );
};

const unMountDisk = (webContents: WebContents, pid: any) => {
  const eventName = events.settings.rclone.unmountResult;
  exec(`taskkill /im rclone.exe /t /f`, (err, stdout, stderr) => {
    if (err) {
      log.info('[==== UNMOUNT DISK ERROR ====]');
      log.error(err.message);
      log.info('[==== END ====]');
      return webContents.send(eventName, false);
    }

    if (stdout) log.info('[STDOUT]', stdout);
    if (stderr) log.info('[STDERR]', stderr);
    return webContents.send(eventName, true);
  });
};

const configsDump = (webContents: WebContents) => {
  const eventName = events.settings.rclone.configsDumpResult;
  exec(`rclone config dump`, (err, stdout, stderr) => {
    if (err) {
      log.info('[==== CONFIG DUMP ERROR ====]');
      log.error(err.message);
      log.info('[==== END ====]');
      return webContents.send(eventName, false);
    }

    if (stderr) {
      console.error('stderr', stderr);
    }

    let configs = false;
    if (stdout) {
      try {
        configs = JSON.parse(stdout);
      } catch (parseErr: any) {
        log.error('CONFIG_DUMP_ERROR', parseErr);
      }
    }

    return webContents.send(eventName, configs);
  });
};

const configDelete = (webContents: WebContents, name: string) => {
  const eventName = events.settings.rclone.configDeleteResult;
  exec(`rclone config delete ${name}`, (err, stdout, stderr) => {
    if (err) {
      log.info('[==== CONFIG DELETE ERROR ====]');
      log.error(err.message);
      log.info('[==== END ====]');
      return webContents.send(eventName, false);
    }

    if (stderr) console.log('stderr', stderr);
    if (stdout) console.log('stdout', stdout);

    return webContents.send(eventName, true);
  });
};

const unmountSelectedBucket = (webContents: WebContents, ppid: number) => {
  const eventName = events.settings.rclone.unmountSelectedResult;
  exec(`taskkill /pid ${ppid} /t /f`, (err, stdout, stderr) => {
    if (err) {
      log.info('[==== UNMOUNT DISK ERROR ====]');
      log.error(err.message);
      log.info('[==== END ====]');
      return webContents.send(eventName, { delete: ppid, status: false });
    }

    if (stdout) log.info('[STDOUT]', stdout);
    if (stderr) log.info('[STDERR]', stderr);
    return webContents.send(eventName, { delete: ppid, status: true });
  });
};

interface IMounted {
  bucketName: string;
  configName: string;
  ppid?: number;
}

const execMountStartup = (item: IMounted, results: Array<IMounted>) => {
  return new Promise<IMounted>((resolve, reject) => {
    const proc = exec(
      `${psexecCmd} -d rclone mount ${item.configName}:${item.bucketName} * --vfs-cache-mode full`
    );
    proc.stdout?.on('error', (err) => {
      log.info('[==== MOUNT DISK ERROR ====]');
      log.error('name:', err.name);
      log.error('message:', err.message);
      log.info('[==== END ====]');
    });

    proc.on('exit', (code, signal) => {
      log.info('[==== MOUNT DISK CODE & SIGNAL ====]');
      log.info('code:', code?.toString());
      log.info('signal:', signal);
      log.info('[==== END ====]');
      if (signal === null) {
        resolve({
          configName: item.configName,
          bucketName: item.bucketName,
          ppid: code ?? undefined,
        });

        // results.push({
        //   configName: item.configName,
        //   bucketName: item.bucketName,
        //   ppid: code ?? undefined
        // });
      }
    });
    // try {
    //   const proc = execSync(`${psexecCmd} rclone mount ${item.configName}:${item.bucketName} * --vfs-cache-mode full`, {windowsHide: true}).toString();
    //   console.log('proc', proc);
    //   resolve({
    //     configName: item.configName,
    //     bucketName: item.bucketName,
    //     ppid: undefined
    //   });
    // } catch (err: any) {
    //   log.error("[ERR][MOUNT_AT_STARTUP]", err);
    //   reject(err.message);
    // }
  });
};

const mountedAtStartup = async (
  webContents: WebContents,
  arr: Array<IMounted>
) => {
  const eventName = events.settings.rclone.mountedAtStartupResult;

  const processList = await findProcess('name', 'rclone.exe');
  console.log('processList', processList);

  if (processList.length > 0) {
    console.log('run here');
    return webContents.send(eventName, []);
  }

  const results: Array<IMounted> = [];
  // await arr.forEach(async (item) => {
  //   const execResult = await execMountStartup(item, results);
  //   results.push({ ...execResult })
  // });

  // await Promise.all(arr.map(async (item) => {
  //   const execResult = await execMountStartup(item, results);
  //   results.push({ ...execResult });
  // }));

  const notiSupport = Notification.isSupported();
  let waitNoti;
  let resultNoti;
  if (notiSupport) {
    waitNoti = new Notification({
      title: 'Đang mount Fstorage...',
      body: 'Vui lòng chờ',
    });
    waitNoti.show();
  }

  // eslint-disable-next-line no-plusplus, no-restricted-syntax
  for await (const item of arr) {
    const execResult = await execMountStartup(item, results);
    results.push({ ...execResult });
  }

  console.log('results', results);

  if (results && notiSupport) {
    waitNoti?.close();
    resultNoti = new Notification({
      title: 'Mount Thành Công',
    });
    resultNoti.show();
  }

  return webContents.send(eventName, results);
};

// const initTask = async (isEnabled?: boolean) => {
//   const tasks = await cronbee.load();
//   const fstorageTask = tasks.find((task) => (task.name === 'fstorage-mount-tool'));

//   if (fstorageTask !== undefined) {
//     await cronbee.remove({ taskName: 'fstorage-mount-tool' });
//   }

//   let isActive = false;
//   if ( isEnabled === undefined ) {
//     isActive = fstorageTask?.enabled
//   }
//   await cronbee.ensure({
//     taskName: 'fstorage-mount-tool',
//     taskRun: process.execPath,
//     active: isActive,
//     schtaskFlags: `/sc onlogon${isActive ? ' /ENABLE' : ' /DISABLE'}`
//   });

//   return isActive;

// }

function taskQuery(taskName: string) {
  return new Promise<string>((resolve, reject) => {
    try {
      const command = `cmd /c schtasks /query /tn ${taskName} /fo LIST 2> nul`;
      const result = execSync(command, { windowsHide: true }).toString();
      resolve(result);
    } catch (err: any) {
      log.error('[ERROR][taskQuery]: ', err);
      reject(new Error('Task query error: maybe taskname not found'));
    }
  });
}

function taskCreate(taskName: string) {
  return new Promise((resolve, reject) => {
    try {
      const tr = process.execPath;
      const command = `cmd /c schtasks /create /tn ${taskName} /tr "'${tr}' --hide" /rl HIGHEST /sc onlogon`;
      const result = execSync(command, { windowsHide: true }).toString();
      resolve(result);
    } catch (err: any) {
      log.error('[ERROR][taskCreate]: ', err);
      reject(err.message);
    }
  });
}

const getRunAtStartup = async (app: App, webContents: WebContents) => {
  const eventName = events.settings.rclone.getRunAtStartupResult;
  // const loginItemSettings = app.getLoginItemSettings();
  // if (loginItemSettings) {
  //   const { openAtLogin } = loginItemSettings;
  //   console.log("openAtLogin", openAtLogin);
  //   return webContents.send(eventName, openAtLogin);
  // }
  // return webContents.send(eventName, undefined);
  const taskName = 'fstorage-mount-tool';
  let canGetTask = true;
  // let canCreateTask = null;
  try {
    const fstorageTask: string = await taskQuery(taskName);

    const lines = fstorageTask.split('\n');
    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < lines.length; i++) {
      const pair = lines[i].split(':');
      if (pair.length > 1) {
        const key = pair[0].trim();
        const value = pair[1].trim();
        if (key === 'Status') {
          const isEnabled = value === 'Ready' || value === 'Running';
          return webContents.send(eventName, isEnabled);
        }
      }
    }
  } catch (err) {
    // console.log('get_err', err);
    canGetTask = false;
  }

  if (!canGetTask) {
    try {
      // eslint-disable-next-line no-useless-escape

      // await task.create(taskName, `"${process.execPath.replaceAll("\\", "\\\\")}"`, {
      //   frequency: 'ONLOGON',
      //   asUser: true,
      //   highlevel: true
      // });
      const result = await taskCreate(taskName);
      console.log(result);

      return webContents.send(eventName, true);
    } catch (err) {
      console.log('create_error', err);
    }
  }

  try {
    // await sc.create(taskName, {
    //   taskRun: `'${process.execPath}'`,
    //   schedule: 'onlogon'
    // });
    // const tasks = await cronbee.load();
    // // filter the task by name
    // const fstorageTask = tasks.find((task) => (task.name === 'fstorage-mount-tool'));
    // console.log('fstorageTask', fstorageTask);
    // // if not exist task, create it
    // if (fstorageTask === undefined) {
    //   await cronbee.ensure({
    //     taskName: 'fstorage-mount-tool',
    //     taskRun: `'${process.execPath}'`,
    //     active: false,
    //     schtaskFlags: '/sc onlogon'
    //   });

    //   const proc = exec(`schtasks /change /tn "fstorage-mount-tool" /tr "'${process.execPath}'" /rl HIGHEST /DISABLE`);
    //   proc.stderr?.on("data", (chunk) => {
    //     console.log("stderr", chunk);
    //   })
    //   proc.stdout?.on("data", (chunk) => {
    //     console.log("stdout", chunk);
    //   });
    //   proc.on("error", (error) => {
    //     console.log("error", error.message);
    //   });

    //   return webContents.send(eventName, false);
    // }

    // const taskStatus = fstorageTask.enabled;
    // if (typeof taskStatus === 'boolean') {
    //   return webContents.send(eventName, taskStatus);
    // }

    return webContents.send(eventName, undefined);
  } catch (error) {
    log.error('[ERROR][getRunAtStartup]:', error);
    return webContents.send(eventName, undefined);
  }

  // const isTaskEnabled = fstorageTask?.enabled;
  // if (fstorageTask === undefined || isTaskEnabled === undefined) {
  //   return webContents.send(eventName, undefined);
  // }
  // return webContents.send(eventName, isTaskEnabled);

  // try {
  //   const isTaskEnabled = await initTask();
  //   return webContents.send(eventName, isTaskEnabled);
  // } catch (error) {
  //   return webContents.send(eventName, undefined);
  // }
};

const setRunAtStartup = async (
  app: App,
  webContents: WebContents,
  isEnabled: boolean
) => {
  const eventName = events.settings.rclone.setRunAtStartupResult;
  // try {
  //   let itemSettings = {
  //     openAtLogin: false,
  //     openAsHidden: false,
  //   }
  //   if (isEnabled===true) {
  //     itemSettings = {
  //       openAtLogin: true,
  //       openAsHidden: true,
  //     }
  //   }

  //   app.setLoginItemSettings(itemSettings);
  //   return webContents.send(eventName, true);
  // } catch (err: any) {
  //   console.error('==== SET RUN AT STARTUP ERROR ====', err);
  //   return webContents.send(eventName, false);
  // }

  try {
    // const tasks = await cronbee.load();
    // // filter the task by name
    // const fstorageTask = tasks.find((task) => (task.name === 'fstorage-mount-tool'));

    // if (fstorageTask !== undefined) {
    //   await cronbee.remove({ taskName: 'fstorage-mount-tool' });
    // }

    // await cronbee.ensure({
    //   taskName: 'fstorage-mount-tool',
    //   taskRun: process.execPath,
    //   active: isEnabled,
    //   schtaskFlags: `/sc onlogon`
    // });
    const statusFlag = isEnabled ? '/ENABLE' : '/DISABLE';
    exec(
      `schtasks /change /tn "fstorage-mount-tool" ${statusFlag}`,
      (error, stdout, stderr) => {
        if (error) {
          log.error('[ERROR][setRunAtStartup]:', error);
        }

        if (stderr) console.log('stderr', stderr);
        if (stdout) console.log('stdout', stdout);
      }
    );

    // await initTask(isEnabled);
    return webContents.send(eventName, true);
  } catch (error) {
    log.info('==== set run at startup error ====');
    log.error(error);
    log.info('==== END ====');
    return webContents.send(eventName, false);
  }
};

// ngandh2 begin
let dataArr: any = [];
let dataErr: any = [];

const getVersion = (app: App, webContents: WebContents) => {
  const eventName = events.settings.rclone.getVersionResult;
  const curVer = app.getVersion();
  webContents.send(eventName, curVer);
};

const getFileList = (webContents: WebContents, pathFile: string) => {
  const eventName = events.settings.rclone.getFileListResult;
  // --no-modtime
  exec(
    `rclone lsjson -M --no-mimetype --no-modtime "Fstorage:${pathFile}"`,
    { maxBuffer: 1024 * 1024 * 2000 },
    (err, stdout, stderr) => {
      if (err) {
        log.error('Error while get file', err.message);
        return webContents.send(eventName, {
          success: false,
          data: [],
        });
      }
      log.info(stdout);
      let dataRes = JSON.parse(stdout);
      // eslint-disable-next-line no-plusplus
      for (let i = 0; i < dataArr.length; i++) {
        if (dataArr[i].action === 'delete' && dataArr[i].status === 'loading') {
          if (dataArr[i].type === 'file') {
            dataRes = dataRes.filter(
              (item: any) =>
                item.Name !== dataArr[i].name && item.IsDir !== true
            );
          } else if (dataArr[i].type === 'folder') {
            dataRes = dataRes.filter(
              (item: any) =>
                item.Name !== dataArr[i].name && item.IsDir !== false
            );
          }
        }
      }

      return webContents.send(eventName, {
        success: true,
        data: dataRes,
      });
    }
  );
};

interface ExecPromise {
  eventName: string;
  result: boolean;
}

const uploadFile = (
  webContents: WebContents,
  pathStorage: string,
  transfer: number
) => {
  // 'multiSelections'
  return new Promise<ExecPromise>((resolve, reject) => {
    const eventName = events.settings.rclone.uploadFileResult;
    const eventProcess = events.settings.rclone.uploadFileProcessResult;
    dialog
      .showOpenDialog({ properties: ['openFile'] })
      .then((result) => {
        if (result.canceled === false) {
          const nameFile = result.filePaths[0]?.slice(
            result.filePaths[0].lastIndexOf('\\') + 1,
            result.filePaths[0].length
          );

          const checkExist = dataArr.findIndex(
            (item: {
              name: string;
              type: string;
              action: string;
              status: string;
              pathSto: string;
            }) =>
              item.name === nameFile &&
              item.type === 'file' &&
              item.action === 'upload' &&
              item.status === 'loading' &&
              item.pathSto === pathStorage
          );
          if (checkExist !== -1) {
            webContents.send(eventProcess, {
              success: false,
              data: dataArr,
            });
          } else {
            dataArr.push({
              name: nameFile,
              path: result.filePaths[0],
              pathSto: pathStorage,
              action: 'upload',
              status: 'loading',
              process: ['', ''],
              type: 'file',
              pid: '',
              error: [''],
            });
            webContents.send(eventProcess, dataArr);
            const i = dataArr.findIndex(
              (item: {
                name: string;
                type: string;
                action: string;
                status: string;
              }) =>
                item.name === nameFile &&
                item.type === 'file' &&
                item.action === 'upload' &&
                item.status === 'loading'
            );
            const proc = exec(
              `rclone copy --no-check-dest --s3-chunk-size=32Mi --s3-upload-concurrency=16 --checkers=16 --transfers=${transfer} -P "${dataArr[i].path}" "Fstorage:${dataArr[i].pathSto}"`,
              { maxBuffer: 1024 * 1024 * 2000 }
            );
            dataArr[i].pid = proc.pid;
            proc.stdout?.on('data', (data) => {
              log.info(data);
              const temp = data.toString();
              let temp2 = temp?.slice(
                temp.indexOf('Transferred') + 12,
                temp.lastIndexOf('Transferred')
              );
              temp2 = temp2.split(',');
              // eslint-disable-next-line prefer-destructuring
              dataArr[i].process[0] = temp2[0];
              dataArr[i].process[1] = temp2[1]?.slice(0, temp.indexOf('%') - 1);
              // eslint-disable-next-line prefer-destructuring
              dataArr[i].process[2] = temp2[2];
              webContents.send(eventName, dataArr);
            });

            proc.on('error', (data) => {
              log.error('[ERROR]', data.message);
              webContents.send(eventName, dataArr);
            });

            proc.on('exit', (code, signal) => {
              log.info(code);
              if (code === 0 || code === null) {
                dataArr[i].status = 'done';
                webContents.send(eventName, dataArr);
                // resolve({ eventName, result: true });
              } else {
                dataArr[i].status = 'fail';
                webContents.send(eventName, dataArr);
                // resolve({ eventName, result: false });
              }
            });
          }
        }
      })
      .catch((err) => {
        console.log(err);
      });
  });
};

const uploadFolder = (
  webContents: WebContents,
  pathStorage: string,
  transfer: number
) => {
  return new Promise<ExecPromise>((resolve, reject) => {
    const eventName = events.settings.rclone.uploadFolderResult;
    const eventProcess = events.settings.rclone.uploadFileProcessResult;

    dialog
      .showOpenDialog({ properties: ['openDirectory'] })
      .then((result) => {
        if (result.canceled === false) {
          const pathFolder = result.filePaths[0];
          const nameFolder = pathFolder?.slice(
            pathFolder.lastIndexOf('\\') + 1,
            pathFolder.length
          );
          const checkExist = dataArr.findIndex(
            (item: {
              name: string;
              type: string;
              action: string;
              status: string;
              pathSto: string;
            }) =>
              item.name === nameFolder &&
              item.type === 'folder' &&
              item.action === 'upload' &&
              item.status === 'loading' &&
              item.pathSto === pathStorage
          );
          if (checkExist !== -1) {
            webContents.send(eventProcess, {
              success: false,
              data: dataArr,
            });
          } else {
            dataArr.push({
              name: nameFolder,
              path: pathFolder,
              pathSto: pathStorage,
              action: 'upload',
              status: 'loading',
              process: ['', '', ''],
              error: [''],
              type: 'folder',
              pid: '',
            });
            webContents.send(eventProcess, {
              success: true,
              data: dataArr,
            });

            const i = dataArr.findIndex(
              (item: {
                name: string;
                type: string;
                action: string;
                status: string;
                pathSto: string;
              }) =>
                item.name === nameFolder &&
                item.type === 'folder' &&
                item.action === 'upload' &&
                item.status === 'loading' &&
                item.pathSto === pathStorage
            );

            const proc = exec(
              `rclone copy --no-check-dest --s3-chunk-size=32Mi --s3-upload-concurrency=16 --checkers=32 --transfers=${transfer} -P "${dataArr[i].path}" "Fstorage:${dataArr[i].pathSto}${dataArr[i].name}/"`
            );
            dataArr[i].pid = proc.pid;
            proc.stdout?.on('data', (data) => {
              log.info(data);
              const temp = data.toString();
              if (
                temp.indexOf('ERROR') !== -1 &&
                temp.indexOf('Attempt') === -1
              ) {
                dataErr.push(
                  temp.slice(
                    temp.indexOf('ERROR') + 7,
                    temp.indexOf('copy') + 4
                  )
                );
              }
              let temp2 = temp?.slice(
                temp.indexOf('Transferred') + 12,
                temp.lastIndexOf('Transferred')
              );
              temp2 = temp2.split(',');
              // eslint-disable-next-line prefer-destructuring
              dataArr[i].process[0] = temp2[0];
              dataArr[i].process[1] = temp2[1]?.slice(0, temp.indexOf('%') - 1);
              // eslint-disable-next-line prefer-destructuring
              dataArr[i].process[2] = temp2[2];
              webContents.send(eventName, dataArr);
            });

            proc.on('error', (data) => {
              log.info('err >>>', data);
              dataErr.push(data);
              webContents.send(eventName, dataArr);
            });

            proc.on('exit', (code, signal) => {
              log.info('code>>', code);
              log.info('signal>>', signal);
              if (code === 0 || code === null) {
                dataArr[i].status = 'done';
                webContents.send(eventName, dataArr);
              } else {
                dataArr[i].status = 'fail';
                log.info('ERR>>>', dataErr);
                dataArr[i].error = dataErr;
                webContents.send(eventName, dataArr);
              }
            });
            dataErr = [];
          }
        }
      })
      .catch((err) => {
        console.log(err);
      });
  });
};

const clearProcess = (webContents: WebContents) => {
  const eventProcess = events.settings.rclone.uploadFileProcessResult;
  dataArr = [];
  return webContents.send(eventProcess, dataArr);
};

const downloadFile = (
  webContents: WebContents,
  pathStorage: string,
  transfer: number
) => {
  return new Promise<ExecPromise>((resolve, reject) => {
    const eventName = events.settings.rclone.downloadFileResult;
    const eventProcess = events.settings.rclone.uploadFileProcessResult;

    dialog
      .showOpenDialog({ properties: ['openDirectory'] })
      .then((result) => {
        if (result.canceled === false) {
          const pathFolder = result.filePaths[0];
          const nameFile = pathStorage?.slice(
            pathStorage.lastIndexOf('/') + 1,
            pathStorage.length
          );

          const checkExist = dataArr.findIndex(
            (item: {
              name: string;
              type: string;
              action: string;
              status: string;
              path: string;
            }) =>
              item.name === nameFile &&
              item.type === 'file' &&
              item.action === 'download' &&
              item.status === 'loading' &&
              item.path === pathFolder
          );
          if (checkExist !== -1) {
            webContents.send(eventProcess, {
              success: false,
              data: dataArr,
            });
          } else {
            dataArr.push({
              name: nameFile,
              path: pathFolder,
              pathSto: pathStorage,
              action: 'download',
              process: ['', '', ''],
              type: 'file',
              status: 'loading',
              pid: '',
              error: [],
            });
            webContents.send(eventProcess, dataArr);
            const i = dataArr.findIndex(
              (item: {
                name: string;
                type: string;
                action: string;
                status: string;
                path: string;
              }) =>
                item.name === nameFile &&
                item.type === 'file' &&
                item.action === 'download' &&
                item.status === 'loading' &&
                item.path === pathFolder
            );
            const proc = exec(
              `rclone copy --no-check-dest --transfers=${transfer} -P "Fstorage:${dataArr[i].pathSto}" "${dataArr[i].path}"`
            );
            dataArr[i].pid = proc.pid;
            proc.stdout?.on('data', (data) => {
              log.info(data);
              const temp = data.toString();
              let temp2 = temp?.slice(
                temp.indexOf('Transferred') + 12,
                temp.lastIndexOf('Transferred')
              );
              temp2 = temp2.split(',');
              // eslint-disable-next-line prefer-destructuring
              dataArr[i].process[0] = temp2[0];
              dataArr[i].process[1] = temp2[1]?.slice(0, temp.indexOf('%') - 1);
              // eslint-disable-next-line prefer-destructuring
              dataArr[i].process[2] = temp2[2];
              webContents.send(eventName, dataArr);
            });

            proc.on('error', (data) => {
              log.error('[ERROR]', data.message);
              webContents.send(eventName, dataArr);
            });

            proc.on('exit', (code, signal) => {
              log.info('code>>', code);
              log.info('signal>>', signal);
              if (code === 0 || code === null) {
                dataArr[i].status = 'done';
                webContents.send(eventName, dataArr);
              } else {
                dataArr[i].status = 'fail';
                webContents.send(eventName, dataArr);
              }
            });
          }
        }
      })
      .catch((err) => {
        console.log(err);
      });
  });
};

const downloadFolder = (
  webContents: WebContents,
  pathStorage: string,
  transfer: number
) => {
  return new Promise<ExecPromise>((resolve, reject) => {
    const eventName = events.settings.rclone.downloadFolderResult;
    const eventProcess = events.settings.rclone.uploadFileProcessResult;
    dialog
      .showOpenDialog({ properties: ['openDirectory'] })
      .then((result) => {
        if (result.canceled === false) {
          let pathFolder = result.filePaths[0];
          const nameFolder = pathStorage?.slice(
            pathStorage.lastIndexOf('/') + 1,
            pathStorage.length
          );
          pathFolder += `\\${nameFolder}`;

          const checkExist = dataArr.findIndex(
            (item: {
              name: string;
              type: string;
              action: string;
              status: string;
              path: string;
            }) =>
              item.name === nameFolder &&
              item.type === 'folder' &&
              item.action === 'download' &&
              item.status === 'loading' &&
              item.path === pathFolder
          );

          if (checkExist !== -1) {
            webContents.send(eventProcess, {
              success: false,
              data: dataArr,
            });
          } else {
            dataArr.push({
              name: nameFolder,
              path: pathFolder,
              pathSto: pathStorage,
              action: 'download',
              process: ['', '', ''],
              type: 'folder',
              status: 'loading',
              error: [],
            });
            webContents.send(eventProcess, dataArr);
            const i = dataArr.findIndex(
              (item: {
                name: string;
                type: string;
                action: string;
                status: string;
                path: string;
              }) =>
                item.name === nameFolder &&
                item.type === 'folder' &&
                item.action === 'download' &&
                item.status === 'loading' &&
                item.path === pathFolder
            );
            const proc = exec(
              `rclone copy --no-check-dest --transfers=${transfer} -P "Fstorage:${dataArr[i].pathSto}" "${dataArr[i].path}"`
            );
            dataArr[i].pid = proc.pid;
            proc.stdout?.on('data', (data) => {
              log.info(data);
              const temp = data.toString();
              let temp2 = temp?.slice(
                temp.indexOf('Transferred') + 12,
                temp.lastIndexOf('Transferred')
              );
              temp2 = temp2.split(',');
              // eslint-disable-next-line prefer-destructuring
              dataArr[i].process[0] = temp2[0];
              dataArr[i].process[1] = temp2[1]?.slice(0, temp.indexOf('%') - 1);
              // eslint-disable-next-line prefer-destructuring
              dataArr[i].process[2] = temp2[2];
              webContents.send(eventName, dataArr);
            });
            proc.on('error', (data) => {
              log.error('[ERROR]', data.message);
              // dataArr[i].status = 'fail';
              webContents.send(eventName, dataArr);
            });

            proc.on('exit', (code, signal) => {
              log.info('code>>', code);
              log.info('signal>>', signal);
              if (code === 0 || code === null) {
                dataArr[i].status = 'done';
                webContents.send(eventName, dataArr);
              } else {
                dataArr[i].status = 'fail';
                webContents.send(eventName, dataArr);
              }
            });
          }
        }
      })
      .catch((err) => {
        console.log(err);
      });
  });
};

const getProcessList = (webContents: WebContents) => {
  const eventProcess = events.settings.rclone.uploadFileProcessResult;
  return webContents.send(eventProcess, dataArr);
};

const refreshProcessList = (webContents: WebContents) => {
  const eventProcess = events.settings.rclone.uploadFileProcessResult;
  return webContents.send(eventProcess, dataArr);
};

const deleteFile = (
  webContents: WebContents,
  nameFile: string,
  pathFile: string
) => {
  return new Promise<ExecPromise>((resolve, reject) => {
    const eventProcess = events.settings.rclone.uploadFileProcessResult;
    const eventName = events.settings.rclone.deleteResult;

    dataArr.push({
      name: nameFile,
      pathStr: pathFile,
      action: 'delete',
      process: ['', ''],
      type: 'file',
      status: 'loading',
      pid: '',
      error: [],
    });
    webContents.send(eventProcess, dataArr);
    const i = dataArr.findIndex(
      (item: { name: string; type: string; action: string; status: string }) =>
        item.name === nameFile &&
        item.type === 'file' &&
        item.action === 'delete' &&
        item.status === 'loading'
    );
    const proc = exec(
      `rclone delete -P "Fstorage:${dataArr[i].pathStr}${dataArr[i].name}"`
    );
    dataArr[i].pid = proc.pid;
    proc.stdout?.on('data', (data) => {
      log.info(data);
      const temp = data.toString();
      let temp2 = temp?.slice(
        temp.indexOf('Deleted') + 8,
        temp.indexOf('Elapsed')
      );
      temp2 = temp2.split(',');
      // eslint-disable-next-line prefer-destructuring
      dataArr[i].process[0] = temp2[0];
      // dataArr[i].process[1] = temp2[1].slice(0, temp.indexOf('%') - 1);
      webContents.send(eventName, {
        success: false,
        data: dataArr,
      });
    });

    proc.on('error', (data) => {
      log.error('[ERROR]', data.message);
      webContents.send(eventName, {
        success: false,
        data: dataArr,
      });
    });

    proc.on('exit', (code, signal) => {
      log.info('[EXIT]', code);
      if (code === 0) {
        dataArr[i].status = 'done';
        webContents.send(eventName, {
          success: true,
          data: dataArr,
        });
      } else {
        dataArr[i].status = 'fail';
        webContents.send(eventName, {
          success: true,
          data: dataArr,
        });
      }
    });
  });
};

const deleteFolder = (
  webContents: WebContents,
  nameFile: string,
  pathFolder: string
) => {
  return new Promise<ExecPromise>((resolve, reject) => {
    const eventProcess = events.settings.rclone.uploadFileProcessResult;
    const eventName = events.settings.rclone.deleteResult;

    dataArr.push({
      name: nameFile,
      pathStr: pathFolder,
      action: 'delete',
      process: ['', ''],
      type: 'folder',
      status: 'loading',
      pid: '',
      error: [],
    });
    webContents.send(eventProcess, dataArr);
    const i = dataArr.findIndex(
      (item: { name: string; type: string; action: string; status: string }) =>
        item.name === nameFile &&
        item.type === 'folder' &&
        item.action === 'delete' &&
        item.status === 'loading'
    );
    const proc = exec(
      `rclone purge -P "Fstorage:${dataArr[i].pathStr}${dataArr[i].name}"`,
      { maxBuffer: 1024 * 1024 * 2000 }
    );
    dataArr[i].pid = proc.pid;
    proc.stdout?.on('data', (data) => {
      log.info(data);
      const temp = data.toString();
      let temp2 = temp?.slice(
        temp.indexOf('Deleted') + 8,
        temp.indexOf('Elapsed')
      );
      temp2 = temp2.split(',');
      // eslint-disable-next-line prefer-destructuring
      dataArr[i].process[0] = temp2[0];
      // dataArr[i].process[1] = temp2[1].slice(0, temp.indexOf('%') - 1);
      webContents.send(eventName, {
        success: false,
        data: dataArr,
      });
    });

    proc.on('error', (data) => {
      log.error('[ERROR]', data.message);
      // dataArr[i].status = 'fail';
      webContents.send(eventName, {
        success: false,
        data: dataArr,
      });
    });

    proc.on('exit', (code, signal) => {
      log.info('[EXIT]', code);
      if (code === 0) {
        dataArr[i].status = 'done';
        webContents.send(eventName, {
          success: true,
          data: dataArr,
        });
      } else {
        dataArr[i].status = 'fail';
        webContents.send(eventName, {
          success: true,
          data: dataArr,
        });
      }
    });
  });
};

const createBucket = (webContents: WebContents, name: string) => {
  const eventName = events.settings.rclone.createBucketResult;
  exec(`rclone mkdir -P "Fstorage:${name}"`, (err, stdout, stderr) => {
    if (err) {
      log.error('Error while create bucket', err.message);
      return webContents.send(eventName, {
        success: false,
        message: err.message,
      });
    }
    log.info(stdout);
    return webContents.send(eventName, {
      success: true,
      message: stdout,
    });
  });
};

const cancelProcess = (webContents: WebContents, pid: string) => {
  exec(`taskkill /pid ${pid} /t /f`, (err, stdout, stderr) => {
    if (err) {
      log.info('[==== CANCEL PROCESS ERROR ====]');
      log.error(err.message);
      log.info('[==== END ====]');
    }
    if (stdout) log.info('[STDOUT]', stdout);
    if (stderr) log.info('[STDERR]', stderr);
  });
};

const getDetailDir = (
  webContents: WebContents,
  _name: string,
  _path: string
) => {
  const eventName = events.settings.rclone.getDetailDirResult;
  exec(
    `rclone size --json "Fstorage:${_path}${_name}"`,
    (err, stdout, stderr) => {
      // eslint-disable-next-line prefer-const
      let res = {
        name: _name,
        size: 0,
        time: '',
        path: _path,
        object: '',
      };
      let flagBoolean = true;
      if (err) {
        log.error('Error while get size dir', err.message);
        flagBoolean = false;
      }
      log.info(stdout);
      res.size = parseFloat(JSON.parse(stdout).bytes.toString());
      res.object = JSON.parse(stdout).count.toString();
      exec(`rclone lsd "Fstorage:${_path}"`, (err2, stdout2, stderr2) => {
        if (err) {
          log.error('Error while get lsd dir', err.message);
          flagBoolean = false;
        }
        log.info(stdout2);
        res.time = stdout2.slice(
          stdout2.indexOf(_name) - 30,
          stdout2.indexOf(_name) - 11
        );
        webContents.send(eventName, {
          flagBoolean,
          res,
        });
      });
    }
  );
};

const getFolderSync = (webContents: WebContents, buttonId: string) => {
  const eventName = events.settings.rclone.getFolderSyncResult;
  const pathRes = dialog.showOpenDialogSync({ properties: ['openDirectory'] });

  if (buttonId === 'left') {
    webContents.send(eventName, {
      id: 'left',
      path: pathRes,
    });
  }
  if (buttonId === 'right') {
    webContents.send(eventName, {
      id: 'right',
      path: pathRes,
    });
  }
};

const getFolderList = (webContents: WebContents, pathFolder: string) => {
  const eventName = events.settings.rclone.getFolderListResult;
  exec(
    `rclone lsjson --no-mimetype --no-modtime --dirs-only "Fstorage:${pathFolder}"`,
    { maxBuffer: 1024 * 1024 * 2000 },
    (err, stdout, stderr) => {
      if (err) {
        log.error('Error while get file', err.message);
        return webContents.send(eventName, {
          success: false,
          data: [],
        });
      }
      log.info(stdout);
      return webContents.send(eventName, {
        success: true,
        data: JSON.parse(stdout),
      });
    }
  );
};

// eslint-disable-next-line prefer-const
let dataSync: any = [];

const manualSync = (
  webContents: WebContents,
  id: string,
  pathFrom: string,
  pathTo: string,
  transfer: number,
  pathSave: string
) => {
  log.info("id>>" ,id);
  log.info("pathFrom>>", pathFrom);
  log.info("pathTo>>", pathTo);
  log.info("transfer>>", transfer);
  log.info("pathSave>>", pathSave);
  if (
    dataSync.findIndex(
      (item: { idTab: string; process: string }) => item.idTab === id
    ) === -1 ||
    dataSync.length === 0
  ) {
    dataSync.push({
      idTab: id,
      process: '',
      pid: '',
    });
  }

  const i = dataSync.findIndex(
    (item: { idTab: string; process: string }) => item.idTab === id
  );
  return new Promise<ExecPromise>((resolve, reject) => {
    const eventName = events.settings.rclone.manualSyncResult;
    // -v --use-json-log
    const proc = exec(
      `rclone copy --update --s3-chunk-size=32Mi --s3-upload-concurrency=16 --checkers=16 -P --transfers=${transfer} "${pathFrom}" "${pathTo}"`,
      { maxBuffer: 1024 * 1024 * 2000 }
    );
    dataSync[i].pid = proc.pid;
    proc.stdout?.on('data', (data) => {
      log.info(data);
      if (pathSave !== "") {
        fs.writeFileSync(pathSave ,data, { flag: 'a+' })
      }
      dataSync[i].process = data.slice(0, data.indexOf('%')+1);
      webContents.send(eventName, dataSync);
    });

    proc.on('error', (data) => {
      log.info('err >>>', data);
      webContents.send(eventName, dataSync);
    });

    proc.on('exit', (code, signal) => {
      log.info('code>>', code);
      log.info('signal>>', signal);
    });
  });
};

const stopManualSync = (webContents: WebContents, id: string) => {
  const i = dataSync.findIndex(
    (item: { idTab: string; process: string }) => item.idTab === id
  );

  if (i !== -1) {
    exec(`taskkill /pid ${dataSync[i].pid} /t /f`, (err, stdout, stderr) => {
      if (err) {
        log.info('[==== CANCEL PROCESS ERROR ====]');
        log.error(err.message);
        log.info('[==== END ====]');
      }
      if (stdout) log.info('[STDOUT]', stdout);
      if (stderr) log.info('[STDERR]', stderr);
    });
  }
};

const getFileSaveLog = (webContents: WebContents) => {
  const eventName = events.settings.rclone.getFileSaveLogResult;
  const fileRes = dialog.showSaveDialogSync({
    title: 'Save to File…',
    filters: [{ name: '.log', extensions: ['log'] }],
  });
  webContents.send(eventName, fileRes);
};

// ngandh2 end

export const initSettingsEventListener = (
  app: App,
  ipcMain: IpcMain,
  webContents: WebContents
) => {
  ipcMain.on(events.settings.rclone.connect, (_evt, args) =>
    connectWithRclone(webContents, args)
  );

  ipcMain.on(events.settings.rclone.checkConfig, (_evt, args) =>
    checkConfig(webContents, args)
  );

  ipcMain.on(events.settings.rclone.getBucketList, (_evt, args) =>
    getBucketList(webContents, args)
  );

  // ngandh2 begin

  ipcMain.on(events.settings.rclone.getVersion, (_evt) =>
    getVersion(app, webContents)
  );
  ipcMain.on(events.settings.rclone.getFileList, (_evt, args) =>
    getFileList(webContents, args)
  );
  ipcMain.on(events.settings.rclone.getProcessList, (_evt) =>
    getProcessList(webContents)
  );

  ipcMain.on(events.settings.rclone.uploadFile, (_evt, args1, args2) =>
    uploadFile(webContents, args1, args2)
  );
  ipcMain.on(events.settings.rclone.uploadFolder, (_evt, args1, args2) =>
    uploadFolder(webContents, args1, args2)
  );
  ipcMain.on(events.settings.rclone.downloadFile, (_evt, args1, args2) =>
    downloadFile(webContents, args1, args2)
  );
  ipcMain.on(events.settings.rclone.downloadFolder, (_evt, args1, args2) =>
    downloadFolder(webContents, args1, args2)
  );
  ipcMain.on(events.settings.rclone.clearProcess, (_evt) =>
    clearProcess(webContents)
  );
  ipcMain.on(events.settings.rclone.refreshProcessList, (_evt) =>
    refreshProcessList(webContents)
  );
  ipcMain.on(events.settings.rclone.deleteFile, (_evt, args1, args2) =>
    deleteFile(webContents, args1, args2)
  );
  ipcMain.on(events.settings.rclone.deleteFolder, (_evt, args1, args2) =>
    deleteFolder(webContents, args1, args2)
  );
  ipcMain.on(events.settings.rclone.createBucket, (_evt, args) =>
    createBucket(webContents, args)
  );

  ipcMain.on(events.settings.rclone.cancelProcess, (_evt, args) =>
    cancelProcess(webContents, args)
  );

  ipcMain.on(events.settings.rclone.getDetailDir, (_evt, args1, args2) =>
    getDetailDir(webContents, args1, args2)
  );

  ipcMain.on(events.settings.rclone.getFolderSync, (_evt, args) =>
    getFolderSync(webContents, args)
  );

  ipcMain.on(events.settings.rclone.getFolderList, (_evt, args) =>
    getFolderList(webContents, args)
  );
  ipcMain.on(
    events.settings.rclone.manualSync,
    (_evt, args1, args2, args3, args4, args5) =>
      manualSync(webContents, args1, args2, args3, args4, args5)
  );
  ipcMain.on(events.settings.rclone.stopManualSync, (_evt, args) =>
    stopManualSync(webContents, args)
  );
  ipcMain.on(events.settings.rclone.getFileSaveLog, (_evt) =>
    getFileSaveLog(webContents)
  );
  // ngandh2 end
  ipcMain.on(events.settings.rclone.mount, (_evt, args) =>
    mountDisk(webContents, args)
  );

  ipcMain.on(events.settings.rclone.unmount, (_evt, args) =>
    unMountDisk(webContents, args)
  );

  ipcMain.on(events.settings.rclone.unmountSelected, (_evt, args) =>
    unmountSelectedBucket(webContents, args)
  );

  ipcMain.on(events.settings.rclone.configsDump, (_evt, args) =>
    configsDump(webContents)
  );

  ipcMain.on(events.settings.rclone.configDelete, (_evt, args) =>
    configDelete(webContents, args)
  );

  ipcMain.on(events.settings.rclone.mountedAtStartup, (_evt, args) =>
    mountedAtStartup(webContents, args)
  );

  ipcMain.on(events.settings.rclone.getRunAtStartup, (_evt) =>
    getRunAtStartup(app, webContents)
  );

  ipcMain.on(events.settings.rclone.setRunAtStartup, (_evt, args) =>
    setRunAtStartup(app, webContents, args)
  );
};
