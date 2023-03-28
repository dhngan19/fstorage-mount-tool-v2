import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';

// import { CloseOutlined, MinusOutlined } from '@ant-design/icons';
import { Layout } from 'antd';
import i18next from 'i18next';
// interface ButtonStyleType {
//   ghost: boolean;
//   type?: 'link' | 'text' | 'ghost' | 'default' | 'primary' | 'dashed';
//   danger?: boolean;
// }

const RootPage: React.FC = () => {
  const navigate = useNavigate();

  // const [minBtnStyle] = React.useState<ButtonStyleType>({
  //   ghost: true,
  //   type: 'text',
  // });
  // const [exitBtnStyle, setExitBtnStyle] = React.useState<ButtonStyleType>({
  //   ghost: true,
  //   type: 'text',
  // });
  const [ ver, setVer] = React.useState<any>()

  React.useEffect(() => {
    const hasChoco = localStorage.getItem('IS_CHOCO_INSTALLED');
    const hasPsexec = localStorage.getItem('IS_PSEXEC_INSTALLED');
    const hasWinfsp = localStorage.getItem('IS_WINFSP_INSTALLED');
    const hasRclone = localStorage.getItem('IS_RCLONE_INSTALLED');
    const hasAwsCLI = localStorage.getItem('IS_AWSCLI_INSTALLED');
    if (
      hasChoco &&
      hasChoco === '1' &&
      hasPsexec &&
      hasPsexec === '1' &&
      hasWinfsp &&
      hasWinfsp === '1' &&
      hasRclone &&
      hasRclone === '1' &&
      hasAwsCLI &&
      hasAwsCLI === '1'
    ) {
      navigate('main');
    } else {
      navigate('/');
    }
    window.electron.main.getVersion();
    window.electron.ipcRenderer.on('get-version-result', (result:any) => {
      setVer(result)
    })



  }, []);

  return (
    <Layout style={{ height: '100vh', backgroundColor: '#FFFFFF' }}>
      {/* <Layout.Header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 1,
          width: '100%',
          paddingInlineEnd: 0,
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ color: 'white' }}>LOGO</div>
          <div className="top-btn-wrapper">
            <Space.Compact block>
              <Tooltip title="Minimize">
                <Button
                  style={{
                    color: '#FFFFFF!important',
                  }}
                  size="small"
                  type={minBtnStyle.type}
                  icon={<MinusOutlined color="white" />}
                  ghost={minBtnStyle.ghost}
                  danger={minBtnStyle.danger}
                  onClick={() => window.electron.main.minimizeApp()}
                />
              </Tooltip>
              <Tooltip title="Exit">
                <Button
                  size="small"
                  type={exitBtnStyle.type}
                  icon={<CloseOutlined color="white" />}
                  ghost={exitBtnStyle.ghost}
                  danger={exitBtnStyle.danger}
                  onMouseEnter={() =>
                    setExitBtnStyle({
                      ghost: false,
                      type: 'primary',
                      danger: true,
                    })
                  }
                  onMouseLeave={() =>
                    setExitBtnStyle({
                      ghost: true,
                      type: 'text',
                      danger: false,
                    })
                  }
                  onClick={() => window.electron.main.exitApp()}
                />
              </Tooltip>
            </Space.Compact>
          </div>
        </div>
      </Layout.Header> */}

      <Layout.Content style={{ padding: '0' }}>
        <Outlet />
      </Layout.Content>
      <Layout.Footer style={{ height: '20px', padding: '0px 10px', display: 'flex', alignItems: 'center', width: '50px' , backgroundColor: "#1853C2", borderRadius: "0px 8px 0px 0px"}}>
        <span
          style={{
            fontSize: '10px',
            color: 'white'
          }}
        >
          v{ver}
        </span>
      </Layout.Footer>
    </Layout>
  );
};

export default RootPage;
