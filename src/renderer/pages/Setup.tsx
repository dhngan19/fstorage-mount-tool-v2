import React from 'react';
import {
  Button,
  InputRef,
  Result,
  notification,
  Typography,
  Progress,
  Avatar,
  Image,
} from 'antd';

import Logo from '../../../assets/icon.png';

enum ProgressAction {
  UPDATE_PERCENT = 'UPDATE_PERCENT',
  UPDATE_STATUS = 'UPDATE_STATUS',
}

interface IProgressState {
  status: 'success' | 'exception' | 'normal' | 'active';
  percent: number;
}

interface IProgressAction {
  type: ProgressAction;
  status?: 'success' | 'exception' | 'normal' | 'active';
  percent?: number;
  // payload: 'success' | 'exception' | 'normal' | 'active' | number;
}

const progressReducer = (
  state: IProgressState,
  action: IProgressAction
): IProgressState => {
  switch (action.type) {
    case ProgressAction.UPDATE_PERCENT:
      return {
        ...state,
        percent: action.percent || 0,
      };
    case ProgressAction.UPDATE_STATUS:
      return {
        ...state,
        status: action.status || 'active',
      };
    default:
      return { ...state };
  }
};

export const SetupPage: React.FC = () => {
  const inputRef = React.useRef<InputRef>(null);
  const [textAreaValue, setTextAreaValue] = React.useState('');
  const [currentStep, setCurrentStep] = React.useState(0);

  const [showLog, setShowLog] = React.useState(true);

  const [progress, progressDispatch] = React.useReducer(progressReducer, {
    status: 'active',
    percent: 0,
  });

  const {
    installs,
    ipcRenderer,
    main: { restartApp },
  } = window.electron;

  React.useEffect(() => {
    // call for install choco
    installs.choco();

    ipcRenderer.on('income-choco-setup-process', (data: any) => {
      // setTextAreaValue((oldState) => oldState + data);
      if (progress.percent !== 10) {
        progressDispatch({ type: ProgressAction.UPDATE_PERCENT, percent: 10 });
      }
    });

    ipcRenderer.on('income-choco-setup-finish', (result: any) => {
      console.log('income-choco-setup-finish', result);
      if (result) {
        setTimeout(() => {
          setCurrentStep((prev) => prev + 1);
          // setTextAreaValue('');
          localStorage.setItem('IS_CHOCO_INSTALLED', '1');
          progressDispatch({
            type: ProgressAction.UPDATE_PERCENT,
            percent: 20,
          });
        }, 2000);
      } else {
        notification.error({
          message: 'Có lỗi xảy ra',
        });
      }
    });

    ipcRenderer.on('income-psexec-setup-process', (data: any) => {
      // setTextAreaValue((oldState) => oldState + data);
      if (progress.percent !== 30) {
        progressDispatch({ type: ProgressAction.UPDATE_PERCENT, percent: 30 });
      }
    });

    ipcRenderer.on('income-psexec-setup-finish', (result: any) => {
      if (result) {
        setTimeout(() => {
          setCurrentStep((prev) => prev + 1);
          // setTextAreaValue('');
          localStorage.setItem('IS_PSEXEC_INSTALLED', '1');
          progressDispatch({
            type: ProgressAction.UPDATE_PERCENT,
            percent: 40,
          });
        }, 2000);
      } else {
        notification.error({
          message: 'Có lỗi xảy ra',
        });
      }
    });

    ipcRenderer.on('income-winfsp-setup-process', (data: any) => {
      // setTextAreaValue((oldState) => oldState + data);
      if (progress.percent !== 50) {
        progressDispatch({ type: ProgressAction.UPDATE_PERCENT, percent: 50 });
      }
    });

    ipcRenderer.on('income-winfsp-setup-finish', (result: any) => {
      if (result) {
        setTimeout(() => {
          setCurrentStep((prev) => prev + 1);
          // setTextAreaValue('');
          localStorage.setItem('IS_WINFSP_INSTALLED', '1');
          progressDispatch({
            type: ProgressAction.UPDATE_PERCENT,
            percent: 60,
          });
        }, 2000);
      } else {
        notification.error({
          message: 'Có lỗi xảy ra',
        });
      }
    });

    ipcRenderer.on('income-rclone-setup-process', (data: any) => {
      // setTextAreaValue((oldState) => oldState + data);
      if (progress.percent !== 70) {
        progressDispatch({ type: ProgressAction.UPDATE_PERCENT, percent: 70 });
      }
    });

    ipcRenderer.on('income-rclone-setup-finish', (result: any) => {
      if (result) {
        setTimeout(() => {
          setCurrentStep((prev) => prev + 1);
          // setTextAreaValue('');
          localStorage.setItem('IS_RCLONE_INSTALLED', '1');
          progressDispatch({
            type: ProgressAction.UPDATE_PERCENT,
            percent: 80,
          });
          // setShowLog(false);
        }, 2000);
      } else {
        notification.error({
          message: 'Có lỗi xảy ra',
        });
      }
    });

    ipcRenderer.on('income-awscli-setup-process', (data: any) => {
      // setTextAreaValue((oldState) => oldState + data);
      if (progress.percent !== 90) {
        progressDispatch({ type: ProgressAction.UPDATE_PERCENT, percent: 90 });
      }
    });

    ipcRenderer.on('income-awscli-setup-finish', (result: any) => {
      if (result) {
        setTimeout(() => {
          localStorage.setItem('IS_AWSCLI_INSTALLED', '1');
          // setShowLog(false);
          progressDispatch({
            type: ProgressAction.UPDATE_PERCENT,
            percent: 100,
          });
          progressDispatch({
            type: ProgressAction.UPDATE_STATUS,
            status: 'success',
          });
        }, 2000);
      } else {
        notification.error({
          message: 'Có lỗi xảy ra',
        });
      }
    });
  }, []);

  React.useEffect(() => {
    inputRef.current?.focus({ cursor: 'end', preventScroll: false });
    if (inputRef.current && inputRef.current.input) {
      inputRef.current.input.scrollTop = inputRef.current.input.scrollHeight;
    }

    // console.log(inputRef.current)
    // if (textAreaValue && inputRef.current && inputRef.current.input && inputRef.current.input.value) {

    //     inputRef.current.input.value = textAreaValue;
    // }
  }, [textAreaValue]);

  React.useEffect(() => {
    if (currentStep !== 0) {
      switch (currentStep.toString()) {
        case '1':
          installs.psexec();
          break;
        case '2':
          installs.winfsp();
          break;
        case '3':
          installs.rclone();
          break;
        case '4':
          installs.awscli();
          break;
        default:
          break;
      }
    }
    // console.log(currentStep);
  }, [currentStep]);

  const handleRestart = () => {
    restartApp();
  };

  return (
    <>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '0 100px',
          height: '100%',
        }}
      >
        {progress.percent < 100 ? (
          <>
            <Result
              icon={<Image width={80} height={80} src={Logo} />}
              style={{
                paddingTop: '0px',
              }}
              title={
                <div>
                  <Typography.Title
                    style={{
                      fontWeight: 600,
                      fontSize: '32px',
                      color: '#333333',
                    }}
                  >
                    Đang cài đặt...
                  </Typography.Title>
                </div>
              }
              subTitle={
                <div>
                  <Typography.Title
                    style={{
                      fontWeight: 400,
                      fontSize: '16px',
                      color: '#333333',
                    }}
                  >
                    Tiến trình cài đặt sẽ được chạy trong nền, vui lòng chờ
                    trong giây lát.
                  </Typography.Title>
                </div>
              }
            />
          </>
        ) : (
          // eslint-disable-next-line react/self-closing-comp
          // <svg
          //   viewBox="0 0 100 100"
          //   y="0"
          //   x="0"
          //   xmlns="http://www.w3.org/2000/svg"
          //   id="圖層_1"
          //   version="1.1"
          //   style={{ height: '400px', width: '100%' }}
          // >
          //   <g className="ldl-scale">
          //     <g className="ldl-ani" id="ani-01">
          //       <g className="ldl-layer">
          //         <g className="ldl-ani">
          //           <path
          //             fill="#333"
          //             d="M79.6 44.474a29.806 29.806 0 0 0-1.183-4.433l8.695-5.26a39.941 39.941 0 0 0-5.328-9.206l-8.901 4.899a30.145 30.145 0 0 0-3.241-3.241l4.899-8.901a39.941 39.941 0 0 0-9.206-5.328l-5.26 8.695a29.685 29.685 0 0 0-4.433-1.183l-.207-10.154c-1.741-.231-3.513-.362-5.318-.362s-3.577.131-5.318.363l-.207 10.154c-1.521.283-3.002.68-4.433 1.183l-5.26-8.695a39.941 39.941 0 0 0-9.206 5.328l4.899 8.901a30.145 30.145 0 0 0-3.241 3.241l-8.901-4.899a39.941 39.941 0 0 0-5.328 9.206l8.695 5.26a29.685 29.685 0 0 0-1.183 4.433l-10.154.207c-.231 1.741-.363 3.514-.363 5.318s.131 3.577.363 5.318l10.154.207c.283 1.521.68 3.002 1.183 4.433l-8.695 5.26a39.941 39.941 0 0 0 5.328 9.206l8.901-4.899a30.145 30.145 0 0 0 3.241 3.241l-4.899 8.901a39.941 39.941 0 0 0 9.206 5.328l5.26-8.695c1.431.504 2.912.9 4.433 1.183l.207 10.154c1.741.232 3.514.363 5.318.363s3.577-.131 5.318-.363l.207-10.154a29.806 29.806 0 0 0 4.433-1.183l5.26 8.695a39.941 39.941 0 0 0 9.206-5.328l-4.899-8.901a30.145 30.145 0 0 0 3.241-3.241l8.901 4.899a39.941 39.941 0 0 0 5.328-9.206l-8.695-5.26c.504-1.431.9-2.912 1.183-4.433l10.154-.207c.231-1.741.363-3.514.363-5.318s-.131-3.577-.363-5.318L79.6 44.474zM50 70c-11.046 0-20-8.954-20-20s8.954-20 20-20 20 8.954 20 20-8.954 20-20 20z"
          //             style={{ fill: 'rgb(24, 83, 194)' }}
          //           ></path>
          //         </g>
          //       </g>
          //       <g className="ldl-layer">
          //         <g className="ldl-ani" id="ani-02">
          //           <path
          //             fill="#f8b26a"
          //             d="M60.678 60.884c3.567-3.567 4.981-8.46 4.268-13.09-.091-.589-.822-.821-1.243-.4l-9.189 9.188a2.411 2.411 0 0 1-2.329.624l-6.049-1.621a2.412 2.412 0 0 1-1.705-1.705l-1.621-6.049a2.411 2.411 0 0 1 .624-2.329l9.188-9.188c.423-.423.188-1.154-.403-1.245-5.023-.771-10.353.959-13.965 5.224-4.063 4.798-4.622 11.62-1.764 17.001L11.626 78.386a7.077 7.077 0 1 0 10.003 10.003l21.089-24.86c5.767 3.09 13.095 2.22 17.96-2.645zM14.314 85.702a3.333 3.333 0 1 1 4.715-4.713 3.333 3.333 0 0 1-4.715 4.713z"
          //             style={{ fill: 'rgb(49, 54, 70)' }}
          //           ></path>
          //         </g>
          //       </g>
          //     </g>
          //   </g>
          // </svg>
          <>
            <Result
              status="success"
              title={
                <div>
                  <Typography.Title
                    style={{
                      fontWeight: 600,
                      fontSize: '32px',
                      color: '#333333',
                    }}
                  >
                    Hoàn tất cài đặt các công cụ cần thiết
                  </Typography.Title>
                </div>
              }
              subTitle={
                <div>
                  <Typography.Title
                    style={{
                      fontWeight: 400,
                      fontSize: '16px',
                      color: '#333333',
                    }}
                  >
                    Vui lòng khởi động lại ứng dụng để sử dụng trong giây lát.
                  </Typography.Title>
                </div>
              }
              extra={[
                <Button type="primary" key="restart" onClick={handleRestart}>
                  Khởi động lại
                </Button>,
              ]}
              style={{
                paddingTop: '0px',
              }}
            />
          </>
        )}
        <Progress
          status={progress.status}
          percent={progress.percent}
          strokeWidth={10}
        />
      </div>
      {/* <Steps
        current={currentStep}
        size="small"
        labelPlacement="vertical"
        items={[
          {
            title: 'Chocolatey',
            subTitle: 'Quản lý phần mềm tự động',
          },
          {
            title: 'Psexec',
            description: 'Công cụ quản trị hệ thống',
          },
          {
            title: 'Winfsp',
            description: 'Windows File System Proxy',
          },
          {
            title: 'Rclone',
            description: 'Quản lí lưu trữ Cloud',
          },
          {
            title: 'AwsCLI',
            description: 'Amazon CLI'
          }
        ]}
      />

      {showLog ? (
        <Input.TextArea
          ref={inputRef}
          value={textAreaValue}
          size='large'
          autoSize={{ minRows: 10, maxRows: 15 }}
        />
      ) : (
        <Result
          status="success"
          title="Hoàn tất cài đặt các công cụ cần thiết"
          subTitle="Vui lòng khởi động lại ứng dụng để sử dụng"
          extra={[
            <Button type="primary" key='restart' onClick={handleRestart}>
              Khởi động lại
            </Button>,
          ]}
        />
      )} */}
    </>
  );
};
