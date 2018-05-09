import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl } from 'react-intl';
import { Row, Col, Tag } from 'antd';
import { WRAP_TYPE, GOODSTYPES, TRANS_MODES } from 'common/constants';

@injectIntl
export default class ShipmentColumn extends React.Component {
  static propTypes = {
    shipment: PropTypes.shape({
      cust_shipmt_bill_lading: PropTypes.string,
    }).isRequired,
  }

  render() {
    const { shipment } = this.props;
    if (shipment) {
      let gtTag = '';
      const goodsType = GOODSTYPES.filter(gt => gt.value === shipment.cust_shipmt_goods_type)[0];
      if (goodsType) {
        if (goodsType.value === 1) {
          gtTag = (<Tag color="#2db7f5">{goodsType.text}</Tag>);
        } else if (goodsType.value === 2) {
          gtTag = (<Tag color="#f50">{goodsType.text}</Tag>);
        }
      }
      let transModeDom = '';
      const transMode = TRANS_MODES.filter(sot => sot.value === shipment.cust_shipmt_trans_mode)[0];
      if (transMode) {
        transModeDom = <i className={transMode.icon} />;
      }
      const wrapType = WRAP_TYPE.filter(wt => wt.value === shipment.cust_shipmt_wrap_type)[0];
      return (
        <Row type="flex">
          <Col className="col-flex-primary">
            <div>{transModeDom} {shipment.cust_shipmt_bill_lading} {shipment.cust_shipmt_hawb ? `${shipment.cust_shipmt_mawb}_${shipment.cust_shipmt_hawb}` : shipment.cust_shipmt_mawb}</div>
            <div>{wrapType && wrapType.text}{shipment.cust_shipmt_pieces && `${shipment.cust_shipmt_pieces}件`} {shipment.cust_shipmt_weight && `${shipment.cust_shipmt_weight}KG`}</div>
            <div>{gtTag}</div>
          </Col>
          <Col className="col-flex-secondary" />
        </Row>
      );
    }
    return <div />;
  }
}
