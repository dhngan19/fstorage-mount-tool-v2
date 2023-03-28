import { DatabaseOutlined, FolderFilled } from '@ant-design/icons';
import { ConfigProvider, Empty, Modal, notification, Spin, Table, Tooltip } from 'antd';
import React from 'react';
import { useTranslation } from 'react-i18next';
import EmptyIcon from '../../../../../assets/empty.svg';


interface ModalDialogS3Props {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setIsDisabledDialog: React.Dispatch<React.SetStateAction<boolean>>;
  setPathFrom: React.Dispatch<React.SetStateAction<string>>;
  setPathTo: React.Dispatch<React.SetStateAction<string>>;
  isFromOrTo: boolean;
}

interface FolderListType {
  Path: string;
  Name: string;
  Size: number;
  ModTime: string;
  IsDir: boolean;
  IsBucket: boolean;
}


const ModalDialogS3 = (props : ModalDialogS3Props) => {
  const [availableFolder, setAvailableFolder] = React.useState<FolderListType[]>([]);
  const [loading, setLoading] = React.useState(false);
  const {t} = useTranslation();
  const {open, setOpen, setIsDisabledDialog, setPathFrom, setPathTo, isFromOrTo} = props;
  const [ pathValue, setPathValue ] = React.useState<string>('');

  const columns = [
    {
      title: `${t('name')}`,
      key: 'Name',
      dataIndex: 'Name',
      width: '40%',
      render: (_: unknown, record: FolderListType) => (
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
        </>
      ),
    },
  ];

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

  const handleCancel = () => {
    setOpen(false);
    setIsDisabledDialog(false);
    setPathValue('');
  }

  const handleOk = () => {
    if (isFromOrTo) {
      const pathRes = `Fstorage:${pathValue}` ;
      setPathTo(pathRes);
    } else {
      const pathRes = `Fstorage:${pathValue}` ;
      setPathFrom(pathRes);
    }
    setOpen(false);
    setIsDisabledDialog(false);
    setPathValue('');
  }

  const handleDoubleClick = (value : string) => {
    const pathTemp = `${pathValue}/${value}`;
    setLoading(true);
    window.electron.main.getFolderList(pathTemp);
    setPathValue(pathTemp);
  }

  React.useEffect(() => {
    window.electron.ipcRenderer.on('get-folder-list-result', (result: any) => {
      if (!result.success) {
        notification.error({
          message: 'Oopps!',
          description: `${t('unable to load data')}`,
          placement: 'bottom',
          style: { backgroundColor: '#FFF2F0' },
        });
      } else {
        setAvailableFolder(result.data);
      }
      setLoading(false);
    });
  },[])

  React.useMemo(() => {
    if (window.electron) {
      setLoading(true);
      window.electron.main.getFolderList('');
    }
  },[open])

  return (
    <>
      <Modal
        title="Select Folder S3"
        open={open}
        onOk={handleOk}
        onCancel={handleCancel}
      >
        <p>Fstorage:{pathValue}</p>
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
              // id='table-fixed-height'
            pagination={false}
            size="small"
            dataSource={availableFolder}
            columns={columns}
            loading={tableLoading}
            scroll={{ y: '200px'}}
            onRow={(record) => {
              return {
                onDoubleClick: () => {
                  if (record.IsDir) {
                    console.log(record.Name);
                    handleDoubleClick(record.Name);
                    // handleFilePath(record.Name);
                  }
                },
              };
            }}
            className="custom-scrollbar"
          />
        </ConfigProvider>

      </Modal>
    </>
  );
};

export default ModalDialogS3;
