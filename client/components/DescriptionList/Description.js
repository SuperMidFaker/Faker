import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { Col } from 'antd';
import responsive from './responsive';
import './index.less';

export default class Description extends PureComponent {
  static defaultProps = {
    prefixCls: 'welo-desc-list-item',
  };
  static propTypes = {
    term: PropTypes.string,
    column: PropTypes.number,
    className: PropTypes.string,
    children: PropTypes.any,
  }
  render() {
    const { prefixCls, className, term, children, column } = this.props;
    const clsString = classNames(prefixCls, className);
    return (
      <Col className={clsString} {...responsive[column]}>
        {term && <div className={`${prefixCls}-term`}>{term}</div>}
        {children && <div className={`${prefixCls}-detail`}>{children}</div>}
      </Col>
    );
  }
}

