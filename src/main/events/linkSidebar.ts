import type { RegistryPutItem } from 'regedit';
import { promisified as regedit, setExternalVBSLocation } from 'regedit';
// import log from 'electron-log';
import { mkdirSync, existsSync } from 'fs';
import path from 'path';
import os from 'os';
import { app } from 'electron';

const RESOURCES_PATH = app.isPackaged
  ? path.join(process.resourcesPath, 'assets')
  : path.join(__dirname, '../../../assets');

const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths);
};

export const linkToSideBar = async () => {
    try {
        const homePath = os.homedir();
        // const fstoragePath = path.join(homePath, "FStorage");
        // if ( !existsSync(fstoragePath) ) mkdirSync(fstoragePath);

        const vbsDirectory = getAssetPath('vbs');
        setExternalVBSLocation(vbsDirectory);

        const DUMP_UUID = '5f7ad500-216c-415d-aa2b-300d652aa3f8';
        const UUID = '5f7ad500-216c-415d-aa2b-300d652aa3f9';
        const INSTALL_LOCATION = `HKLM\\SOFTWARE\\${UUID}\\InstallLocation`;
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const installLocation: Array<ListUnexpandedValues> = await regedit.listUnexpandedValues(INSTALL_LOCATION);
        if (installLocation && installLocation.length > 0) {
            if (installLocation[0].exists) {

                const DUMP_64 = `HKCU\\Software\\Classes\\Wow6432Node\\CLSID\\{${DUMP_UUID}}`;
                const DUMP = `HKCU\\Software\\Classes\\CLSID\\{${DUMP_UUID}}`;

                const ICON_LOCATION = `${installLocation[0].value}\\Fstorage mount tool.exe,0`;

                const SOFTWARE_CLASS_64_CLSID = `HKCU\\Software\\Classes\\Wow6432Node\\CLSID\\{${UUID}}`;
                const SOFTWARE_CLASS_CLSID = `HKCU\\Software\\Classes\\CLSID\\{${UUID}}`;

                const IN_PROC_SERVER_64 = `${SOFTWARE_CLASS_64_CLSID}\\InProcServer32`;
                const IN_PROC_SERVER = `${SOFTWARE_CLASS_CLSID}\\InProcServer32`;

                const SHELL_FOLDER_64 = `${SOFTWARE_CLASS_64_CLSID}\\ShellFolder`;
                const SHELL_FOLDER = `${SOFTWARE_CLASS_CLSID}\\ShellFolder`;

                const INSTANCE_64 = `${SOFTWARE_CLASS_64_CLSID}\\Instance`;
                const INSTANCE = `${SOFTWARE_CLASS_CLSID}\\Instance`;

                const INIT_PROPERTY_BAG_64 = `${INSTANCE_64}\\InitPropertyBag`;
                const INIT_PROPERTY_BAG = `${INSTANCE}\\InitPropertyBag`;

                const DEFAULT_ICON_64 = `${SOFTWARE_CLASS_64_CLSID}\\DefaultIcon`;
                const DEFAULT_ICON = `${SOFTWARE_CLASS_CLSID}\\DefaultIcon`;


                const SOFTWARE_MICROSOFT_HIDE_DESKTOP_ICONS = 'HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\HideDesktopIcons\\NewStartPanel';
                const SOFTWARE_MICROSOFT_DESKTOP = `HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Desktop\\NameSpace\\{${UUID}}`;

                const KEYS = [
                    DUMP_64,
                    DUMP,

                    SOFTWARE_CLASS_64_CLSID,
                    IN_PROC_SERVER_64,
                    SHELL_FOLDER_64,
                    INSTANCE_64,
                    DEFAULT_ICON_64,

                    SOFTWARE_CLASS_CLSID,
                    IN_PROC_SERVER,
                    SHELL_FOLDER,
                    INSTANCE,
                    DEFAULT_ICON,

                    SOFTWARE_MICROSOFT_HIDE_DESKTOP_ICONS,
                    SOFTWARE_MICROSOFT_DESKTOP,

                    INIT_PROPERTY_BAG_64,
                    INIT_PROPERTY_BAG
                ];

                const listKeys = await regedit.list(KEYS);
                const notExistKeys = [''];

                Object.keys(listKeys).forEach( key => {
                    if (!listKeys[key].exists) {
                        notExistKeys.push(key);
                    }
                } );

                if (notExistKeys.length > 1) {
                    console.log(notExistKeys);
                    await regedit.createKey(notExistKeys);
                }

                const valuesDump: RegistryPutItem = {
                    'default': {
                        value: "",
                        type: "REG_DEFAULT"
                    }
                }

                const valuesCLSID: RegistryPutItem = {
                    'default': {
                        value: "FStorage",
                        type: 'REG_DEFAULT'
                    },
                    'System.IsPinnedToNamespaceTree': {
                        value: 0x1,
                        type: 'REG_DWORD'
                    },
                    'SortOrderIndex': {
                        value: 0x42,
                        type: 'REG_DWORD'
                    }
                }

                const valeusInProcServer: RegistryPutItem = {
                    '(Default)': {
                        value: '%SYSTEMROOT%\\system32\\shell32.dll',
                        type: 'REG_DEFAULT'
                    }
                }

                const valuesShellFolder: RegistryPutItem = {
                    'FolderValueFlags': {
                        value: 0x28,
                        type: 'REG_DWORD'
                    },
                    'Attributes': {
                        value: 0xf080004d,
                        type: 'REG_DWORD'
                    }
                }

                const valuesDefaultIcon: RegistryPutItem = {
                    'default': {
                        value: ICON_LOCATION,
                        type: 'REG_DEFAULT'
                    }
                }

                const valuesInstance: RegistryPutItem = {
                    'CLSID': {
                        value: '{0E5AAE11-A475-4c5b-AB00-C66DE400274E}',
                        type: 'REG_SZ'
                    }
                }

                const valuesHideDesktopIcons: RegistryPutItem = {
                    '{5f7ad500-216c-415d-aa2b-300d652aa3f9}': {
                        value: 0x1,
                        type: 'REG_DWORD'
                    }
                }

                const valuesDesktop: RegistryPutItem = {
                    'default': {
                        value: 'FStorage',
                        type: 'REG_SZ'
                    }
                }

                const valuesPropertyBag: RegistryPutItem = {
                    'Attributes': {
                        value: 0x11,
                        type: 'REG_DWORD'
                    },
                    'TargetFolderPath': {
                        value: path.join(homePath, "FStorage"),
                        type: 'REG_SZ'
                    }
                }

                await regedit.putValue({
                    [DUMP_64]: valuesDump,
                    [DUMP]: valuesDump,
                    [SOFTWARE_CLASS_64_CLSID]: valuesCLSID,
                    [SOFTWARE_CLASS_CLSID]: valuesCLSID,
                    [IN_PROC_SERVER_64]: valeusInProcServer,
                    [IN_PROC_SERVER]: valeusInProcServer,
                    [SHELL_FOLDER_64]: valuesShellFolder,
                    [SHELL_FOLDER]: valuesShellFolder,
                    [DEFAULT_ICON_64]: valuesDefaultIcon,
                    [DEFAULT_ICON]: valuesDefaultIcon,
                    [INSTANCE_64]: valuesInstance,
                    [INSTANCE]: valuesInstance,
                    [SOFTWARE_MICROSOFT_HIDE_DESKTOP_ICONS]: valuesHideDesktopIcons,
                    [SOFTWARE_MICROSOFT_DESKTOP]: valuesDesktop,
                    [INIT_PROPERTY_BAG_64]: valuesPropertyBag,
                    [INIT_PROPERTY_BAG]: valuesPropertyBag
                });
            }
        }
    } catch (err) {
        console.error(err);
        // eslint-disable-next-line @typescript-eslint/no-throw-literal
        throw "Error occurred";
    }
}
