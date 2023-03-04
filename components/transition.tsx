import type { CSSProperties, ReactElement } from 'react';
import { cloneElement, forwardRef, useCallback, useEffect, useRef, useState } from 'react';

interface TransitionProps {
  children: ReactElement;
  delay: number;
  duration: number;
  inStyle: CSSProperties;
  isIn: boolean;
  onIn: () => void;
  onOut: () => void;
  outStyle: CSSProperties;
}

const Transition = forwardRef((props: TransitionProps, ref) => {
  const { children, delay, duration, inStyle, isIn, onIn, onOut, outStyle } = props;

  const timeoutRef = useRef<NodeJS.Timeout>();

  const [isRendered, setIsRendered] = useState<boolean>(isIn);
  const [style, setStyle] = useState<CSSProperties>(isIn ? inStyle : outStyle);

  const transitionIn = useCallback(() => {
    clearTimeout(timeoutRef.current);
    setIsRendered(true);
    timeoutRef.current = setTimeout(() => setStyle(inStyle), delay);
  }, [delay, inStyle]);

  const transitionOut = useCallback(() => {
    clearTimeout(timeoutRef.current);
    setStyle(outStyle);
    timeoutRef.current = setTimeout(() => setIsRendered(false), duration);
  }, [duration, outStyle]);

  useEffect(() => {
    if (isIn) {
      transitionIn();
    } else {
      transitionOut();
    }
  }, [isIn, transitionIn, transitionOut]);

  useEffect(() => {
    if (isRendered) {
      onIn();
    } else {
      onOut();
    }
  }, [isRendered, onIn, onOut]);

  if (!isRendered) {
    return null;
  }

  return cloneElement(children, { ...children.props, ref, style });
});

Transition.displayName = 'Transition';

export default Transition;
