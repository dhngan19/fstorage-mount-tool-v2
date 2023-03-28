import React from 'react';
import {
  Checkbox,
  notification,
  InputNumber,
  Button,
  Select,
} from 'antd';
import type { CheckboxChangeEvent } from 'antd/es/checkbox';
import {useTranslation} from 'react-i18next'
import i18next from 'i18next';

export const SettingTab: React.FC = () => {

  const {t} = useTranslation();

  const [enable, setEnable] = React.useState<boolean>();
  const [disabledBtnSave, setDisabledBtnSave] = React.useState(true);

  const [valueUpload, setValueUpload] = React.useState<number>(5);
  const [valueDownload, setValueDownload] = React.useState<number>(5);
  const [lang, setLang] = React.useState('vn');

  const handleChange = (_e: CheckboxChangeEvent) => {
    window.electron.main.setRunAtStartup(_e.target.checked);
    setEnable(_e.target.checked);
  };

  const handleUploadTransfer = (value: number) => {
    setValueUpload(value);
    setDisabledBtnSave(false);
  };

  const handleDownloadTransfer = (value: number) => {
    setValueDownload(value);
    setDisabledBtnSave(false);
  };

  const handleSaveTransfer = () => {
    localStorage.setItem('DOWN_TRANS', valueDownload.toString());
    localStorage.setItem('UP_TRANS', valueUpload.toString());
    setDisabledBtnSave(true);
    notification.success({
      message: `${t("save successfully")}`,
      placement: 'bottom',
      style: { backgroundColor: '#F6FFED' },
    });
  };

  const handleChangeLang = (value: string) => {
    setLang(value);
    i18next.changeLanguage(value);
  };

  React.useEffect(() => {
    (async () => {
      if (window.electron) {
        window.electron.main.getRunAtStartup();

        window.electron.ipcRenderer.on(
          'get-run-at-startup-result',
          (result: boolean) => {
            setEnable(result);
          }
        );

        window.electron.ipcRenderer.on(
          'set-run-at-startup-result',
          (result: boolean) => {
            if (result === true) {
              notification.success({
                message: 'Cài đặt khởi động cùng Windows thành công',
                placement: 'bottom',
                style: { backgroundColor: '#F6FFED' },
              });
            } else {
              notification.error({
                message: 'Có lỗi khi cài đặt khởi động cùng Windows',
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
    const upTrans = localStorage.getItem('UP_TRANS');
    const downTrans = localStorage.getItem('DOWN_TRANS');
    const locale = localStorage.getItem('i18nextLng');
    if (locale !== null) {
      setLang(locale);
    }
    if (upTrans !== null) {
      setValueUpload(parseFloat(upTrans));
    } else {
      localStorage.setItem('UP_TRANS', valueUpload.toString());
    }
    if (downTrans !== null) {
      setValueDownload(parseFloat(downTrans));
    } else {
      localStorage.setItem('DOWN_TRANS', valueDownload.toString());
    }
  }, []);

  return (
    <>
      <div>
        <Checkbox
          checked={enable}
          onChange={handleChange}
          disabled={enable === undefined}
        >
          {t('start with windows')}:
        </Checkbox>
      </div>
      <div style={{ display: 'flex', margin: '20px 0' }}>
        <span
          style={{
            marginRight: '20px',
          }}
        >
          {t('lang')}:
        </span>
        <Select
          value={lang}
          style={{ width: 290 }}
          onChange={handleChangeLang}
          options={[
            { value: 'vi-VN', label: `${t('vietnamese')}` },
            { value: 'en-US', label:`${t('english')}`},
          ]}
        />
      </div>
      <div
        style={{
          display: 'flex',
        }}
      >
        <div>
          <span
            style={{
              marginRight: '20px',
            }}
          >
            Upload:
          </span>
          <InputNumber
            min={1}
            max={32}
            value={valueUpload}
            style={{
              margin: '0 20px',
            }}
            onChange={(value: any) => {
              handleUploadTransfer(value);
            }}
          />
        </div>
        <div
          style={{
            display: 'block',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
            }}
          >
            <span>Download:</span>
            <InputNumber
              min={1}
              max={32}
              value={valueDownload}
              style={{
                marginLeft: '22px',
              }}
              onChange={(value: any) => {
                handleDownloadTransfer(value);
              }}
            />
          </div>
          <div
            style={{
              textAlign: 'right',
              marginTop: '20px',
            }}
          >
            <Button
              type="primary"
              disabled={disabledBtnSave}
              onClick={handleSaveTransfer}
            >
              {t('save')}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};
