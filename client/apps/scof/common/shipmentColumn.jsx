import React, { PropTypes } from 'react';
import { intlShape, injectIntl } from 'react-intl';
import { Row, Col, Tag } from 'antd';
import { WRAP_TYPE, GOODSTYPES } from 'common/constants';

@injectIntl
export default class ShipmentColumn extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    shipment: PropTypes.object.isRequired,
  }

  render() {
    const { shipment } = this.props;
    if (shipment) {
      // const goodsType = GOODSTYPES.find(item => item.value === shipment.cust_shipmt_goods_type);
      const goodsType = GOODSTYPES.filter(gt => gt.value === shipment.cust_shipmt_goods_type);
      const wrapType = WRAP_TYPE.filter(wt => wt.value === shipment.cust_shipmt_package);
      return (
        <Row type="flex">
          <Col className="col-flex-primary">
            <a onClick={() => this.props.loadOrderDetail(shipment.cust_shipmt_bill_lading, this.props.tenantId)}>{shipment.cust_shipmt_bill_lading}</a>
            <div>{wrapType && wrapType[0] && wrapType[0].text}{shipment.cust_shipmt_pieces}件 {shipment.cust_shipmt_weight}KG</div>
            <div><Tag>{goodsType && goodsType[0] && goodsType[0].text}</Tag></div>
          </Col>
          <Col className="col-flex-secondary" />
        </Row>
      );
    } else {
      return <div />;
    }
  }
}
