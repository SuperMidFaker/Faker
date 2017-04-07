import React, { PropTypes } from 'react';
import { intlShape, injectIntl } from 'react-intl';
import { Row, Col, Tag } from 'antd';
import { WRAP_TYPE, GOODSTYPES, SCOF_ORDER_TRANSMODES } from 'common/constants';

@injectIntl
export default class ShipmentColumn extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    shipment: PropTypes.object.isRequired,
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
      const transMode = SCOF_ORDER_TRANSMODES.filter(sot => sot.value === shipment.cust_shipmt_trans_mode)[0];
      if (transMode) {
        transModeDom = <i className={transMode.icon} />;
      }
      const wrapType = WRAP_TYPE.filter(wt => wt.value === shipment.cust_shipmt_package)[0];
      return (
        <Row type="flex">
          <Col className="col-flex-primary">
            <div>{transModeDom} {shipment.cust_shipmt_bill_lading} {shipment.cust_shipmt_hawb ? `${shipment.cust_shipmt_mawb}_${shipment.cust_shipmt_hawb}` : shipment.cust_shipmt_mawb}</div>
            <div>{shipment.cust_shipmt_package}{wrapType && wrapType.text}{shipment.cust_shipmt_pieces && `${shipment.cust_shipmt_pieces}件`} {shipment.cust_shipmt_weight && `${shipment.cust_shipmt_weight}KG`}</div>
            <div>{gtTag}</div>
          </Col>
          <Col className="col-flex-secondary" />
        </Row>
      );
    } else {
      return <div />;
    }
  }
}
