import React from 'react';
import {
  Table,
  Button,
  Modal,
  Form,
  Select,
  notification,
  Popconfirm,
} from 'antd';
import { DeleteOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { MountIcon, UnmountIcon } from 'renderer/components/CustomIcon';

interface DataType {
  key: string | number;
  no: number;
  name: string;
  bucket: string;
  ppid?: number;
}

interface IForm {
  name: string;
  bucket: string;
}

interface IBucketListOptions {
  success: boolean;
  data: Array<{ value: string; label: string; disabled?: boolean }>;
}

interface MountDiskResult {
  isMounted: boolean;
  pid?: number | null;
  currentMount: { configName: string; bucketName: string };
}

export const MountTab: React.FC = () => {
  const { t } = useTranslation();
  const [form] = Form.useForm<IForm>();

  const [submitting, setSubmitting] = React.useState(false);
  const [buckets, setBuckets] = React.useState<DataType[]>([]);
  const [modalStatus, setModalStatus] = React.useState(false);

  const [configs, setConfigs] = React.useState<string[]>([]);
  const [availableBuckets, setAvailableBuckets] = React.useState<Array<any>>(
    []
  );

  React.useEffect(() => {
    (async () => {
      if ('electron' in window) {
        const firstMountString = localStorage.getItem('mounted');
        if (firstMountString) {
          const firstMount = JSON.parse(firstMountString);
          const mappedMount = firstMount.map((mount: any, index: number) => {
            return {
              key: index,
              no: index,
              name: mount.configName,
              bucket: mount.bucketName,
              ppid: mount.ppid,
            };
          });
          setBuckets(mappedMount);
        }

        // // listen to event
        window.electron.ipcRenderer.on(
          'rclone-config-dump-result',
          (data: any) => {
            if (data) {
              const names = Object.keys(data);
              setConfigs(names);
            } else {
              notification.error({
                message: 'Oopps!',
                description: `${t('unable to load configuration')}`,
                placement: 'bottom',
                style: { backgroundColor: '#FFF2F0' },
              });
            }
          }
        );

        window.electron.ipcRenderer.on(
          'income-get-buckets-result',
          (result: IBucketListOptions) => {
            if (!result.success) {
              notification.error({
                message: 'Oopps!',
                description: `${t('unable to load bucket list')}`,
                placement: 'bottom',
                style: { backgroundColor: '#FFF2F0' },
              });
            } else if (result.data) {
              if (result.data.length <= 0) {
                notification.info({
                  message: `${t('no bucket yet')}`,
                  placement: 'bottom',
                  style: { backgroundColor: '#E6F4FF' },
                });
              } else {
                // get list of bucketName in localStorage
                const mounted = localStorage.getItem('mounted');
                let availBuckets: Array<any> = [];
                if (!mounted) {
                  availBuckets = result.data;
                }
                if (mounted) {
                  const mountedArray = JSON.parse(mounted);
                  const bucketNames = mountedArray.map((ma: any) => {
                    return ma.bucketName;
                  });

                  availBuckets = result.data.map((d) => {
                    if (bucketNames.includes(d.value)) {
                      return {
                        ...d,
                        disabled: true,
                      };
                    }
                    return { ...d };
                  });
                }

                setAvailableBuckets(availBuckets);
                // setGetListLoading(false);
              }
            }
          }
        );

        window.electron.ipcRenderer.on(
          'income-mount-disk-result',
          (data: MountDiskResult | boolean) => {
            console.log('income-mount-disk-result:', data);
            let isMounted = data;
            if (typeof data !== 'boolean') {
              isMounted = data.isMounted;
              localStorage.setItem('RCLONE_PID', data.pid?.toString() ?? '');
            }
            if (isMounted === true) {
              notification.success({
                message: `${t('mount success')}`,
                placement: 'bottom',
                style: { backgroundColor: '#F6FFED' },
              });

              const mounted = localStorage.getItem('mounted');
              let newMounted = [];
              if (!mounted && typeof data !== 'boolean') {
                newMounted.push(data.currentMount);
                localStorage.setItem('mounted', JSON.stringify(newMounted));
              } else if (mounted && typeof data !== 'boolean') {
                newMounted = JSON.parse(mounted);
                newMounted.push(data.currentMount);
                localStorage.setItem('mounted', JSON.stringify(newMounted));
              }
              const mappedMount = newMounted.map(
                (mount: any, index: number) => {
                  return {
                    key: index,
                    no: index,
                    name: mount.configName,
                    bucket: mount.bucketName,
                    ppid: mount.ppid,
                  };
                }
              );
              setBuckets(mappedMount);
            } else {
              notification.error({
                message: 'Oopps!',
                description: `${t('unable to mount')}`,
                placement: 'bottom',
                style: { backgroundColor: '#FFF2F0' },
              });
            }
            setSubmitting(false);
            form.resetFields();
            setModalStatus(false);
          }
        );

        window.electron.ipcRenderer.on(
          'income-unmount-result',
          (result: boolean) => {
            if (result === true) {
              notification.success({
                message: `${t('unmount success')}`,
                placement: 'bottom',
                style: { backgroundColor: '#F6FFED' },
              });
              localStorage.removeItem('mounted');
              setBuckets([]);
            } else {
              notification.error({
                message: `${t('unable to unmount')}`,
                placement: 'bottom',
                style: { backgroundColor: '#FFF2F0' },
              });
            }
          }
        );

        window.electron.ipcRenderer.on(
          'income-unmount-selected-bucket-result',
          (result: { delete: number; status: boolean }) => {
            if (result.status) {
              const mounted = localStorage.getItem('mounted');
              if (mounted) {
                const mountedArr = JSON.parse(mounted);
                if (Array.isArray(mountedArr) && mountedArr.length > 0) {
                  const modifiedMount = mountedArr.filter(
                    (m) => m.ppid !== result.delete
                  );
                  localStorage.setItem(
                    'mounted',
                    JSON.stringify(modifiedMount)
                  );

                  const mappedMount: DataType[] = modifiedMount.map(
                    (mount: any, index: number) => {
                      return {
                        key: index,
                        no: index,
                        name: mount.configName,
                        bucket: mount.bucketName,
                        ppid: mount.ppid,
                      };
                    }
                  );
                  setBuckets(mappedMount);

                  notification.success({
                    message: `${t('unmount success')}`,
                    placement: 'bottom',
                    style: { backgroundColor: '#F6FFED' },
                  });
                }
              } else {
                notification.warning({
                  message: `${t(
                    "Bucket has been unmounted, but the data doesn't seem to match"
                  )}`,
                  placement: 'bottom',
                  style: { backgroundColor: '#FFFBE6' },
                });
              }
            } else {
              notification.error({
                message: `${t('unable to unmount')} [${result.delete}]`,
                placement: 'bottom',
                style: { backgroundColor: '#FFF2F0' },
              });
            }
          }
        );
      }
    })();
  }, []);

  React.useEffect(() => {
    if (window.electron && modalStatus) {
      // get list of config
      window.electron.main.configsDump();
    }
  }, [modalStatus]);

  const loadAvailableBuckets = (name: string) => {
    if (window.electron) {
      window.electron.main.getBucketList(name);
    }
  };

  const handleSubmit = (values: IForm) => {
    const { name, bucket } = values;

    setSubmitting(true);
    if (window.electron) {
      window.electron.main.mountDisk({ configName: name, bucketName: bucket });
    }
  };

  const handleUnMountDisk = () => {
    const pid = localStorage.getItem('RCLONE_PID');
    if (pid) {
      window.electron.main.unMountDisk(pid);
    }
  };

  const handleUnmountSelectedBucket = (ppid?: number) => {
    console.log(ppid);
    if (window.electron && ppid) {
      window.electron.main.unmountSelectedBucket(ppid);
    }
  };

  // const columns: ColumnsType<DataType> = [
  //   {
  //     title: 'No.',
  //     dataIndex: 'no',
  //     key: 'no'
  //   },
  //   {
  //     title: 'Name',
  //     dataIndex: 'name',
  //     key: 'name'
  //   },
  //   {
  //     title: 'Bucket',
  //     dataIndex: 'bucket',
  //     key: 'bucket'
  //   },
  //   {
  //     title: 'Action',
  //     key: 'action',
  //     render: (_: unknown, record) => (
  //       <Popconfirm
  //         key={`delete-bucket-${record.ppid}`}
  //         placement="bottomRight"
  //         title='Unmount bucket?'
  //         description={`Bạn có chắc muốn Unmount ${record.bucket} chứ?`}
  //         icon={<QuestionCircleOutlined style={{ color: 'red' }} />}
  //         okText={`Có, Unmount ${record.bucket}`}
  //         cancelText="Không"
  //         okButtonProps={{ danger: true }}
  //         onConfirm={() => handleUnmountSelectedBucket(record.ppid)}
  //       >
  //         <Button danger icon={<DeleteOutlined />} />
  //       </Popconfirm>
  //     )
  //   }
  // ];

  return (
    <>
      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          marginBottom: '10px',
          alignItems: 'center',
        }}
      >
        {/* <Button type="primary" onClick={() => setModalStatus(true) }>Mount</Button> */}
        <Popconfirm
          key="delete-all-bucket"
          placement="bottomRight"
          title={t('Unmount all buckets?')}
          description={t('Are you sure you want to Unmount them all?')}
          icon={<QuestionCircleOutlined style={{ color: 'red' }} />}
          okText="Yes"
          cancelText="No"
          okButtonProps={{ danger: true }}
          onConfirm={handleUnMountDisk}
        >
          {/* <Button type="primary" danger disabled={buckets.length===0}>Unmount tất cả</Button> */}
          <Button
            className="btn-unmount"
            type="text"
            disabled={buckets.length === 0}
            style={{
              color: '#FF4D4F',
              fontWeight: '400',
            }}
          >
            <UnmountIcon/> <span style={{paddingLeft: '10px'}}>Unmount tất cả</span>
          </Button>
        </Popconfirm>
        <Button
          type="primary"
          onClick={() => setModalStatus(true)}
          style={{
            marginLeft: '10px',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <MountIcon /> <span style={{paddingLeft: '10px'}}>Mount</span>
        </Button>
        {/* <Button danger type="primary" onClick={handleUnMountDisk} disabled={buckets.length===0} >Unmount tất cả</Button> */}
      </div>
      <Table
        dataSource={buckets}
        columns={[
          {
            title: 'No.',
            dataIndex: 'no',
            key: 'no',
          },
          {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
          },
          {
            title: 'Bucket',
            dataIndex: 'bucket',
            key: 'bucket',
          },
          {
            title: 'Action',
            key: 'action',
            dataIndex: 'ppid',
            render: (_: unknown, record) => (
              <Popconfirm
                key={`delete-bucket-${record.ppid}`}
                placement="bottomRight"
                title="Unmount bucket?"
                description={`${t('Are you sure you want to Unmount')} ${
                  record.bucket
                } ?`}
                icon={<QuestionCircleOutlined style={{ color: 'red' }} />}
                okText={`Yes, Unmount ${record.bucket}`}
                cancelText="No"
                okButtonProps={{ danger: true }}
                onConfirm={() => handleUnmountSelectedBucket(record.ppid)}
              >
                <Button
                  type="text"
                  size="small"
                  className="btn-text"
                  style={{
                    color: '#333333',
                    borderRadius: '50%',
                  }}
                >
                  <DeleteOutlined />
                </Button>
              </Popconfirm>
            ),
          },
        ]}
      />

      <Modal
        open={modalStatus}
        footer={null}
        onCancel={() => {
          setModalStatus(false);
          form.resetFields();
          // setSubmitting(false);
        }}
      >
        <Form layout="vertical" form={form} onFinish={handleSubmit}>
          <Form.Item
            name="name"
            label={t('Select configuration')}
            rules={[
              {
                required: true,
                message: `${t('Please select configuration')}`,
              },
            ]}
          >
            <Select
              onChange={(value) => {
                form.setFieldValue('name', value);
                loadAvailableBuckets(value);
              }}
            >
              {configs.map((config) => (
                <Select.Option key={config} value={config}>
                  {config}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="bucket"
            label={t('Select bucket')}
            rules={[
              { required: true, message: `${t('Please select bucket')}` },
            ]}
          >
            <Select
              options={availableBuckets}
              defaultActiveFirstOption
              disabled={!form.getFieldValue('name')}
            />
          </Form.Item>
          <Form.Item style={{ textAlign: 'end' }}>
            <Button type="primary" htmlType="submit" loading={submitting}>
              {t('Mount to the drive')}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};
