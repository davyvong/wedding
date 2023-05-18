'use client';

import NavigationContext from 'contexts/navigation';
import { useContext } from 'react';

const useNavigation = () => useContext(NavigationContext);

export default useNavigation;
