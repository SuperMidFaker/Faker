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
    alert: PropTypes.bool,
    disabled: PropTypes.bool,
  };

  constructor(props) {
    super(props);
    this.state = {
    };
  }

  render() {
    const {
      packQty, pcsQty, alert, onChange, disabled,
    } = this.props;
    return (
      <span className={alert && 'mdc-text-red'}>
        <Tooltip title="SKU包装件数" mouseEnterDelay={3}>
          <Input className="readonly" placeholder="件数" value={packQty} style={{ textAlign: 'right', width: 80, marginRight: 2 }} disabled={disabled} onChange={onChange} />
        </Tooltip>
        <Tooltip title="货品计量主单位数量" mouseEnterDelay={3}>
          <Input className="readonly" placeholder="主单位数量" value={pcsQty} style={{ textAlign: 'right', width: 80 }} disabled />
        </Tooltip>
      </span>
    );
  }
}