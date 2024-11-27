import { ReactNode } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';

import i18n from 'src/i18n';
import UserContextProvider from 'src/context/UserContext';

type AppProviderProps = {
  children: ReactNode;
};

export const AppProvider = ({ children }: AppProviderProps) => {
  return (
    <BrowserRouter>
      <UserContextProvider>
        <I18nextProvider i18n={i18n}>{children}</I18nextProvider>
      </UserContextProvider>
    </BrowserRouter>
  );
};
