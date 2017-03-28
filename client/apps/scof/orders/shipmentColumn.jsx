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
      const goodsType = GOODSTYPES.filter(gt => gt.value === shipment.cust_shipmt_goods_type);
      if (goodsType && goodsType[0]) {
        if (goodsType[0].value === 1) {
          gtTag = (<Tag color="#2db7f5">{goodsType[0].text}</Tag>);
        } else if (goodsType[0].value === 2) {
          gtTag = (<Tag color="#f50">{goodsType[0].text}</Tag>);
        }
      }
      let transMode = '';
      if (shipment.cust_shipmt_trans_mode === SCOF_ORDER_TRANSMODES[0].value) {
        transMode = (<i className={SCOF_ORDER_TRANSMODES[0].icon} />);
      } else if (shipment.cust_shipmt_trans_mode === SCOF_ORDER_TRANSMODES[1].value) {
        transMode = (<i className={SCOF_ORDER_TRANSMODES[1].icon} />);
      } else if (shipment.cust_shipmt_trans_mode === SCOF_ORDER_TRANSMODES[2].value) {
        transMode = (<i className={SCOF_ORDER_TRANSMODES[2].icon} />);
      } else if (shipment.cust_shipmt_trans_mode === SCOF_ORDER_TRANSMODES[3].value) {
        transMode = (<i className={SCOF_ORDER_TRANSMODES[3].icon} />);
      }
      const wrapType = WRAP_TYPE.filter(wt => wt.value === shipment.cust_shipmt_package);
      return (
        <Row type="flex">
          <Col className="col-flex-primary">
            <div>{transMode} {shipment.cust_shipmt_bill_lading} {shipment.cust_shipmt_mawb && `${shipment.cust_shipmt_mawb}_${shipment.cust_shipmt_hawb}`}</div>
            <div>{shipment.cust_shipmt_package}{wrapType && wrapType[0] && wrapType[0].text}{shipment.cust_shipmt_pieces}件 {shipment.cust_shipmt_weight}KG</div>
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
