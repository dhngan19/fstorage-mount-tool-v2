import { Col, Modal, Row, Spin } from 'antd';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { FormatBytes } from 'renderer/helpers/file-explorer-helper';

interface DataType {
  name: string;
  size: number;
  time: string;
  path: string | null;
  object: string | null;
}

interface ModalDetailProps {
  open: boolean;
  loading: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  data: DataType;
}

const ModalDetail = (props: ModalDetailProps) => {
  const { t } = useTranslation();
  const { open, setOpen, data, loading } = props;
  return (
    <>
      <Modal
        title={t('System properties')}
        open={open}
        onCancel={() => {
          setOpen(false);
        }}
        okButtonProps={{ style: { display: 'none' } }}
        cancelButtonProps={{ style: { display: 'none' } }}
        width={400}
      >
        {loading ? (
          <Spin size='small'/>
        ) : (
          <Row style={{ fontSize: '14px' }}>
            <Col span={8}>{t('name')}:</Col>
            <Col span={16}>{data.name}</Col>
            <Col span={8}>{t('size')}:</Col>
            <Col span={16}>{data.size !== 0 && FormatBytes(data.size)}</Col>
            <Col span={8}>{t('modTime')}:</Col>
            <Col span={16}>{data.time}</Col>
            <Col span={8}>{t('path')}:</Col>
            <Col span={16}>
              <span style={{ fontWeight: '600' }}>{data.path === '' ? "/" : data.path}</span>
            </Col>
            {data.object !== null && (
              <>
                <Col span={8}>Objects:</Col>
                <Col span={16}>{data.object}</Col>
              </>
            )}
          </Row>
        )}
      </Modal>
    </>
  );
};

export default ModalDetail;
