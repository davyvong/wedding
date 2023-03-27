import type { FC, ReactElement } from 'react';

interface LayoutProps {
  children: ReactElement;
}

const Layout: FC<LayoutProps> = ({ children }) => children;

export default Layout;
