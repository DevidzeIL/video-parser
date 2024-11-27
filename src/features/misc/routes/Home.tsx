import React, { useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import * as XLSX from 'xlsx';

import sunIcon from 'src/assets/icons/theme/sun.svg';
import moonIcon from 'src/assets/icons/theme/moon.svg';
import './Home.css';

import { ContentLayout } from 'src/components/Layout';
import { Button, Dropdown } from 'src/components/Elements';
import { UserContext } from 'src/context/UserContext';
import { getVideoData } from 'src/utils/videoDataService';

export const Home = () => {
  const { t } = useTranslation();
  const { config, setConfig, toggleTheme } = useContext(UserContext);

  const langs = ['RU', 'EN'];

  const handleLanguageChange = (newLang: string) => {
    setConfig({ ...config, lang: newLang });
  };

  const [isLoading, setIsLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [processedData, setProcessedData] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ url: string; error: string; row: number }[]>([]);

  const [processedCount, setProcessedCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  const isValidUrl = (url: string) => {
    try {
      const formattedUrl = url.startsWith('http') ? url : `http://${url}`;
      const parsedUrl = new URL(formattedUrl);
      const hostname = parsedUrl.hostname.replace(/^www\./, '');
      return hostname === 'youtube.com' || hostname === 'youtu.be';
    } catch (e) {
      return false;
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setProcessedData(null);
      setErrors([]);
    }
  };

  const handleProcessFile = async () => {
    if (!file) return;

    setIsLoading(true);
    setErrors([]);
    setProcessedCount(0);
    setTotalCount(0);

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const rawData: string[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      const validData = rawData.filter((row) => row.some((cell) => cell?.toString().trim()));
      setTotalCount(validData.length);

      const results = [];
      const errorList = [];

      for (let i = 0; i < validData.length; i++) {
        const row = validData[i];
        const url = row[0]?.trim();

        if (!url) {
          setProcessedCount((prev) => prev + 1);
          errorList.push({
            url: t('home.errorEmptyUrl'),
            error: t('home.errorInvalidFormat'),
            row: i + 1,
          });
          continue;
        }

        if (!isValidUrl(url)) {
          setProcessedCount((prev) => prev + 1);
          errorList.push({
            url,
            error: t('home.errorInvalidFormat'),
            row: i + 1,
          });
          continue;
        }

        try {
          const videoData = await getVideoData(url);
          if (videoData) {
            results.push({ ...videoData, url });
          } else {
            errorList.push({
              url,
              error: t('home.errorNoData'),
              row: i + 1,
            });
          }
        } catch (error: any) {
          console.error(`Ошибка при обработке URL на строке ${i + 1}:`, error);
          errorList.push({
            url,
            error: error.message || t('home.errorUnknown'),
            row: i + 1,
          });
        } finally {
          setProcessedCount((prev) => prev + 1);
        }
      }

      setErrors(errorList);

      if (results.length > 0) {
        const newWorksheet = XLSX.utils.json_to_sheet(results);
        const newWorkbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(newWorkbook, newWorksheet, 'Results');
        const wbout = XLSX.write(newWorkbook, { bookType: 'xlsx', type: 'array' });
        const blob = new Blob([wbout], { type: 'application/octet-stream' });
        const urlDownload = URL.createObjectURL(blob);
        setProcessedData(urlDownload);
      } else {
        setProcessedData(null);
      }
    } catch (error: any) {
      console.error('Ошибка при обработке файла:', error);
      setErrors([
        { url: t('home.errorFile'), error: error.message || t('home.errorUnknown'), row: 0 },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    if (!processedData) return;

    const link = document.createElement('a');
    link.href = processedData;
    link.setAttribute('download', 'video_data.xlsx');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleClearAll = () => {
    setFile(null);
    setProcessedData(null);
    setIsLoading(false);
    setErrors([]);
    const fileInput = document.getElementById('fileInput') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  console.log('errors >', errors);
  return (
    <>
      <ContentLayout title="Home">
        <div className="content-layout-header">
          <Dropdown
            id="language"
            currentValue={config.lang}
            values={langs}
            onChange={handleLanguageChange}
          />
        </div>

        <div className="content-layout-body" style={{ alignItems: 'center' }}>
          <div className="custom-file-upload">
            <Button
              variant="default"
              type="button"
              onClick={() => document.getElementById('fileInput')?.click()}
            >
              {file ? file.name : t('home.chooseFile')}
            </Button>
            {file && <Button onClick={handleClearAll}>X</Button>}
            <input
              id="fileInput"
              type="file"
              onChange={handleFileUpload}
              accept=".xlsx"
              style={{ display: 'none' }}
            />
          </div>

          {file && !processedData && !isLoading && (
            <Button onClick={handleProcessFile}>{t('home.processFile')}</Button>
          )}

          {isLoading && <div className="loading-ring"></div>}
          {isLoading && (
            <div className="link-counters">
              <p>
                {t('home.processedLinks')}: {processedCount} / {totalCount}
              </p>
            </div>
          )}

          {processedData && (
            <>
              <Button onClick={handleDownload}>{t('home.downloadFile')}</Button>
              <Button onClick={handleClearAll}>{t('home.clearAll')}</Button>
            </>
          )}

          {errors.length > 0 && (
            <div className="error-list">
              <h3 className="error-header">{t('home.errorTitle')}:</h3>
              <pre className="error-log">
                {errors.map((err, index) => (
                  <div key={index}>
                    <span className="error-row">{`[${t('home.row')} ${err.row}]`}</span>
                    <br />
                    <span className="error-url">{`URL: ${err.url}`}</span>
                    <br />
                    <span className="error-message">{`${t('home.error')}: ${err.error}\n`}</span>
                    <br />
                  </div>
                ))}
              </pre>
            </div>
          )}
        </div>

        <div className="content-layout-footer">
          <Button
            leftIcon={config.theme === 'light' ? moonIcon : sunIcon}
            onClick={toggleTheme}
            text={false}
          />
        </div>
      </ContentLayout>
    </>
  );
};
