import React from 'react';
import { Icon } from 'antd';
import classNames from 'classnames';
import './index.less';

const Trend = ({
  flag, children, className, ...rest
}) => {
  const classString = classNames('welo-trend', {
  }, className);
  return (
    <div
      {...rest}
      className={classString}
      title={typeof children === 'string' ? children : ''}
    >
      <span className="value">{children}</span>
      {flag && <span className={flag}><Icon type={`caret-${flag}`} /></span>}
    </div>
  );
};

export default Trend;
