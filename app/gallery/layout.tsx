import navigationStyles from 'components/navigation/component.module.css';
import { Fragment } from 'react';
import type { FC, ReactElement } from 'react';

interface LayoutProps {
  children: ReactElement;
}

const Layout: FC<LayoutProps> = ({ children }) => (
  <Fragment>
    <style>{`.${navigationStyles.content} { background-color: var(--color-surface); }`}</style>
    {children}
  </Fragment>
);

export default Layout;
