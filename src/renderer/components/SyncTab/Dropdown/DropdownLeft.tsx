import { FolderFilled } from '@ant-design/icons';
import { Button, Dropdown, MenuProps } from 'antd';
import React from 'react';

interface DropdownLeftProps {
  isDisabled: boolean;
  setIsDisabled: React.Dispatch<React.SetStateAction<boolean>>;
  setOpenDialogS3: React.Dispatch<React.SetStateAction<boolean>>;
  setIsFromOrTo: React.Dispatch<React.SetStateAction<boolean>>;
}

const DropdownLeft = ({isDisabled, setIsDisabled, setOpenDialogS3, setIsFromOrTo} : DropdownLeftProps) => {
  const items: MenuProps['items'] = [
    {
      label: (
        <Button
          type="text"
          icon={<FolderFilled />}
          style={{
            width: '100%',
            height: '100%',
            textAlign: 'left',
            padding: '10px 10px',
          }}
          onClick={() => {
            setIsDisabled(true);
            setOpenDialogS3(true);
            setIsFromOrTo(false);
          }}
        >
          S3 Folder
        </Button>
      ),
      key: '0',
    },
    {
      label: (
        <Button
          type="text"
          icon={<FolderFilled />}
          onClick={() => {
            setIsDisabled(true);
            window.electron.main.getFolderSync('left');
          }}
          style={{
            width: '100%',
            height: '100%',
            textAlign: 'left',
            padding: '10px 10px',
          }}
        >
          Local Folder
        </Button>
      ),
      key: '1',
    },
  ];
  return (
    <>
      <Dropdown menu={{ items }} trigger={['click']} placement="bottomRight" disabled={isDisabled}>
        <Button
          style={{
            height: '100%',
            backgroundColor: '#FFC700',
            fontSize: '20px',
            display: 'flex',
            alignItems: 'center',
          }}
          type="primary"
          onClick={(e) => e.preventDefault()}
        >
          <FolderFilled />
        </Button>
      </Dropdown>
    </>
  );
};

export default DropdownLeft;
