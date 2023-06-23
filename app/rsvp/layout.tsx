import type { FC, ReactElement } from 'react';

interface LayoutProps {
  children: ReactElement;
}

const Layout: FC<LayoutProps> = ({ children }) => {
  return children;
};

export default Layout;
