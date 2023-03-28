/* eslint-disable no-lonely-if */
import { FolderFilled } from '@ant-design/icons';
import { Button, Input, Modal, notification, Radio, RadioChangeEvent, Space } from 'antd';
import React from 'react';
import { useTranslation } from 'react-i18next';

interface ModalSaveLogProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  id: string;
}

const ModalSaveLog = ({ open, setOpen,id }: ModalSaveLogProps) => {
  const { t } = useTranslation();

  const [valueRadio, setValueRadio] = React.useState(0);
  const [pathSave, setPathSave] = React.useState('');
  const [ disabledModal, setIsDisabledModal ] = React.useState(false);

  const onChange = (e: RadioChangeEvent) => {
    setValueRadio(e.target.value);
  };

  const handleGetFileSave = () => {
    setIsDisabledModal(true);
    window.electron.main.getFileSaveLog();
  }

  const handleStartSync = () => {
    setOpen(false);
    const trans = localStorage.getItem("UP_TRANS");
    const tabList = localStorage.getItem("TAB_SYNC");
    if (tabList !== null ) {
      const newTabList = JSON.parse(tabList);
      const index = newTabList.findIndex((item: any) => item.id === id);
      if (valueRadio === 1) {
        if (pathSave === '') {
          notification.warning({
            message: 'Oopps!',
            description: `${t('please input directory')}`,
            placement: 'bottom',
            style: { backgroundColor: '#FFFBE6' },
          });
        } else {
          newTabList[index].pathSave = pathSave;
          localStorage.setItem("TAB_SYNC", JSON.stringify(newTabList));
          if (trans !== null) {
            window.electron.main.manualSync(newTabList[index].pathFrom, id, newTabList[index].pathTo, parseFloat(trans), pathSave);
          } else {
            window.electron.main.manualSync(newTabList[index].pathFrom, id, newTabList[index].pathTo, 5, pathSave);
          }
        }
      } else {
        if (trans !== null) {
          window.electron.main.manualSync(newTabList[index].pathFrom, id, newTabList[index].pathTo, parseFloat(trans), "");
        } else {
          window.electron.main.manualSync(newTabList[index].pathFrom, id, newTabList[index].pathTo, 5, "");
        }
      }
    }
  }

  React.useEffect(() => {
    window.electron.ipcRenderer.on('get-file-save-log-result', (result: any) => {
      if (result !== null) {
        setPathSave(result);
      }
      setIsDisabledModal(false);
    })
    const tabList = localStorage.getItem("TAB_SYNC");
    if (tabList !== null ) {
      const newTabList = JSON.parse(tabList);
      const index = newTabList.findIndex((item: any) => item.id === id);
      setPathSave(newTabList[index].pathSave);
    }
  },[])

  return (
    <>
      <Modal
        title={t('Save Log')}
        open={open}
        onOk={handleStartSync}
        onCancel={() => {
          if (disabledModal) {
            setOpen(true);
          } else {
            setOpen(false);
          }
        }}
      >
        <p>Bạn có muốn lưu lại log không ?</p>
        <Radio.Group onChange={onChange} value={valueRadio}>
          <Radio value={1}>Có</Radio>
          <Radio value={0}>Không</Radio>
        </Radio.Group>
        <br />
        {valueRadio === 1 && (
          <div style={{
            marginTop: '10px'
          }}>
            <Space.Compact style={{ width: '100%', height: '32px' }}>
              <Input disabled value={pathSave} placeholder="Select folder..." />
              <Button
                type="primary"
                icon={<FolderFilled />}
                style={{
                  width: '10%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  // backgroundColor: '#FFC700',
                }}
                onClick={handleGetFileSave}
              />
            </Space.Compact>
          </div>
        )}
        {/* <Form form={form} onFinish={handleRenameTab}>
          <Form.Item
            name="name"
            label={t('name')}
            rules={[
              {
                required: true,
                message: `${t("Please enter Tab's name")}`,
              },
            ]}
          >
            <Input />
          </Form.Item>
        </Form> */}
      </Modal>
    </>
  );
};

export default ModalSaveLog;
