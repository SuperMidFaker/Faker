import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { Row } from 'antd';
import './style.less';

export default class DescriptionList extends PureComponent {
  static defaultProps = {
    prefixCls: 'welo-desc-list',
    col: 3,
    gutter: 0,
    layout: 'horizontal',
  };
  static propTypes = {
    prefixCls: PropTypes.string,
    title: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
    col: PropTypes.number,
    layout: PropTypes.oneOf(['horizontal', 'vertical']),
    size: PropTypes.oneOf(['small', 'large']),
    gutter: PropTypes.number,
    children: PropTypes.node,
    className: PropTypes.string,
  }

  render() {
    const {
      prefixCls, className, size, layout, col, title, gutter, children,
    } = this.props;
    const sizeCls = ({
      large: 'lg',
      small: 'sm',
    })[size] || '';
    const clsString = classNames(prefixCls, className, {
      [`${prefixCls}-${sizeCls}`]: sizeCls,
      [`${prefixCls}-${layout}`]: layout,
    });
    const column = col > 6 ? 6 : col;
    return (
      <div className={clsString}>
        {title ? <div className={`${prefixCls}-title`}>{title}</div> : null}
        <Row gutter={gutter}>
          {React.Children.map(children, child => React.cloneElement(child, { column }))}
        </Row>
      </div>
    );
  }
}
