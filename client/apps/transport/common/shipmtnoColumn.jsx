import React, { PropTypes } from 'react';
import TrimSpan from 'client/components/trimSpan';

export default class ShipmtNoColumnRender extends React.Component {
  static propTypes = {
    shipmtNo: PropTypes.string.isRequired,
    shipment: PropTypes.object.isRequired,
    onClick: PropTypes.func.isRequired,
  }
  handleClick = (ev) => {
    ev.stopPropagation();
    this.props.onClick(this.props.shipment);
    return false;
  }
  render() {
    const { shipmtNo, ...extra } = this.props;
    const { ...rest } = extra; // eslint-disable-line no-unused-vars
    return (
      <a {...rest} onClick={this.handleClick}>
        <TrimSpan text={shipmtNo} maxLen={14} />
      </a>
    );
  }
}
