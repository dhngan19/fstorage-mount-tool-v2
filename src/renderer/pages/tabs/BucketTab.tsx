/* eslint-disable no-lonely-if */
/* eslint-disable guard-for-in */
/* eslint-disable react/jsx-props-no-spreading */
import {
  DatabaseOutlined,
  DeleteOutlined,
  DownloadOutlined,
  FileFilled,
  FolderFilled,
  HomeOutlined,
  InfoCircleOutlined,
  PlusCircleOutlined,
  RedoOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import {
  Button,
  notification,
  Table,
  Breadcrumb,
  Tooltip,
  Input,
  Spin,
  Dropdown,
  Space,
  ConfigProvider,
  Empty,
} from 'antd';
import React from 'react';
import { Process } from 'renderer/components/Process';
import { FormatBytes, FormatDate } from 'renderer/helpers/file-explorer-helper';
import ModalDeleteFile from 'renderer/components/BucketTab/Modal/ModalDeleteFile';
import ModalDeleteFolder from 'renderer/components/BucketTab/Modal/ModalDeleteFolder';
import ModalCreateBucket from 'renderer/components/BucketTab/Modal/ModalCreateBucket';
import ModalDetail from 'renderer/components/BucketTab/Modal/ModalDetail';
import type { MenuProps } from 'antd';
import {
  UploadFileIcon,
  UploadFolderIcon,
} from 'renderer/components/CustomIcon';
import { useTranslation } from 'react-i18next';
import EmptyIcon from '../../../../assets/empty.svg';

interface IFileListOptions {
  success: boolean;
  data: Array<{
    Path: string;
    Name: string;
    Size: number;
    ModTime: string;
    IsDir: boolean;
    IsBucket: boolean;
    Metadata: {
      btime: string;
      'content-type': string;
      mtime: string;
    };
  }>;
}

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
interface FileProcess {
  name: string;
  action: string;
  status: string;
  process: string;
  type: string;
  pid: string;
  error: string[];
}

interface DetailType {
  name: string;
  size: number;
  time: string;
  path: string | null;
  object: string | null;
}

export const BucketTab: React.FC = () => {
  const { t } = useTranslation();
  const [availableFiles, setAvailableFiles] = React.useState<DataType[]>([]);
  const [breadcrumb, setBreadcrumb] = React.useState<Array<any> | undefined>(
    []
  );
  const [fileUpProgress, setFileUpProgress] = React.useState<FileProcess[]>(
    []
  );
  const [paginationVal, setPaginationVal] = React.useState<number>(100);
  const [loading, setLoading] = React.useState(false);
  const [searchText, setSearchText] = React.useState('');
  const [isModalDeleteFileOpen, setIsModalDeleteFileOpen] =
    React.useState(false);
  const [isModalDeleteFolOpen, setIsModalDeleteFolOpen] = React.useState(false);
  const [isModalCreateBucketOpen, setIsModalCreateBucketOpen] =
    React.useState(false);
  const [isModalDetailOpen, setIsModalDetailOpen] = React.useState(false);
  const [nameDelete, setNameDelete] = React.useState('');
  const [detailProp, setDetailProps] = React.useState<DetailType>({
    name: '',
    size: 0,
    time: '',
    path: '',
    object: null,
  });
  const [loadingDetail, setLoadingDetail] = React.useState(false);


  const handleDownloadFile = (nameFile: string) => {
    const downTrans = localStorage.getItem('DOWN_TRANS');
    let transfer = 0;
    if (downTrans !== null) {
      transfer = parseFloat(downTrans);
    } else {
      transfer = 5;
    }

    let pathStorage = localStorage.getItem('PATH_SRC');
    pathStorage += `${nameFile}`;
    if (pathStorage !== null) {
      if (window.electron) {
        window.electron.main.downloadFile(pathStorage, transfer);
      }
    }
  };

  const handleDownloadFolder = (nameFolder: string) => {
    const downTrans = localStorage.getItem('DOWN_TRANS');
    let transfer = 0;
    if (downTrans !== null) {
      transfer = parseFloat(downTrans);
    } else {
      transfer = 5;
    }

    let pathStorage = localStorage.getItem('PATH_SRC');
    pathStorage += `${nameFolder}`;
    if (pathStorage !== null) {
      if (window.electron) {
        window.electron.main.downloadFolder(pathStorage, transfer);
      }
    }
  };

  const handleShowDetailDir = (nameDir: string) => {
    const path = localStorage.getItem('PATH_SRC');
    if (path !== null && path !== '')
    window.electron.main.getDetailDir(nameDir, path);
    else if (path === '') {
      window.electron.main.getDetailDir(nameDir, '');
    }
    setLoadingDetail(true);
    setIsModalDetailOpen(true);
  };

  const handleShowDetail = (_name: string, _size: number, _time: string) => {
    setDetailProps({
      name: _name,
      size: _size,
      time: FormatDate(_time),
      path: localStorage.getItem('PATH_SRC'),
      object: null,
    });
    setLoadingDetail(true);
    setIsModalDetailOpen(true);
  };

  const columns = [
    {
      title: `${t('name')}`,
      key: 'Name',
      dataIndex: 'Name',
      width: '40%',
      filteredValue: [searchText],
      onFilter: (value: any, record: DataType) => {
        return String(record.Name).toLowerCase().includes(value.toLowerCase());
      },
      render: (_: unknown, record: DataType) => (
        <>
          {record.IsBucket && (
            <>
              <DatabaseOutlined
                style={{
                  color: '#1853C2',
                  marginRight: '10px',
                }}
              />
              <Tooltip title={record.Name}>
                <span
                  style={{
                    color: '#1853C2',
                  }}
                >
                  {record.Name.length < 40 ? (
                    record.Name
                  ) : (
                    <>
                      {record.Name.slice(0, 40)}
                      ...
                    </>
                  )}
                </span>
              </Tooltip>
            </>
          )}

          {!record.IsBucket && record.IsDir && (
            <>
              <FolderFilled
                style={{
                  color: '#FFC700',
                  marginRight: '10px',
                }}
              />
              <Tooltip title={record.Name}>
                <span>
                  {record.Name.length < 40 ? (
                    record.Name
                  ) : (
                    <>
                      {record.Name.slice(0, 40)}
                      ...
                    </>
                  )}
                </span>
              </Tooltip>
            </>
          )}

          {!record.IsDir && (
            <>
              <FileFilled
                style={{
                  color: '#B9B9B9',
                  marginRight: '10px',
                }}
              />
              <Tooltip title={record.Name}>
                <span>
                  {record.Name.length < 40 ? (
                    record.Name
                  ) : (
                    <>
                      {record.Name.slice(0, 40)}
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
      title: `${t('size')}`,
      key: 'Size',
      dataIndex: 'Size',
      sorter: (a: DataType, b: DataType) => {
        return a.Size - b.Size;
      },
      render: (_: unknown, record: DataType) => (
        <>{record.IsDir ? <>-</> : <>{FormatBytes(record.Size)}</>}</>
      ),
    },
    {
      title: `${t('modTime')}`,
      key: 'ModTime',
      dataIndex: 'ModTime',
      sorter: (a: DataType, b: DataType) => {
        const aDate = new Date(a.Metadata?.btime).getTime();
        const bDate = new Date(b.Metadata?.btime).getTime();
        return aDate - bDate;
      },
      render: (_: unknown, record: DataType) => (
        <>
          <div>
            {record.Metadata ? (
              <>{FormatDate(record.Metadata.btime)}</>
            ) : (
              <>-</>
            )}
          </div>
        </>
      ),
    },
    {
      title: `${t('type')}`,
      key: 'Type',
      dataIndex: 'Type',
      render: (_: unknown, record: DataType) => {
        let typeText = '';
        if (record.Metadata) {
          typeText = record.Metadata['content-type'].slice(
            record.Metadata['content-type'].indexOf('/') + 1,
            record.Metadata['content-type'].length
          );
        }
        return (
          <>
            <div>
              {record.Metadata ? (
                <>
                  <Tooltip title={typeText}>
                    <span>
                      {typeText.length < 20 ? (
                        typeText
                      ) : (
                        <>
                          {typeText.slice(0, 20)}
                          ...
                        </>
                      )}
                    </span>
                  </Tooltip>
                </>
              ) : (
                <>-</>
              )}
            </div>
          </>
        );
      },
    },
    {
      title: '',
      dataIndex: 'Name',
      render: (_: unknown, record: DataType) => (
        <div
          style={{
            textAlign: 'center',
          }}
        >
          {!record.IsDir && (
            <>
              <Button
                size="small"
                type="text"
                className="btn-text"
                style={{
                  borderRadius: '50%',
                }}
                onClick={() => {
                  handleShowDetail(
                    record.Name,
                    record.Size,
                    record.Metadata.btime
                  );
                }}
              >
                <InfoCircleOutlined />
              </Button>
              <Button
                size="small"
                className="btn-text"
                type="text"
                style={{
                     marginLeft: '5px',
                  borderRadius: '50%',
                }}
                onClick={() => handleDownloadFile(record.Name)}
              >
                <DownloadOutlined />
              </Button>
              <Button
                size="small"
                type="text"
                className="btn-text"
                onClick={() => {
                  setIsModalDeleteFileOpen(true);
                  setNameDelete(record.Name);
                }}
                style={{
                  marginLeft: '5px',
                  borderRadius: '50%',
                }}
              >
                <DeleteOutlined />
              </Button>
            </>
          )}

          {record.IsDir && (
            <>
              <Button
                size="small"
                type="text"
                className="btn-text"
                style={{
                  borderRadius: '50%',
                }}
                onClick={() => {
                  handleShowDetailDir(record.Name);
                }}
              >
                <InfoCircleOutlined />
              </Button>
              <Button
                size="small"
                type="text"
                className="btn-text"
                style={{
                  marginLeft: '5px',
                  borderRadius: '50%',
                }}
                onClick={() => handleDownloadFolder(record.Name)}
              >
                <DownloadOutlined />
              </Button>
              <Button
                size="small"
                type="text"
                className="btn-text"
                onClick={() => {
                  setIsModalDeleteFolOpen(true);
                  setNameDelete(record.Name);
                }}
                style={{
                  marginLeft: '5px',
                  borderRadius: '50%',
                }}
              >
                <DeleteOutlined />
              </Button>
            </>
          )}
        </div>
      ),
    },
  ];

  const loadAvailableFile = (fileName: string) => {
    if (window.electron) {
      window.electron.main.getFileList(fileName);
    }
  };

  const handleFilePath = (fileName: string) => {
    let pathSrc: string | null = localStorage.getItem('PATH_SRC');
    if (pathSrc === null) {
      localStorage.setItem('PATH_SRC', '');
    } else {
      pathSrc += `${fileName}/`;
      localStorage.setItem('PATH_SRC', pathSrc);
    }
  };

  const handleLoadFile = () => {
    // setAvailableFiles([])
    const filePath = localStorage.getItem('PATH_SRC');
    setLoading(true);
    if (filePath !== null) {
      loadAvailableFile(filePath);
    } else {
      loadAvailableFile('');
    }
  };

  const handleClickBreadcrumb = (index: number) => {
    let path = '';
    if (breadcrumb !== undefined) {
      // eslint-disable-next-line no-plusplus
      for (let i = 0; i <= index; i++) {
        path += `${breadcrumb[i]}/`;
      }
    }
    setLoading(true);
    localStorage.setItem('PATH_SRC', path);
    loadAvailableFile(path);
  };

  const handleUploadFile = () => {
    if (window.electron) {
      const pathStorage = localStorage.getItem('PATH_SRC');
      const upTrans = localStorage.getItem('UP_TR');
      let transfer = 0;
      if (upTrans !== null) {
        transfer = parseFloat(upTrans);
      } else {
        transfer = 5;
      }

      if (pathStorage !== null) {
        window.electron.main.uploadFile(pathStorage, transfer);
      }
    }
  };

  const handleUploadFolder = () => {
    if (window.electron) {
      const pathStorage = localStorage.getItem('PATH_SRC');
      const upTrans = localStorage.getItem('UP_TRANS');
      let transfer = 0;
      if (upTrans !== null) {
        transfer = parseFloat(upTrans);
      } else {
        transfer = 5;
      }
      if (pathStorage !== null) {
        window.electron.main.uploadFolder(pathStorage, transfer);
      }
    }
  };

  React.useEffect(() => {
    (async () => {
      if (window.electron) {
        window.electron.ipcRenderer.on(
          'income-get-file-result',
          (result: IFileListOptions) => {
            if (!result.success) {
              notification.error({
                message: 'Oopps!',
                description: `${t('unable to load data')}`,
                placement: 'bottom',
                style: { backgroundColor: '#FFF2F0' },
              });
            } else if (result.data) {
              if (result.data.length <= 0) {
                setAvailableFiles([]);
              } else if (
                result.data.length > 0 &&
                result.data.length <= 10000
              ) {
                setPaginationVal(500);
                setAvailableFiles(result.data);
              } else if (
                result.data.length > 10000 &&
                result.data.length <= 100000
              ) {
                setPaginationVal(2000);
                setAvailableFiles(result.data);
              } else if (result.data.length > 100000) {
                setPaginationVal(5000);
                setAvailableFiles(result.data);
              }
              const arrayBreadcumb = localStorage
                .getItem('PATH_SRC')
                ?.split('/');
              setBreadcrumb(arrayBreadcumb);
            }
            setLoading(false);
          }
        );

        window.electron.ipcRenderer.on(
          'upload-file-process-result',
          (result: any) => {
            if (result.success === false) {
              notification.warning({
                message: 'Oopps!',
                description: `${t('please wait for the process to complete')}`,
                placement: 'bottom',
                style: { backgroundColor: '#FFFBE6' },
              });
            } else {
              setFileUpProgress(result.data);
            }
          }
        );

        window.electron.ipcRenderer.on(
          'create-bucket-result',
          (result: any) => {
            if (result.success) {
              handleLoadFile();
              notification.success({
                message: `${t('created success')}`,
                placement: 'bottom',
                style: { backgroundColor: '#F6FFED' },
              });
            } else {
              notification.warning({
                message: 'Oopps!',
                description: `${t('bucket name had used by other user')}`,
                placement: 'bottom',
                style: { backgroundColor: '#FFFBE6' },
              });
            }
          }
        );

        window.electron.ipcRenderer.on(
          'get-detail-dir-result',
          (result: any) => {
            if (result.flagBoolean) {
              setDetailProps(result.res);
              // setIsModalDetailOpen(true);
              setLoadingDetail(false);
            } else {
              notification.error({
                message: 'Oopps!',
                description: `${t('unable to load data')}`,
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
    (async () => {
      if (window.electron) {
        setLoading(true);
        localStorage.setItem('PATH_SRC', '');
        window.electron.main.getFileList('');
        window.electron.main.getProcessList();
      }
    })();
  }, []);

  const tableLoading = {
    spinning: loading,
    indicator: (
      <div
        style={{
          width: '100%',
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%,-50%)',
        }}
      >
        <div>
          <div>
            <Spin />
          </div>
          {t('please wait a few seconds')}
        </div>
      </div>
    ),
  };

  const items: MenuProps['items'] = [
    {
      label: (
        <Button
          type="text"
          icon={<UploadFileIcon/>}
          style={{
            width: '100%',
            height: '100%',
            textAlign: 'left',
            display: 'flex',
            alignItems: 'center'
          }}
          onClick={handleUploadFile}
        >
          {t('upload file')}
        </Button>
      ),
      key: '0',
    },
    {
      label: (
        <Button
          type="text"
          icon={<UploadFolderIcon />}
          onClick={handleUploadFolder}
          style={{
            width: '100%',
            height: '100%',
            textAlign: 'left',
            display: 'flex',
            alignItems: 'center'
          }}
        >
          {t('upload folder')}
        </Button>
      ),
      key: '1',
    },
  ];

  return (
    <div>
      <div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            marginBottom: '6px',
          }}
        >
          <Input.Search
            allowClear
            placeholder={t('search')}
            onSearch={(value) => {
              setSearchText(value);
            }}
            onChange={(e) => {
              setSearchText(e.target.value);
            }}
            style={{
              width: '330px',
            }}
          />
        </div>
        <div
          style={{
            textAlign: 'right',
            display: 'flex',
            justifyContent: 'flex-end',
          }}
        >
          <Button
            type="text"
            icon={<RedoOutlined rotate={90} />}
            style={{
              color: '#1853C2',
              marginRight: '15px',
            }}
            className="btn-text"
            onClick={() => {
              setLoading(true);
              const path = localStorage.getItem('PATH_SRC');
              if (path !== null) {
                loadAvailableFile(path);
              } else {
                loadAvailableFile('');
              }
            }}
          >
            {t('refresh')}
          </Button>
          {localStorage.getItem('PATH_SRC') !== '' &&
            localStorage.getItem('PATH_SRC') !== null && (
              <>
                <Dropdown menu={{ items }} trigger={['click']}>
                  <Button type="primary" onClick={(e) => e.preventDefault()}>
                    <Space>
                      <UploadOutlined />
                      {t('upload')}
                    </Space>
                  </Button>
                </Dropdown>
              </>
            )}
          {localStorage.getItem('PATH_SRC') === '' && (
            <Button
              type="primary"
              icon={<PlusCircleOutlined />}
              style={{
                fontWeight: '600',
              }}
              onClick={() => {
                setIsModalCreateBucketOpen(true);
              }}
            >
              {t('create bucket')}
            </Button>
          )}
        </div>
        <div
          style={{
            marginBottom: '6px',
          }}
        >
          <Breadcrumb className="custom-ant-breadcrumb">
            <span
              style={{
                marginRight: '10px',
              }}
            >
              {t('path')}:
            </span>
            <Button
              size="small"
              type="text"
              onClick={() => {
                setLoading(true);
                localStorage.setItem('PATH_SRC', '');
                loadAvailableFile('');
              }}
            >
              <HomeOutlined />
            </Button>
            <span>/</span>
            {loading ? (
              <></>
            ) : (
              <>
                {breadcrumb !== undefined &&
                  breadcrumb.map((item, index) => (
                    <Breadcrumb.Item>
                      <Button
                        size="small"
                        type="text"
                        onClick={() => {
                          handleClickBreadcrumb(index);
                        }}
                      >
                        {item.split('/')}
                      </Button>
                    </Breadcrumb.Item>
                  ))}
              </>
            )}
          </Breadcrumb>
        </div>

        <ConfigProvider
          renderEmpty={() => (
            <Empty
              image={EmptyIcon}
              imageStyle={{
                height: 120,
              }}
            />
          )}
        >
          <Table
              id='table-fixed-height'
            size="small"
            dataSource={availableFiles}
            columns={columns}
            loading={tableLoading}
            pagination={{
              pageSize: paginationVal,
              pageSizeOptions: [paginationVal],
            }}
            scroll={{ y: '200px' }}
            onRow={(record) => {
              return {
                onDoubleClick: () => {
                  if (record.IsDir) {
                    handleFilePath(record.Name);
                    handleLoadFile();
                  }
                },
              };
            }}
            className="custom-scrollbar"
          />
        </ConfigProvider>
      </div>
      <div
      >
        <Process dataUp={fileUpProgress} setDataUp={setFileUpProgress}/>
      </div>
      <ModalDeleteFile
        open={isModalDeleteFileOpen}
        setOpen={setIsModalDeleteFileOpen}
        name={nameDelete}
        data={availableFiles}
        setData={setAvailableFiles}
      />
      <ModalDeleteFolder
        open={isModalDeleteFolOpen}
        setOpen={setIsModalDeleteFolOpen}
        name={nameDelete}
        data={availableFiles}
        setData={setAvailableFiles}
      />
      <ModalCreateBucket
        open={isModalCreateBucketOpen}
        setOpen={setIsModalCreateBucketOpen}
        data={availableFiles}
      />
      <ModalDetail open={isModalDetailOpen} setOpen={setIsModalDetailOpen} loading={loadingDetail} data={detailProp}/>
    </div>
  );
};
