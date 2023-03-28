import {
  ForwardFilled,
  PlayCircleFilled,
  StopFilled,
} from '@ant-design/icons';
import { Button, Col, Input, notification, Row, Space } from 'antd';
import React from 'react';
import { useTranslation } from 'react-i18next';
import DropdownLeft from './Dropdown/DropdownLeft';
import DropdownRight from './Dropdown/DropdownRight';
import ModalDialogS3 from './Modal/ModalDialogS3';
import ModalRename from './Modal/ModalRename';
import ModalSaveLog from './Modal/ModalSaveLog';

interface SyncTabType {
  id: string;
  name: string;
  pathFrom: string;
  pathTo: string;
  pathSave: string;
}

interface ContentSyncTabProps {
  id: string;
  setTabList: React.Dispatch<React.SetStateAction<SyncTabType[]>>;
}


const ContentSyncTab = ({ id, setTabList }: ContentSyncTabProps) => {
  const [isDisabledDialog, setIsDisabledDialog] = React.useState(false);
  const [pathFrom, setPathFrom] = React.useState('');
  const [pathTo, setPathTo] = React.useState('');
  const [openDialogS3, setOpenDialogS3] = React.useState(false);
  const [isFromOrTo, setIsFromOrTo] = React.useState(false); // default is from
  const [ openModalRename, setOpenModalRename] = React.useState(false)
  const [ process , setProcess ] = React.useState('');
  const [ openModalSaveLog, setOpenModalSaveLog] = React.useState(false);

  const {t} = useTranslation();

  const handleStartSync = () => {
    if (pathFrom === "" || pathTo === "") {
      notification.warning({
        message: 'Oopps!',
        description: `${t('please input directory')}`,
        placement: 'bottom',
        style: { backgroundColor: '#FFFBE6' },
      });
    } else {
      const tabList = localStorage.getItem("TAB_SYNC");
      if (tabList !== null) {
        const newTabList = JSON.parse(tabList);
        const i = newTabList.findIndex((item: any) => item.id === id);
        newTabList[i].pathFrom = pathFrom;
        newTabList[i].pathTo = pathTo;
        localStorage.setItem("TAB_SYNC", JSON.stringify(newTabList));
      }
      setOpenModalSaveLog(true);
    }
  }

  const handleStopSync = () => {
    window.electron.main.stopManualSync(id);
  }

  React.useEffect(() => {
    window.electron.ipcRenderer.on('get-folder-sync-result', (result: any) => {
      if (result.id === 'left') {
        if (result.path !== undefined) {
          setPathFrom(result.path[0]);
        }
      }
      if (result.id === 'right') {
        if (result.path !== undefined) {
          setPathTo(result.path[0]);
        }
      }
      setIsDisabledDialog(false);
    });

    window.electron.ipcRenderer.on('manual-sync-result', (result: any) => {
      const index = result.findIndex((item: any) => item.idTab === id);
      if (index !== -1) {
        setProcess(result[index].process);
      }
    })
    const tabList = localStorage.getItem("TAB_SYNC");
    if (tabList !== null ) {
      const newTabList = JSON.parse(tabList);
      const index = newTabList.findIndex((item: any) => item.id === id);
      setPathFrom(newTabList[index].pathFrom);
      setPathTo(newTabList[index].pathTo);
    }

  }, []);

  return (
    <div>
      <div
        style={{
          marginBottom: '10px',
          display: 'flex',
          justifyContent: 'space-between',
        }}
      >
        <div>
          <Button type="primary" onClick={() => {
            setOpenModalRename(true)
          }}>
            {t('Rename')}
          </Button>
        </div>
        <div>
          <Button
            style={{ margin: '0 10px' }}
            type="primary"
            icon={<PlayCircleFilled />}
            onClick={handleStartSync}
          >
            Start
          </Button>
          <Button
            style={{ margin: '0 10px' }}
            type="primary"
            icon={<StopFilled />}
            danger
            onClick={handleStopSync}
          >
            Stop
          </Button>
        </div>
      </div>
      <Row>
        <Col span={11}>
          <Space.Compact style={{ width: '100%', height: '32px' }}>
            <Input disabled value={pathFrom} placeholder="Select folder..."/>
            <DropdownLeft
              isDisabled={isDisabledDialog}
              setIsDisabled={setIsDisabledDialog}
              setOpenDialogS3={setOpenDialogS3}
              setIsFromOrTo={setIsFromOrTo}
            />
          </Space.Compact>
        </Col>
        <Col
          span={2}
          style={{
            textAlign: 'center',
          }}
        >
          <ForwardFilled
            style={{
              color: 'green',
              fontSize: '40px',
            }}
          />
        </Col>
        <Col span={11}>
          <Space.Compact style={{ width: '100%', height: '32px' }}>
            <Input disabled value={pathTo} placeholder="Select folder..."/>
            <DropdownRight
              isDisabled={isDisabledDialog}
              setIsDisabled={setIsDisabledDialog}
              setOpenDialogS3={setOpenDialogS3}
              setIsFromOrTo={setIsFromOrTo}
            />
          </Space.Compact>
        </Col>
      </Row>
      <div
        style={{
          marginTop: '20px',
          height: '50vh',
          padding: '20px',
          backgroundColor: '#333333',
          color: 'white',
          overflowY: 'scroll',
          borderRadius: '6px'
        }}
      >
        <p style={{ margin: '10px 0' }}>{process}</p>
      </div>
      <ModalDialogS3
        open={openDialogS3}
        setOpen={setOpenDialogS3}
        setIsDisabledDialog={setIsDisabledDialog}
        setPathFrom={setPathFrom}
        setPathTo={setPathTo}
        isFromOrTo={isFromOrTo}
      />
      <ModalRename open={openModalRename} setOpen={setOpenModalRename} id={id} setTabList={setTabList}/>
      <ModalSaveLog open={openModalSaveLog} setOpen={setOpenModalSaveLog} id={id}/>

    </div>
  );
};

export default ContentSyncTab;
