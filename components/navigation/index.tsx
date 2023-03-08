import useNavigation from 'hooks/navigation';
import { useCallback, useRef } from 'react';
import type { FC } from 'react';

import NavigationComponent from './component';

const Navigation: FC = props => {
  const navigation = useNavigation();

  const menuRef = useRef<HTMLDivElement>(null);

  const toggle = useCallback((): void => {
    navigation.setIsOpen(prevState => !prevState);
  }, [navigation]);

  return <NavigationComponent {...props} isOpen={navigation.isOpen} menuRef={menuRef} toggle={toggle} />;
};

export default Navigation;
