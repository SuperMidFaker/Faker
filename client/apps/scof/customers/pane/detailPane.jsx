import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Button, Row, Col } from 'antd';
import InfoItem from 'client/components/InfoItem';
import { format } from 'client/common/i18n/helpers';
import { showCustomerModal } from 'common/reducers/sofCustomers';
import messages from '../message.i18n';

const formatMsg = format(messages);

@injectIntl
@connect(
  () => ({}),
  { showCustomerModal }
)
export default class CustomerData extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    customer: PropTypes.object.isRequired,
  }
  msg = key => formatMsg(this.props.intl, key)
  render() {
    const { customer } = this.props;
    return (
      <div className="pane">
        <div className="pull-right">
          <Button onClick={() => this.props.showCustomerModal('edit', customer)}>修改</Button>
        </div>
        <div className="panel-body">
          <Row gutter={16}>
            <Col sm={24}>
              <InfoItem
                label="客户代码"
                field={customer.partner_code}
              />
            </Col>
            <Col sm={24}>
              <InfoItem
                label="统一社会信用代码"
                field={customer.partner_unique_code}
              />
            </Col>
            <Col sm={24}>
              <InfoItem
                label="海关编码"
                field={customer.customs_code}
              />
            </Col>
            <Col sm={24}>
              <InfoItem
                label="联系人"
                field={customer.contact}
              />
            </Col>
            <Col sm={24}>
              <InfoItem
                label="电话"
                field={customer.phone}
              />
            </Col>
            <Col sm={24}>
              <InfoItem
                label="邮箱"
                field={customer.email}
              />
            </Col>
          </Row>
        </div>
      </div>
    );
  }
}
