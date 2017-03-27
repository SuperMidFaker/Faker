import React, { PropTypes } from 'react';
import { intlShape, injectIntl } from 'react-intl';
import { Row, Col } from 'antd';

@injectIntl
export default class OrderNoColumn extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    order: PropTypes.object.isRequired,
  }

  render() {
    const { order } = this.props;
    if (order) {
      return (
        <Row type="flex">
          <Col className="col-flex-primary">
            <a onClick={() => this.props.loadOrderDetail(order.shipmt_order_no, this.props.tenantId)}>{order.shipmt_order_no}</a>
            <div>{order.customer_name}</div>
            <div>{order.cust_order_no}</div>
            <div>{order.cust_invoice_no}</div>
          </Col>
        </Row>
      );
    } else {
      return <div />;
    }
  }
}
