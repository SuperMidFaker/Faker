import React from 'react';
import PropTypes from 'prop-types';
import { Input, Tooltip } from 'antd';

export default class QuantityInput extends React.Component {
  static defaultProps = {
    toggle: false,
  };

  static propTypes = {
    type: PropTypes.string,
    onChange: PropTypes.func,
    packQty: PropTypes.number,
    pcsQty: PropTypes.number,
    expectQty: PropTypes.number,
    disabled: PropTypes.bool,
    size: PropTypes.oneOf(['small', 'large']),
  };

  constructor(props) {
    super(props);
    this.state = {
    };
  }

  render() {
    const {
      packQty, pcsQty, onChange, disabled, size, expectQty,
    } = this.props;
    let sizeStr = 'default';
    if (size) {
      sizeStr = size;
    }
    let alertCls = '';
    if (pcsQty === expectQty) {
      alertCls = 'success';
    } else if (pcsQty > expectQty) {
      alertCls = 'error';
    } else if (pcsQty < expectQty) {
      alertCls = 'warning';
    }
    return (
      <span>
        <Tooltip title="SKU件数" mouseEnterDelay={3}>
          <Input size={sizeStr} className={`readonly ${alertCls}`} placeholder="SKU件数" value={packQty} style={{ textAlign: 'right', width: 80, marginRight: 2 }} disabled={disabled} onChange={onChange} />
        </Tooltip>
        <Tooltip title="货品计量单位数量" mouseEnterDelay={3}>
          <Input size={sizeStr} className={`readonly ${alertCls}`} placeholder="计量单位数量" value={pcsQty} style={{ textAlign: 'right', width: 80 }} disabled />
        </Tooltip>
      </span>
    );
  }
}
