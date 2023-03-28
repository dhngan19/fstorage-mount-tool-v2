/* eslint-disable promise/always-return */
/* eslint-disable promise/catch-or-return */
import { Modal, Form, Input } from 'antd';
import React from 'react';
import { useTranslation } from 'react-i18next';

interface DataType {
  Path: string;
  Name: string;
  Size: number;
  ModTime: string;
  IsDir: boolean;
  IsBucket: boolean | undefined;
  Metadata: {
    btime: string;
    'content-type': string;
    mtime: string;
  };
}

interface ModalCreateBucketProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  data: DataType[]
}

const ModalCreateBucket = (props: ModalCreateBucketProps) => {
  const {t} = useTranslation();
  const { open, setOpen, data} = props;
  const [form] = Form.useForm();
  const handleCreateBucket = () => {
    form
      .validateFields()
      .then((values) => {
        if (window.electron) {
          window.electron.main.createBucket(values.name);
        }
        setOpen(false);
        form.resetFields();
      })
      .catch((info) => {
        // console.log('Validate Failed:', info);
      });
  };



  return (
    <>
      <Modal
        title={t('create bucket')}
        open={open}
        onOk={handleCreateBucket}
        onCancel={() => {
          setOpen(false);
        }}
      >
        <Form form={form} onFinish={handleCreateBucket}>
          <Form.Item
            name="name"
            label={t("name")}
            rules={[
              {
                required: true,
                message: `${t("please enter bucket's name")}`,
              },
              {
                validator(_, value) {
                  // eslint-disable-next-line no-useless-escape
                  const emailRegex = /^[A-Za-z0-9\-]{1,255}$/g;
                  if (value && !emailRegex.test(value)) {
                    return Promise.reject(new Error(`${t("validate bucket")}`));
                  }
                  return Promise.resolve();
                },
              },
              {
                validator(_, value) {
                  let flag = 0;
                  // eslint-disable-next-line no-useless-escape, no-plusplus
                  for (let i = 0; i < data.length; i++) {
                    if (data[i].Name === value) {
                      flag = 1;
                    }
                  }
                  if (flag === 1) {
                    return Promise.reject(new Error(`${t("bucket name had used by other user")}`));
                  }
                  return Promise.resolve();
                },
              }
            ]}
          >
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default ModalCreateBucket;
