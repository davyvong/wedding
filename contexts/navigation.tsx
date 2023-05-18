'use client';

import { createContext, useMemo, useState } from 'react';
import type { Dispatch, FC, ReactNode, SetStateAction } from 'react';

interface NavigationContextValue {
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
}

const initialValue: NavigationContextValue = {
  isOpen: false,
  setIsOpen: () => {},
};

const NavigationContext = createContext<NavigationContextValue>(initialValue);

interface NavigationProviderProps {
  children: ReactNode;
}

export const NavigationProvider: FC<NavigationProviderProps> = ({ children }) => {
  const [isOpen, setIsOpen] = useState<boolean>(initialValue.isOpen);

  const value = useMemo<NavigationContextValue>(
    () => ({
      isOpen,
      setIsOpen,
    }),
    [isOpen],
  );

  return <NavigationContext.Provider value={value}>{children}</NavigationContext.Provider>;
};

export default NavigationContext;
