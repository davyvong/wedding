import { CSSProperties, useCallback, useMemo } from 'react';
import type { FC } from 'react';

import styles from './component.module.css';

interface TickerLabel {
  key: string;
  style?: CSSProperties;
  text: string;
}

interface TickerProps {
  data: TickerLabel[];
}

const TickerComponent: FC<TickerProps> = ({ data }) => {
  const renderDivider = useCallback(
    (key: string) => (
      <span className={styles.divider} key={key + '-divider'}>
        —
      </span>
    ),
    [],
  );

  const renderLabel = useCallback(
    (label: TickerLabel, key: string): JSX.Element => (
      <span key={key + '-' + label.key} style={label.style}>
        {label.text}
      </span>
    ),
    [],
  );

  const renderLabels = useCallback(
    (labels: TickerLabel[], key: string): JSX.Element[] => {
      const elements: JSX.Element[] = [];
      for (let i = 0; i < 5; i++) {
        for (const label of labels) {
          if (elements.length > 0) {
            elements.push(renderDivider(key + '-' + i));
          }
          elements.push(renderLabel(label, key + '-' + i));
        }
      }
      elements.push(renderDivider(key + '-' + labels.length));
      return elements;
    },
    [renderDivider, renderLabel],
  );

  const animationDuration = useMemo(() => data.length * 15 + 's', [data.length]);

  return (
    <div className={styles.ticker}>
      <div className={styles.details} style={{ animationDuration }}>
        {renderLabels(data, '1')}
      </div>
      <div className={styles.details} style={{ animationDuration }}>
        {renderLabels(data, '2')}
      </div>
    </div>
  );
};

export default TickerComponent;
