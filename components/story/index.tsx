'use client';

import navigationStyles from 'components/navigation/component.module.css';
import type { FC } from 'react';
import { Fragment, useEffect, useState } from 'react';
import { waitForElement } from 'utils/browser';
import ScrollObserver from 'utils/scroll-observer';

import StoryComponent from './component';

const Story: FC = () => {
  const [isScrollInitiallyDisabled, setIsScrollInitiallyDisabled] = useState<boolean>(false);

  useEffect(() => {
    waitForElement('.' + navigationStyles.content).then((content: Element): void => {
      content.scrollTop = 0;
      content.classList.add(navigationStyles.contentScrollLocked);
      ScrollObserver.create();
      ScrollObserver.disable(); // Enable after animating the first section
      setIsScrollInitiallyDisabled(true);
    });
    return () => {
      ScrollObserver.kill();
    };
  }, []);

  if (!isScrollInitiallyDisabled) {
    return <Fragment />;
  }

  return <StoryComponent />;
};

export default Story;
