import React from 'react';
import { Link } from 'react-router-dom';
import { Result, Button, Spin, Typography, Row, Col } from 'antd';

// import AIcon from '../../../assets/waving-hand.svg';
import WelcomeImg from '../../../assets/welcome_img.svg';
import WelcomeBg from '../../../assets/welcome_bg.svg';

export const WelcomePage: React.FC = () => {
  const [isAdmin, setIsAdmin] = React.useState<boolean>();

  React.useEffect(() => {
    window.electron.validates.isAdmin();
    window.electron.ipcRenderer.on('income-check-admin', (data: unknown) => {
      console.log('income-check-admin: ', data);
      setTimeout(() => setIsAdmin(Boolean(data)), 1000);
      // if (data === true) {
      //   setIsAdmin(true);
      // }=
    });
  }, []);

  if (isAdmin === undefined) {
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
    <>
      {isAdmin === false ? (
        <Result
          status="warning"
          title="You need to run this tool as administrator"
        />
      ) : (
        <div>
          <Row style={{ minHeight: '100vh' }}>
            <Col
              span={12}
              style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <Result
                style={{ maxWidth: 575, margin: 'auto', textAlign: 'left' }}
                icon={
                  <div>
                    {/* <img src={AIcon} alt="waving-hand" /> */}

                    <Typography.Title
                      style={{
                        fontWeight: 600,
                        fontSize: '32px',
                        color: '#333333',
                        textAlign: 'left',
                      }}
                    >
                      Xin chào
                    </Typography.Title>
                  </div>
                }
                title={
                  <div>
                    <Typography.Title
                      style={{
                        fontWeight: 400,
                        fontSize: '16px',
                        textAlign: 'left',
                      }}
                    >
                      Vui lòng tiến hành bước cài đặt các tool cần thiết trước
                      khi sử dụng.
                    </Typography.Title>
                  </div>
                }
                extra={
                  <div
                    style={{
                      textAlign: 'left',
                    }}
                  >
                    <Link to="/setup">
                      <Button type="primary" style={{ fontWeight: 600 }}>
                        Tiếp tục
                      </Button>
                    </Link>
                  </div>
                }
              />
            </Col>
            <Col
              span={12}
              style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundImage: `url(${WelcomeBg})`,
              }}
            >
              <img src={WelcomeImg} alt="" />
            </Col>
          </Row>
        </div>
      )}
    </>
  );
};
