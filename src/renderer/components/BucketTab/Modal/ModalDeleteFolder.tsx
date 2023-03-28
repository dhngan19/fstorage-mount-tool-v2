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
interface ModalDeleteFolderProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  name: string;
  data: DataType[];
  setData: React.Dispatch<React.SetStateAction<DataType[]>>
}

const ModalDeleteFolder = (props: ModalDeleteFolderProps) => {
  const { open, setOpen, name, data, setData } = props;
  const { t } = useTranslation();
  const handleConfirmDeleteFol = () => {
    const newData = data.filter((item) => item.Name !== name && item.IsDir !== false);
    setData(newData);
    const pathStorage = localStorage.getItem('PATH_SRC');
    if (pathStorage !== null) {
      if (window.electron) {
        window.electron.main.deleteFolder(name, pathStorage);
      }
    }
    setOpen(false);
  };

  return (
    <>
      <Modal
        title={t('confirm delete')}
        open={open}
        onOk={handleConfirmDeleteFol}
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

export default ModalDeleteFolder;
