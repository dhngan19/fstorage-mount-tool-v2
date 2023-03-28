/* eslint-disable promise/always-return */
/* eslint-disable promise/catch-or-return */
import { Form, Input, Modal } from 'antd';
import React from 'react';
import { useTranslation } from 'react-i18next';

interface SyncTabType {
  id: string;
  name: string;
  pathFrom: string;
  pathTo: string;
  pathSave: string;
}

interface ModalRenameProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  id: string;
  setTabList: React.Dispatch<React.SetStateAction<SyncTabType[]>>;
}

const ModalRename = ({ open, setOpen,id,setTabList }: ModalRenameProps) => {
  const { t } = useTranslation();
  const [form] = Form.useForm();

  const tabList = localStorage.getItem("TAB_SYNC");

  const handleRenameTab = () => {
    form
      .validateFields()
      .then((values) => {
        if (tabList !== null) {
          const newTabList = JSON.parse(tabList);
          const tabIndex = newTabList.findIndex((item : any) => item.id === id);
          newTabList[tabIndex].name = values.name;
          setTabList(newTabList);
          localStorage.setItem("TAB_SYNC", JSON.stringify(newTabList));
        }

        setOpen(false);
        form.resetFields();
      })
      .catch((info) => {
        // console.log('Validate Failed:', info);
      });
  }


  return (
    <>
      <Modal
        title={t('Rename')}
        open={open}
        onOk={handleRenameTab}
        onCancel={() => {
          setOpen(false);
        }}
      >
        <Form form={form} onFinish={handleRenameTab}>
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
        </Form>
      </Modal>
    </>
  );
};

export default ModalRename;
