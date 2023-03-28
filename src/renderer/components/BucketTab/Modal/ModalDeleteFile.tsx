import { Modal } from 'antd';
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
interface ModalDeleteFileProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  name: string;
  data: DataType[];
  setData: React.Dispatch<React.SetStateAction<DataType[]>>
}

const ModalDeleteFile = (props: ModalDeleteFileProps) => {
  const { t } = useTranslation();
  const { open, setOpen, name ,data, setData} = props;

  const handleConfirmDeleteFile = () => {
    const newData = data.filter((item) => item.Name !== name && item.IsDir !== true);
    setData(newData);
    const pathStorage = localStorage.getItem('PATH_SRC');
    if (pathStorage !== null) {
      if (window.electron) {
        window.electron.main.deleteFile(name, pathStorage);
      }
    }
    setOpen(false);
  };

  return (
    <>
      <Modal
        title={t('confirm delete')}
        open={open}
        onOk={handleConfirmDeleteFile}
        onCancel={() => {
          setOpen(false);
        }}
      >
        <p>
          {t('are you sure you want to delete')}{' '}
          <span
            style={{
              color: 'red',
            }}
          >
            {name}
          </span>{' '}
          ?
        </p>
      </Modal>
    </>
  );
};

export default ModalDeleteFile;
