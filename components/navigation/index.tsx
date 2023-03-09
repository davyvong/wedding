import useNavigation from 'hooks/navigation';
import { useCallback } from 'react';
import type { FC, ReactNode } from 'react';

import NavigationComponent from './component';

interface NavigationProps {
  children: ReactNode;
}

const Navigation: FC<NavigationProps> = props => {
  const navigation = useNavigation();

  const toggle = useCallback((): void => {
    navigation.setIsOpen(prevState => !prevState);
  }, [navigation]);

  return <NavigationComponent {...props} isOpen={navigation.isOpen} toggle={toggle} />;
};

export default Navigation;
