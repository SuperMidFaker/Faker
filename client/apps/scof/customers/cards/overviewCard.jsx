import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Card, Row, Col, message } from 'antd';
import { format } from 'client/common/i18n/helpers';
import messages from '../message.i18n';
import InfoItem from 'client/components/InfoItem';
import { updateCustomerNames } from 'common/reducers/crmCustomers';

const formatMsg = format(messages);

@injectIntl
@connect(
  () => ({}),
  { updateCustomerNames },
)
export default class OverviewCard extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    customer: PropTypes.object.isRequired,
  }
  msg = key => formatMsg(this.props.intl, key);
  handleEdit = (value, filed) => {
    const id = this.props.customer.id;
    const type = filed === 'displayName' ? 'display_name' : 'en_name';
    const data = {
      id,
      type,
      value,
    };
    this.props.updateCustomerNames(data).then((result) => {
      if (result.error) {
        message.error(result.error.message, 10);
      } else {
        message.info('修改成功');
      }
    });
  }
  render() {
    const { customer } = this.props;
    return (
      <Card>
        <Row gutter={16}>
          <Col sm={24} lg={24}>
            <InfoItem
              label={this.msg('customerName')}
              field={customer.name}
            />
          </Col>
          <Col sm={24} lg={12}>
            <InfoItem label={this.msg('displayName')} dataIndex="displayName" field={customer.display_name}
              placeholder="添加显示名称" onEdit={this.handleEdit} editable
            />
          </Col>
          <Col sm={24} lg={12}>
            <InfoItem label={this.msg('englishName')} dataIndex="englishName" field={customer.en_name}
              placeholder="添加英文名称" onEdit={this.handleEdit} editable
            />
          </Col>
        </Row>
      </Card>
    );
  }
}
