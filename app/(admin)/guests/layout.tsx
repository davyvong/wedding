import { Fragment, ReactNode } from 'react';

interface LayoutProps {
  children: ReactNode;
}

const Layout = async ({ children }: LayoutProps): Promise<JSX.Element> => {
  return <Fragment>{children}</Fragment>;
};

export default Layout;
