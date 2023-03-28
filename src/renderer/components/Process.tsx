/* eslint-disable react/no-array-index-key */
/* eslint-disable no-plusplus */
/* eslint-disable no-lonely-if */
import {
  CheckCircleFilled,
  CloseCircleFilled,
  DeleteOutlined,
  FileFilled,
  FolderFilled,
  RedoOutlined,
  StopOutlined,
} from '@ant-design/icons';
import {
  Button,
  ConfigProvider,
  Empty,
  notification,
  Progress,
  Table,
  Tooltip,
} from 'antd';
import React from 'react';
import { useTranslation } from 'react-i18next';
import EmptyIcon from '../../../assets/empty.svg';

interface FileProcessProps {
  dataUp: FileProcess[];
  setDataUp: React.Dispatch<React.SetStateAction<FileProcess[]>>
}

interface FileProcess {
  name: string;
  action: string;
  status: string;
  process: string;
  type: string;
  pid: string;
  error: string[];
}

export const Process = ({ dataUp,setDataUp }: FileProcessProps) => {
  const [fileProcess, setFileProcess] = React.useState<FileProcess[]>([]);
  const { t } = useTranslation();
  const handleClearProcess = () => {
    let flag = 0;
    if (fileProcess !== undefined) {
      for (let i = 0; i < fileProcess.length; i++) {
        if (fileProcess[i].status.indexOf('loading') !== -1) {
          notification.warning({
            message: 'Oopps!',
            description: `${t('please wait for the process to complete')}`,
            placement: 'bottom',
            style: { backgroundColor: '#FFFBE6' },
          });
          flag = 1;
          return;
        }
      }
    }
    if (flag === 0 && fileProcess !== undefined) {
      window.electron.main.clearProcess();
    }
  };

  const handleRefreshProcess = () => {
    if (window.electron) {
      window.electron.main.refreshProcessList();
    }
  };

  const columnsProcess = [
    {
      title: `${t('name')}`,
      key: 'name',
      dataIndex: 'name',
      width: '40%',

      render: (_: unknown, record: FileProcess) => (
        <>
          {record.type === 'file' && (
            <>
              <FileFilled
                style={{
                  color: '#B9B9B9',
                  marginRight: '10px',
                }}
              />
              <Tooltip title={record.name}>
                <span>
                  {record.name.length < 40 ? (
                    record.name
                  ) : (
                    <>
                      {record.name.slice(0, 40)}
                      ...
                    </>
                  )}
                </span>
              </Tooltip>
            </>
          )}

          {record.type === 'folder' && (
            <>
              <FolderFilled
                style={{
                  color: '#FFC700',
                  marginRight: '10px',
                }}
              />
              <Tooltip title={record.name}>
                <span>
                  {record.name.length < 40 ? (
                    record.name
                  ) : (
                    <>
                      {record.name.slice(0, 40)}
                      ...
                    </>
                  )}
                </span>
              </Tooltip>
            </>
          )}
        </>
      ),
    },
    {
      title: `${t('status')}`,
      key: 'action',
      dataIndex: 'action',
      render: (_: unknown, record: FileProcess) => (
        <>
          {record.action === 'upload' && <>Upload</>}
          {record.action === 'download' && <>Download</>}
          {record.action === 'delete' && <>Delete</>}
        </>
      ),
    },
    {
      title: `${t('process')}`,
      key: 'status',
      dataIndex: 'status',
      width: '40%',
      render: (_: unknown, record: FileProcess) => (
        <div>
          {record.status === 'loading' && (
            <>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                }}
              >
                <span>{record.process[0]} </span>
                <span>{record.process[2]} </span>
              </div>
              {record.action !== 'delete' && (
                <Progress
                  status="active"
                  percent={parseFloat(record.process[1])}
                />
              )}
            </>
          )}
          {record.status === 'done' && (
            <>
              <span style={{ color: '#52C41A' }}>
                <CheckCircleFilled /> {t('done')}
              </span>
            </>
          )}
          {record.status === 'fail' && (
            <>
              <span style={{ color: '#FF4D4F' }}>
                <CloseCircleFilled /> {t('failed')}
              </span>
              <br />
              {record.error.map((item, index) => (
                <p key={index}>{item}</p>
              ))}
            </>
          )}
        </div>
      ),
    },
    {
      title: '',
      key: 'status',
      dataIndex: 'status',
      render: (_: unknown, record: FileProcess) => (
        <div>
          {record.status === 'loading' && (
            <div
              style={{
                textAlign: 'center',
              }}
            >
              <Button
                size="small"
                type="text"
                className="btn-text"
                style={{
                  borderRadius: '50%',
                }}
                onClick={() => {
                  window.electron.main.cancelProcess(record.pid);
                }}
              >
                <StopOutlined />
              </Button>
            </div>
          )}
        </div>
      ),
    },
  ];

  React.useMemo(() => {
    setFileProcess(dataUp);
  }, [dataUp]);

  React.useEffect(() => {
    (async () => {
      if (window.electron) {
        window.electron.ipcRenderer.on(
          'income-upload-folder-result',
          (result: any) => {
            setFileProcess(result);
          }
        );

        window.electron.ipcRenderer.on(
          'income-upload-file-result',
          (result: any) => {
            setFileProcess(result);
          }
        );

        window.electron.ipcRenderer.on(
          'download-file-result',
          (result: any) => {
            setFileProcess(result);
          }
        );

        window.electron.ipcRenderer.on(
          'download-folder-result',
          (result: any) => {
            setFileProcess(result);
          }
        );

        window.electron.ipcRenderer.on('delete-result', (result: any) => {
          if (result.success) {
            // handleLoadFile();
            setFileProcess(result.data);
            setDataUp(result.data)
          } else {
            setFileProcess(result.data);
          }
        });
      }
    })();
  }, []);

  return (
    <>
      <div>
        <ConfigProvider
          renderEmpty={() => (
            <Empty
              image={EmptyIcon}
              imageStyle={{
                height: 80,
              }}
            />
          )}
        >
          <Table
            id='table-fixed-height-2'
            size="small"
            dataSource={fileProcess}
            columns={columnsProcess}
            // loading={loading}
            pagination={false}
            scroll={{ y: 140 }}
            className="process_table custom-scrollbar"
          />
        </ConfigProvider>
      </div>
      <div
        style={{
          marginTop: '6px',
          display: 'flex',
          justifyContent: 'flex-end',
        }}
      >
        <Button
          type="text"
          className="btn-text"
          onClick={handleRefreshProcess}
          style={{
            marginRight: '10px',
            color: '#1853C2',
          }}
        >
          <RedoOutlined rotate={90} /> {t('refresh')}
        </Button>
        <Button
          type="text"
          onClick={handleClearProcess}
          className="btn-text"
          style={{ color: '#1853C2' }}
        >
          <DeleteOutlined /> {t('delete all')}
        </Button>
      </div>
    </>
  );
};
