import PropTypes from 'prop-types';
import React from 'react';
import { Tooltip } from 'antd';
import TrimSpan from 'client/components/trimSpan';
import * as Location from 'client/util/location';

export default class AddressColumn extends React.Component {
  static propTypes = {
    shipment: PropTypes.object.isRequired,
    consignType: PropTypes.string.isRequired,
  }
  render() {
    const { shipment, consignType } = this.props;
    const maxLen = 8;
    const text = shipment[`${consignType}_byname`] || Location.renderConsignLocation(shipment, consignType);
    if (text.length > maxLen) {
      return (<TrimSpan text={`${text} ${shipment[`${consignType}_addr`] || ''}`} maxLen={maxLen} />);
    } else {
      return (
        <Tooltip title={`${text} ${shipment[`${consignType}_addr`] || ''}`} >{text}</Tooltip>
      );
    }
  }
}
