import React from "react";
import { Tabs } from 'antd';
import type { TabPaneProps } from 'antd';
import { useTranslation } from 'react-i18next';
import {SettingOutlined, CloudServerOutlined, UserOutlined, HddOutlined, SyncOutlined } from "@ant-design/icons";

import { ConfigTab } from "./tabs/ConfigTab";
import { MountTab } from "./tabs/MountTab";
import { SettingTab } from "./tabs/SettingTab";
import { BucketTab } from "./tabs/BucketTab";
import { SyncTab } from "./tabs/SyncTab";

interface Tab extends Omit<TabPaneProps, 'tab'> {
    key: string;
    label: React.ReactNode;
}



export const MainPage: React.FC = () => {
  const {t} = useTranslation();

  const TabItems: Tab[]  = [
    {
      key: 'configs',
      label: (
        <>
          <UserOutlined /> {t('account')}
        </>
      ),
      children: <ConfigTab />
    },
    {
      key: 'bucket',
      label: (
        <>
          <HddOutlined /> {t('buckets')}
        </>
      ),
      children: <BucketTab />
    },
    {
      key: 'mounts',
      label: (
        <>
          <CloudServerOutlined /> Mounts
        </>
      ),
      children: <MountTab />
    },
    {
      key: 'sync',
      label: (
        <>
          <SyncOutlined /> Sync
        </>
      ),
      children: <SyncTab />
    },
    {
      key: 'setting',
      label: (
        <>
          <SettingOutlined /> {t('setting')}
        </>
      ),
      children: <SettingTab />
    },
  ];


  React.useEffect(() => {
    if (window.electron) {
      const mounted = localStorage.getItem("mounted");
      if ( mounted ) {
        const mountedArr = JSON.parse(mounted);
        if (mountedArr && mountedArr.length > 0) {
          setTimeout(() => {
            window.electron.main.mountAtStartup(mountedArr);
          }, 5000);
        }
      }

      window.electron.ipcRenderer.on("mounted-at-startup-result", (results: Array<any>) => {
        console.log('mounted-at-startup-result', results);
        if (results && results.length > 0) {
          const mounted2 = localStorage.getItem("mounted");
          if (mounted2) {
            const mountedArr = JSON.parse(mounted2);
            if ( mountedArr && mountedArr.length > 0 ) {
              // eslint-disable-next-line no-plusplus
              for (let i = 0; i < results.length; i++) {
                const rPpid = results[i].ppid;
                const rBucketName = results[i].bucketName;
                const rConfigName = results[i].configName;
                // eslint-disable-next-line no-plusplus
                for (let j = 0; j < mountedArr.length; j++) {
                  if (rBucketName === mountedArr[j].bucketName && rConfigName === mountedArr[j].configName) {
                    mountedArr[j].ppid = rPpid;
                  }
                }
              }

              localStorage.setItem("mounted", JSON.stringify(mountedArr));
            }
          }
        }
      });

    }
  }, []);

  return (
    <div style={{
      padding: '0px 20px 20px'
    }}>
      <Tabs
        defaultActiveKey="1"
        centered
        size="large"
        items={TabItems}
      />
    </div>
  );
}
