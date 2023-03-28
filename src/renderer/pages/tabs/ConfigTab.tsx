import React from "react";
import { Empty, Button, Modal, Form, Input, notification, Avatar, Popconfirm, List } from 'antd';
import { CheckCircleOutlined, DeleteOutlined, EditOutlined, QuestionCircleOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
// import { db } from "../../../db";
import FstorageLogo from '../../../../assets/icon.png';
import EmptyIcon from '../../../../assets/empty.svg'

interface FormPayloadType {
  access_key: string;
  access_secret: string;
  endpoint: string;
  region: string;
  provider: string;
}

interface IConfigs {
  name: string;
  accessKey: string;
  type: string;
  endpoint: string;
  region: string;
  accessSecret: string;
}

enum TagActions {
  SET_COLOR = 'SET_COLOR',
  SET_ICON = 'SET_ICON',
  SET_BOTH = 'SET_BOTH'
}
interface ITagState {
  color: "success" | "processing" | "error";
  icon: React.ReactNode;
}
interface ITagAction {
  type: string;
  payload: ITagState;
}

const TagReducer = (state: ITagState, action: ITagAction): ITagState => {
  switch (action.type) {
    case TagActions.SET_COLOR:
      return {
        ...state,
        color: action.payload.color
      }
    case TagActions.SET_ICON:
      return {
        ...state,
        icon: action.payload.icon
      }
    default:
      return { ...state, ...action.payload }
  }
}

export const ConfigTab: React.FC = () => {
  const {t} = useTranslation();

  const [form] = Form.useForm<FormPayloadType>();

  const [configs, setConfigs] = React.useState<IConfigs[]>([]);
  const [modalStatus, setModalStatus] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [isSubmitFail, setIsSubmitFail] = React.useState(false);

  const [newAddedProfile, setNewAddedProfile] = React.useState<string | undefined>();

  // const [tag, tagDispatch] = React.useReducer(TagReducer, { color: 'processing', icon: <SyncOutlined spin /> });

  const handleSubmit = (values: FormPayloadType) => {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const { access_key, access_secret, endpoint, region, provider } = values;
    setSubmitting(true);
    if (window.electron) {
      // create config
      window.electron.main.connectWithRclone({ access_key, access_secret, endpoint, region, provider });
      setNewAddedProfile(access_key);
    }
  }

  const handleSubmitFail = React.useCallback(() => {
    setIsSubmitFail(true);
  }, []);

  const handleCardEditActionClick = async (config: IConfigs) => {
    // get data from indexed db
    // await db.transaction('readonly', db.configs, async () => {
    //   const currentConfig = await db.configs.where("accessKey").equals(id).first();
    //   if (currentConfig) {
    //     const { accessKey, accessSecret, endpoint, region } = currentConfig;
    //     // load to form
    //     form.setFieldsValue({
    //       access_key: accessKey,
    //       access_secret: accessSecret,
    //       endpoint,
    //       region
    //     });

    //     // show form
    //     setModalStatus(true);

    //   }
    // });
    if (config) {
      const { accessKey, accessSecret, endpoint, region } = config;
      // load to form
      form.setFieldsValue({
        access_key: accessKey,
        access_secret: accessSecret,
        endpoint,
        region
      });

      // show form
      setModalStatus(true);
    }

  }

  const handleCardDeleteActionClick = async (config: IConfigs) => {
    // get data from indexed db
    // await db.transaction('rw', db.configs, async () => {

    //   try {
    //     const currentConfig = await db.configs.where("accessKey").equals(id).delete();
    //     console.log(`Deleted ${currentConfig} records`);
    //   } catch (error) {
    //     console.error(error);
    //     window.electron.log("error", error);
    //   }

    // });

    window.electron.main.configDelete(config.name);

  }

  const handleCardCheckActionClick = async (config: IConfigs) => {
    window.electron.main.checkConfig(config.name);
  }

  React.useEffect(() => {

    (async () => {
      if (window.electron) {

        window.electron.main.configsDump();

        window.electron.ipcRenderer.on('income-check-config-result', (data: any) => {
          console.log('income-check-config-result: ', data);
          if (data === true) {
            notification.success({
              message: `${t('valid account')}`,
              placement: 'bottom',
              style: { backgroundColor: '#F6FFED'},
            });
          }
          else {
            notification.error({
              message: "Oopps!",
              description: "Không thể kiểm tra cấu hình",
              placement: 'bottom',
              style: { backgroundColor: '#FFF2F0'},
            })
          }
        });

        window.electron.ipcRenderer.on('rclone-config-delete-result', (data: boolean) => {
          if (data) {
            notification.success({
              message: `${t('account deleted')}`,
              placement: "bottom",
              style: { backgroundColor: '#F6FFED'},
            });
            form.resetFields();
            window.electron.main.configsDump();
          } else {
            notification.error({
              message: "Oopps!",
              description: `${t('unable to delete configuration')}`,
              placement: "bottom",
              style: { backgroundColor: '#FFF2F0'},
            });
          }
        });

        window.electron.ipcRenderer.on('rclone-config-dump-result', (data: {
          [key: string]: {
            access_key_id: string;
            endpoint: string;
            env_auth: string;
            provider: string;
            region: string;
            secret_access_key: string;
            type: string;
          }
        }) => {
          console.log('rclone-config-dump-result:', data);
          const configsArray = Object.keys(data).map(key => {
            return {
              name: key,
              type: data[key].type,
              accessKey: data[key].access_key_id,
              accessSecret: data[key].secret_access_key,
              endpoint: data[key].endpoint,
              region: data[key].region
            }
          });

          setConfigs(configsArray);
        });

        window.electron.ipcRenderer.on('income-connect-rclone-result', (data: any) => {
          console.log('income-connect-rclone-result:', data);
          setTimeout(async () => {
            if (data === false) {
              notification.error({
                message: "Oopps!",
                description: `${t('cannot connect to Fstorage')}`,
                placement: "bottom",
                style: { backgroundColor: '#FFF2F0'},
              })
            }
            else {

              // after config is created successfully => ls bucket
              // window.electron.main.checkConfig();

              notification.success({
                message: `${t('connect Fstorage success')}`,
                placement: 'bottom',
                style: { backgroundColor: '#F6FFED'},
              });
              // const fields = form.getFieldsValue();
              // // eslint-disable-next-line @typescript-eslint/naming-convention
              // const { access_key, access_secret, endpoint, region } = fields;
              // // add to indexdb

              // await db.transaction('rw', db.configs, async () => {

              //     const oldConfigs = await db.configs.put({
              //       accessKey: access_key,
              //       accessSecret: access_secret,
              //       name: 'Fstorage',
              //       type: 's3',
              //       endpoint,
              //       region
              //     });

              //     console.log('oldConfigs', oldConfigs);
              // });
              window.electron.main.configsDump();
              setModalStatus(false);

            }
            setSubmitting(false);
          }, 1000);
        });
      }
    })();
  }, []);

  return (
    <>
    {(!configs || configs.length === 0) ? (
      <div style={{
        marginTop: '40px'
      }}>
      <Empty
        image={EmptyIcon}
        imageStyle={{
          height: 90
        }}
      >
        <Button type="primary" onClick={() => setModalStatus(true)}>{t('add configuration')}</Button>
      </Empty>
      </div>
    ) : (
      // <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}>
      // {configs.map(config => (
      //   <Col key={config.accessKey} className="gutter-row" span={8} style={{ minWidth: 266 }}>
      //     <Card
      //       actions={[
      //         <EditOutlined key="edit" onClick={() => handleCardEditActionClick(config)} />,
      //         <CheckCircleOutlined key="check" onClick={() => handleCardCheckActionClick(config)} />,
      //         <Popconfirm
      //           placement="bottomRight"
      //           title="Xóa cấu hình?"
      //           description="Bạn có chắc muốn xóa cấu hình này chứ?"
      //           icon={<QuestionCircleOutlined style={{ color: 'red' }} />}
      //           okText="Có, xóa cấu hình này"
      //           cancelText="Không, giữ cấu hình này"
      //           okButtonProps={{ danger: true }}
      //           onConfirm={() => handleCardDeleteActionClick(config)}
      //         >
      //           <DeleteOutlined key="delete" />
      //         </Popconfirm>
      //       ]}
      //       hoverable
      //     >
      //       <Card.Meta
      //         avatar={<Avatar src={FstorageLogo} />}
      //         title={`Cấu hình: ${config.name}`}
      //         description={<Space direction="vertical">
      //           <Typography.Text>Key: {config.accessKey}</Typography.Text>
      //           <Typography.Text>Loại: {config.type}</Typography.Text>
      //         </Space>}
      //       />
      //     </Card>
      //   </Col>
      // ))}
      // </Row>
      <List
        itemLayout="horizontal"
        dataSource={configs}
        pagination={configs.length > 5 ? {
          pageSize: 5
        } : false}
        renderItem={(item) => (
          <List.Item
            actions={[
              <Button className="btn-text" key="check" type="link" icon={<CheckCircleOutlined />} onClick={() => handleCardCheckActionClick(item)}>{t("check")}</Button>,
              <Button className="btn-text" key="edit" type="link" icon={<EditOutlined />} onClick={() => handleCardEditActionClick(item)}>{t("edit")}</Button>,
              <Popconfirm
                key="delete"
                placement="bottomRight"
                title={t('confirm delete')}
                description={t('are you sure you want to delete')}
                icon={<QuestionCircleOutlined style={{ color: 'red' }} />}
                okText="OK"
                cancelText="Cancel"
                okButtonProps={{ danger: true }}
                onConfirm={() => handleCardDeleteActionClick(item)}
              >
                <Button className="btn-unmount" type="link" danger icon={<DeleteOutlined />} />
              </Popconfirm>
            ]}
          >
            <List.Item.Meta
              avatar={<Avatar src={FstorageLogo} />}
              title={`Profile: ${item.name}`}
              description={`${t('type')}: ${item.type}`}
            />
          </List.Item>
        )}
      />
    )}
    <Modal
      open={modalStatus}
      footer={null}
      onCancel={()=>{
        setModalStatus(false);
        setSubmitting(false);
      }}
    >
      <Form
        layout='vertical'
        form={form}
        onFinish={handleSubmit}
        onFinishFailed={handleSubmitFail}
      >
        <Form.Item name="provider" label="Name" initialValue="Fstorage" rules={[{ required: true, message: `${t("enter name config")}` }]}>
          <Input id="provider" placeholder="Fstorage" disabled />
          {/* <Select
            style={{ width: 160}}
            onChange={(value) => {
              form.setFieldValue('provider', value)
            }}
          >
            <Select.Option value="Fstorage">Fstorage</Select.Option>
          </Select> */}
        </Form.Item>
        <Form.Item name="access_key" label="Access key" rules={[{ required: true, message: `${t('enter access key')}` }]}>
          <Input id="access_key_id" placeholder="xxxxxxxxxxxxxx" />
        </Form.Item>
        <Form.Item name="access_secret" label="Secret key" rules={[{ required: true, message: `${t('enter secret key')}` }]}>
          <Input.Password id="secret_access_key" placeholder="xxxxxxxxxxxxxxxxxxx" />
        </Form.Item>
        <Form.Item name="region" label="Region" initialValue="default" rules={[{ required: true, message:`${t('enter region')}` }]}>
          <Input id="region" placeholder="default" />
        </Form.Item>
        <Form.Item name="endpoint" label="Endpoint" initialValue="https://hcm.fstorage.vn" rules={[{ required: true, message: `${t('enter endpoint')}` }]}>
          <Input id="endpoint" placeholder="https://xxxxxxx" />
        </Form.Item>
        {isSubmitFail && (
          <Form.Item>
            <a href="https://docs.fstorage.vn/books/huong-dan-su-dung-portal-fstorage/page/huong-dan-su-dung-portal-fstorage#bkmrk-thi%E1%BA%BFt-l%E1%BA%ADp-t%C3%A0i-kho%E1%BA%A3n" target="_blank" rel="noreferrer">{t('instructions to get key')}</a>
          </Form.Item>
        )}
        <Form.Item style={{ textAlign: "end" }}>
          <Button type="primary" htmlType='submit' loading={submitting}>{t('connect Fstorage')}</Button>
        </Form.Item>
      </Form>
    </Modal>

    </>
  )
}
