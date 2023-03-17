'use client';

import useNavigation from 'hooks/navigation';
import { useCallback, useEffect } from 'react';
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

  useEffect(() => {
    if (navigation.isOpen) {
      const onKeyDown = event => {
        if (event.key === 'Esc' || event.key === 'Escape' || event.keyCode === 27) {
          navigation.setIsOpen(false);
        }
      };
      window.addEventListener('keydown', onKeyDown);
      return () => {
        window.removeEventListener('keydown', onKeyDown);
      };
    }
  }, [navigation]);

  return <NavigationComponent {...props} isOpen={navigation.isOpen} toggle={toggle} />;
};

export default Navigation;
