import { ReactNode } from 'react';
import './ContentLayout.css';

type ContentLayoutProps = {
  children: ReactNode;
  title: string;
};

export const ContentLayout = ({ children }: ContentLayoutProps) => {
  return <div className="content-layout">{children}</div>;
};
