import React, { PropTypes } from 'react';
import { intlShape, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { Row, Col, Icon, Popover } from 'antd';
import { loadOrderDetail } from 'common/reducers/crmOrders';

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
  }),
  { loadOrderDetail }
)
export default class OrderNoColumn extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    order: PropTypes.object.isRequired,
    loadOrderDetail: PropTypes.func.isRequired,
  }

  render() {
    const { order } = this.props;
    if (order) {
      let content;
      if (order.cust_invoice_no) {
        const noArray = order.cust_invoice_no.split(',');
        content = (
          <div>
            {noArray.map((item, index) => <p key={index}>{item}</p>)}
          </div>
        );
      }
      return (
        <Row type="flex">
          <Col className="col-flex-primary">
            <a onClick={() => this.props.loadOrderDetail(order.shipmt_order_no, this.props.tenantId)}>{order.shipmt_order_no}</a>
            <div>{order.customer_name}</div>
            <div className="mdc-text-grey">{order.cust_order_no} {order.cust_invoice_no && <Popover placement="right" content={content} title="发票号"><Icon type="caret-right" /></Popover>}</div>
          </Col>
        </Row>
      );
    } else {
      return <div />;
    }
  }
}
