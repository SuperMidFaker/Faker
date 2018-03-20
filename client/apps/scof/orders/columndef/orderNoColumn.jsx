import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Row, Col, Icon, Popover } from 'antd';
import { loadOrderDetail } from 'common/reducers/sofOrders';

@connect(
  state => ({
    tenantId: state.account.tenantId,
  }),
  { loadOrderDetail }
)
export default class OrderNoColumn extends React.Component {
  static propTypes = {
    order: PropTypes.shape({
      shipmt_order_no: PropTypes.string,
    }).isRequired,
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
            {noArray.map(item => <p key={item}>{item}</p>)}
          </div>
        );
      }
      return (
        <Row type="flex">
          <Col className="col-flex-primary">
            <a onClick={() => this.props.loadOrderDetail(
              order.shipmt_order_no,
              this.props.tenantId
            )}
            >
              {order.shipmt_order_no}
            </a>
            <div>{order.customer_name}</div>
            <div className="mdc-text-grey">{order.cust_order_no} {order.cust_invoice_no && <Popover placement="right" content={content}><Icon type="caret-right" /></Popover>}</div>
          </Col>
        </Row>
      );
    }
    return <span />;
  }
}
