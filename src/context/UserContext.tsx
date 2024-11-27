import { createContext, ReactNode, useEffect, useState } from 'react';
import i18n from 'src/i18n';
import { Config } from 'src/types';

const initialConfig: Config = {
  lang: 'GE',
  theme: 'dark',
};

export type UserContextType = {
  config: Config;
  setConfig: (config: Config) => void;
  toggleTheme: () => void;
};

export const UserObject = {
  config: initialConfig,
  setConfig: () => {},
  toggleTheme: () => {},
};

export const UserContext = createContext<UserContextType>(UserObject);

type UserContextProviderProps = {
  children: ReactNode;
};

const UserContextProvider: React.FC<UserContextProviderProps> = ({ children }) => {
  const [config, setConfig] = useState<Config>(() => {
    const savedConfig = localStorage.getItem('config');
    return savedConfig ? JSON.parse(savedConfig) : initialConfig;
  });

  useEffect(() => {
    localStorage.setItem('config', JSON.stringify(config));
    i18n.changeLanguage(config.lang.toLowerCase());
    document.documentElement.setAttribute('data-theme', config.theme);

    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    const newMetaColor = config.theme === 'dark' ? '#03030d' : '#e2e3fa';
    if (metaThemeColor) metaThemeColor.setAttribute('content', newMetaColor);
  }, [config]);

  const toggleTheme = () => {
    const newTheme = config.theme === 'light' ? 'dark' : 'light';
    setConfig({ ...config, theme: newTheme });
  };
  return (
    <UserContext.Provider
      value={{
        config,
        setConfig,
        toggleTheme,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export default UserContextProvider;
