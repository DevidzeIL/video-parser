import './MainLayout.css';

type MainLayoutProps = {
  children: React.ReactNode;
};

export const MainLayout = ({ children }: MainLayoutProps) => {
  return <main className="main-layout">{children}</main>;
};
