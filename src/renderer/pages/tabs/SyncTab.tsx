import { PlusCircleOutlined } from '@ant-design/icons';
import { Button, Tabs, Tooltip } from 'antd';
import React from 'react';
import ContentSyncTab from 'renderer/components/SyncTab/ContentSyncTab';
import { generateUUID } from 'renderer/helpers/file-explorer-helper';

interface SyncTabType {
  id: string;
  name: string;
  pathFrom: string;
  pathTo: string;
  pathSave: string;
}

export const SyncTab: React.FC = () => {
  const [activeKey, setActiveKey] = React.useState('');
  const [tabList, setTabList] = React.useState<SyncTabType[]>([]);

  const handleNewTab = () => {
    const newId = generateUUID()
    setTabList([
      ...tabList,
      {
        id: newId,
        name: 'New Tab',
        pathFrom: '',
        pathTo: '',
        pathSave: '',
      },
    ]);
    localStorage.setItem(
      'TAB_SYNC',
      JSON.stringify([
        ...tabList,
        {
          id: newId,
          name: 'New Tab',
          pathFrom: '',
          pathTo: '',
          pathSave: '',
        },
      ])
    );
  };

  const handleRemoveTab = (value: any) => {

    const targetIndex = tabList.findIndex((item) => item.id === value);
    const newTabList = tabList.filter((item) => item.id !== value);

    if (newTabList.length && value === activeKey) {
      const {id} = newTabList[targetIndex === newTabList.length ? targetIndex - 1 : targetIndex];
      setActiveKey(id);
    }
    setTabList(newTabList);
    localStorage.setItem('TAB_SYNC', JSON.stringify(newTabList));
  };

  React.useEffect(() => {
    const tabListValue = localStorage.getItem('TAB_SYNC');
    if (tabListValue !== null && tabListValue !== '[]') {
      setTabList(JSON.parse(tabListValue));
      setActiveKey(JSON.parse(tabListValue)[0].id);
    } else {
      const newTab = [
        {
          id: generateUUID(),
          name: 'New Tab',
          pathFrom: '',
          pathTo: '',
          pathSave: '',
        },
      ];
      localStorage.setItem('TAB_SYNC', JSON.stringify(newTab));
      setActiveKey(newTab[0].id);
      setTabList(newTab);
    }
  }, []);

  return (
    <>
      <Button type="primary" onClick={handleNewTab} style={{ width: '120px' }}>
        <PlusCircleOutlined />
      </Button>
      <Tabs
        hideAdd
        activeKey={activeKey}
        tabPosition="left"
        type="editable-card"
        style={{ height: '80vh', marginTop: '10px' }}
        onEdit={(e) => {handleRemoveTab(e)}}
        onChange={(key) => {
          setActiveKey(key);
        }}
        className="tab-sync"
        items={tabList.map((item, i) => {
          const id = `${item.id}`;
          return {
            label: <Tooltip title={item.name}>
            <span>
              {item.name.length < 10 ? (
                item.name
              ) : (
                <>
                  {item.name.slice(0, 10)}
                  ...
                </>
              )}
            </span>
          </Tooltip>,
            key: id,
            children: <ContentSyncTab id={id} setTabList={setTabList}/>,
          };
        })}
      />
    </>
  );
};
