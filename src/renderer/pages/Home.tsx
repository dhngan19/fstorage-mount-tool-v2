import React from 'react';
import { useNavigate } from 'react-router-dom';

import {
  Form,
  Input,
  Button,
  Modal,
  // Divider,
  notification,
  Result
  // Space,
  // Tooltip,
  // Typography,
  // Select,
  // Card
} from 'antd';
import { useTranslation } from 'react-i18next';

// import { CloudSyncOutlined, SendOutlined, CloudServerOutlined } from '@ant-design/icons';

interface FormPayloadType {
  access_key: string;
  access_secret: string;
  endpoint: string;
  region: string;
}

// interface ButtonStyleType {
//   ghost: boolean;
//   type?: "link" | "text" | "ghost" | "default" | "primary" | "dashed",
//   danger?: boolean;
// }

// interface MountDiskResult {
//   isMounted: boolean;
//   pid?: number | null;
// }

// interface BucketListOptions {
//   success: boolean;
//   data: Array<{ value: string, label: string }>;
// }

export const HomePage: React.FC = () => {
  const {t} = useTranslation();
  const navigate = useNavigate();

  const [form] = Form.useForm<FormPayloadType>();

  // const [isAdmin, setIsAdmin] = React.useState<boolean>();
  // const [minBtnStyle] = React.useState<ButtonStyleType>({
  //   ghost: true,
  //   type: 'text'
  // });
  // const [exitBtnStyle, setExitBtnStyle] = React.useState<ButtonStyleType>({
  //   ghost: true,
  //   type: 'text'
  // });

  const [isSubmitFail, setIsSubmitFail] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  // const [checkConfigLoading, setCheckConfigLoading] = React.useState(false);
  // const [installWinFspLoading, setInstallWinFspLoading] = React.useState(false);
  // const [mountDiskLoading, setMountDiskLoading] = React.useState(false);
  // const [getListLoading, setGetListLoading] = React.useState(false);
  // const [mountedDiskName, setMountedDiskName] = React.useState<string | null>(null);

  const [connectSuccessModal, setConnectSuccessModal] = React.useState(false);

  React.useEffect(() => {
    if (window.electron) {

      const accessKey = localStorage.getItem("ACCESS_KEY");
      const secretKey = localStorage.getItem("ACCESS_SECRET");
      const endpoint = localStorage.getItem("ENDPOINT");
      const region = localStorage.getItem("REGION");

      if (accessKey && secretKey && endpoint && region) {

        navigate('/connected');
        return;
        // form.setFieldsValue({
        //   access_key: accessKey,
        //   access_secret: secretKey,
        //   endpoint,
        //   region
        // });
      }

      window.electron.ipcRenderer.on('income-connect-rclone-result', (data: any) => {
        console.log('income-connect-rclone-result:', data);
        setTimeout(() => {
          if (data === false) {
            notification.error({
              message: "Oopps!",
              description: `${t('cannot connect to Fstorage')}`,
              placement: "bottom"
            })
          }
          else {
            setConnectSuccessModal(true);

            const fields = form.getFieldsValue();
            if (fields) {
              localStorage.setItem("ACCESS_KEY", fields.access_key);
              localStorage.setItem("ACCESS_SECRET", fields.access_secret);
              localStorage.setItem("ENDPOINT", fields.endpoint);
              localStorage.setItem("REGION", fields.region);
            }

          }
          setSubmitting(false);
        }, 1000);
      });

      // window.electron.ipcRenderer.on('income-check-config-result', (data: any) => {
      //   console.log('income-check-config-result: ', data);
      //   if (data === true) {
      //     notification.success({
      //       message: "Hooray!",
      //       description: "Everythings seem to be okay",
      //       placement: 'bottom',
      //     });
      //   }
      //   else {
      //     notification.error({
      //       message: "Oopps!",
      //       description: "Something is wrong",
      //       placement: 'bottom'
      //     })
      //   }
      //   setCheckConfigLoading(false);
      // });

      window.electron.ipcRenderer.on('income-complete-install-choco-result', (data: any) => {
        console.log('income-complete-install-choco-result:', data);
        if (data === true) {
          notification.success({
            message: "Hooray!",
            description: "Installation of Winfsp complete successfully",
            placement: 'bottom',
          });
        }
        else {
          notification.error({
            message: "Oopps!",
            description: "Error occurred, you may want to run this app as Administrator",
            placement: 'bottom'
          })
        }
        // setInstallWinFspLoading(false);
      });

      // window.electron.ipcRenderer.on("income-mount-disk-result", (data: MountDiskResult | boolean) => {
      //   console.log("income-mount-disk-result:", data);
      //   let isMounted = data;
      //   if (typeof data !== 'boolean') {
      //     isMounted = data.isMounted;
      //     localStorage.setItem("RCLONE_PID", data.pid?.toString() ?? "");
      //   }
      //   if (isMounted === true) {
      //     notification.success({
      //       message: "Hooray!",
      //       description: "Mount successfully",
      //       placement: 'bottom',
      //     });
      //     setMountedDiskName(`Fstorage ${selectedBucket}`);
      //   }
      //   else {
      //     notification.error({
      //       message: "Oopps!",
      //       description: "Unable to mount",
      //       placement: 'bottom'
      //     })
      //   }
      //   setMountDiskLoading(false);
      // });

      // window.electron.ipcRenderer.on("income-get-buckets-result", (result: BucketListOptions) => {
      //   if (!result.success) {
      //     notification.error({
      //       message: "Oopps!",
      //       description: "Không thể tải danh sách bucket",
      //       placement: 'bottom'
      //     });
      //   } else if (result.data) {
      //       if (result.data.length <= 0) {
      //         notification.info({
      //           message: "Chưa có bucket",
      //           placement: 'bottom'
      //         });
      //       }
      //       else {
      //         notification.success({
      //           message: "Tải danh sách bucket thành công",
      //           placement: 'bottom',
      //         });

      //         setBucketList(result.data);
      //         setGetListLoading(false);
      //       }
      //     }
      // });

      // window.electron.ipcRenderer.on("income-unmount-result", (result: boolean) => {
      //   if (result === true) {
      //     notification.success({
      //       message: "Unmount thành công",
      //       placement: 'bottom'
      //     });
      //     setMountedDiskName(null);
      //   }
      //   else {
      //     notification.error({
      //       message: "Không thể unmount",
      //       placement: 'bottom'
      //     });
      //   }
      // });

    }
  }, []);

  const handleSubmit = (values: FormPayloadType) => {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const { access_key, access_secret, endpoint, region } = values;

    setSubmitting(true);
    if (window.electron) {
      window.electron.main.connectWithRclone({ access_key, access_secret, endpoint, region });
    }
  }

  // const handleCheckConfig = React.useCallback(() => {
  //   setCheckConfigLoading(true);
  //   window.electron.main.checkConfig();
  // }, []);

  // const handleInstallWinFsp = React.useCallback(() => {
  //   setInstallWinFspLoading(true);
  //   window.electron.main.installWinFsp();
  // }, []);

  // const handleMountDisk = React.useCallback( () => {
  //   if (selectedBucket) {
  //     setMountDiskLoading(true);
  //     window.electron.main.mountDisk(selectedBucket);
  //   }
  // }, [selectedBucket]);

  // const handleLoadBucketList = React.useCallback(() => {
  //   setGetListLoading(true);
  //   window.electron.main.getBucketList();
  // }, []);

  // const handleUnMountDisk = () => {
  //   const pid = localStorage.getItem("RCLONE_PID");
  //   if (pid) {
  //     window.electron.main.unMountDisk(pid);
  //   }
  // }

  const handleSubmitFail = React.useCallback(() => {
    setIsSubmitFail(true);
  }, []);

  const handleConnectSuccessBtnClick = () => {
    setConnectSuccessModal(false);
    navigate('/connected');
  }

  return (
    <>
      <Form
        layout='vertical'
        form={form}
        onFinish={handleSubmit}
        onFinishFailed={handleSubmitFail}
      >
        <Form.Item name="access_key" label="Access key" rules={[{ required: true, message: 'Vui lòng nhập Access key' }]}>
          <Input id="access_key_id" placeholder="xxxxxxxxxxxxxx" />
        </Form.Item>
        <Form.Item name="access_secret" label="Secret key" rules={[{ required: true, message: 'Vui lòng nhập Access secret' }]}>
          <Input.Password id="secret_access_key" placeholder="xxxxxxxxxxxxxxxxxxx" />
        </Form.Item>
        <Form.Item name="region" label="Region" initialValue="default" rules={[{ required: true, message: 'Vui lòng nhập Region' }]}>
          <Input id="region" placeholder="default" />
        </Form.Item>
        <Form.Item name="endpoint" label="Endpoint" initialValue="https://hcm.fstorage.vn" rules={[{ required: true, message: 'Vui lòng nhập Endpoint' }]}>
          <Input id="endpoint" placeholder="https://xxxxxxx" />
        </Form.Item>
        {isSubmitFail && (
          <Form.Item>
            <a href="https://docs.fstorage.vn/books/huong-dan-su-dung-portal-fstorage/page/huong-dan-su-dung-portal-fstorage#bkmrk-thi%E1%BA%BFt-l%E1%BA%ADp-t%C3%A0i-kho%E1%BA%A3n" target="_blank" rel="noreferrer">Hướng dẫn lấy Access key</a>
          </Form.Item>
        )}
        <Form.Item style={{ textAlign: "end" }}>
          <Button type="primary" htmlType='submit' loading={submitting}>{t('connect Fstorage')}</Button>
        </Form.Item>
      </Form>

      <Modal
        open={connectSuccessModal}
        onOk={handleConnectSuccessBtnClick}
        footer={(
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <Button key="submit" type="primary" onClick={handleConnectSuccessBtnClick}>OK</Button>
          </div>
        )}
        closable={false}
      >
          <Result
            status="success"
            title="Kết nối với FStorage thành công"
          />
      </Modal>

      {/* <Divider />

      <Space align='center'>
        <Button type='dashed' onClick={handleCheckConfig} loading={checkConfigLoading}>Kiểm tra kết nối</Button>
      </Space>

      <Divider />

      <div>
        <Typography.Title level={2}>Mount bucket ra ổ đĩa</Typography.Title>
        <Space>
          <Input.Group compact>
            <Tooltip title="Tải danh sách bucket">
              <Button
                size='large'
                type="primary"
                icon={<CloudSyncOutlined style={{ fontSize: 12 }} />}
                loading={getListLoading}
                onClick={handleLoadBucketList}
              >
                Tải danh sách Bucket
              </Button>
            </Tooltip>
            <Select
              size='large'
              defaultActiveFirstOption
              style={{ width: 200 }}
              onChange={(value) => setSelectedBucket(value)}
              options={bucketList}
              placeholder={<>Vui lòng chọn bucket</>}
            />
            <Tooltip title="Mount ra ổ đĩa">
              <Button
                size='large'
                type="primary"
                icon={<SendOutlined />}
                onClick={handleMountDisk}
                loading={mountDiskLoading}
                disabled={mountDiskLoading || !selectedBucket}
              />
            </Tooltip>
          </Input.Group>

          {mountedDiskName && (
            <Card>
              <div>
                <div>
                  <CloudServerOutlined size={30} />
                  <Typography.Text>{`Fstorage ${selectedBucket}`}</Typography.Text>
                </div>
                <Button type='text' onClick={handleUnMountDisk}>Unmount</Button>
              </div>
            </Card>
          )}

        </Space>
      </div> */}
    </>
    // )}
  );
}
