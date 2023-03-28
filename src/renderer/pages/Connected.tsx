import React from "react";
import { useNavigate } from 'react-router-dom';

import { Spin, Empty, Button, Typography } from "antd";

import EmptyIcon from '../../../assets/empty.svg'

export const ConnectedPage: React.FC = () => {

  const navigate = useNavigate();

  const [hasConfig, setHasConfig] = React.useState<boolean>();

  React.useEffect(() => {
    const hasAKey = localStorage.getItem("ACCESS_KEY");
    const hasSKey = localStorage.getItem("ACCESS_SECRET");
    const hasRegion = localStorage.getItem("REGION");
    const hasEndpoint = localStorage.getItem("ENDPOINT");
    if (!hasAKey || !hasSKey || !hasRegion || !hasEndpoint) {
      navigate('main');
    }
    else {
      setHasConfig(true);
    }
  }, []);

  if (hasConfig === undefined) {
    return (
      <div
        style={{
          width: '100%',
          position: 'absolute',
          top: '50%',
          left: '50%',
        }}
      >
        <Spin tip="Loading" size="large" />
      </div>
    );
  }

  return (
    <Empty
      image={EmptyIcon}
      imageStyle={{ height: 60}}
      description={<Typography.Title level={2}>Chưa có Buckets nào được Mount</Typography.Title>}
    >
      <Button type="primary">Mount Bucket</Button>
    </Empty>
  );
}

