import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Avatar, Card, Badge, message } from 'antd';
import { format } from 'client/common/i18n/helpers';
import messages from '../message.i18n';
import { MdIcon } from 'client/components/FontIcon';
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
      <Card noHovering bodyStyle={{ padding: 0 }}>
        <div style={{ padding: 24 }}>
          <Avatar shape="square" size="large" icon="user" />
          <h4>{customer.name}</h4>
        </div>
        <Card.Grid style={{ width: '33%' }}>
          <MdIcon type="clearance" />清关业务 <span className="pull-right"><Badge status="success" text="开通" /></span>
        </Card.Grid>
        <Card.Grid style={{ width: '34%' }}>
          <MdIcon type="cwm" />仓储业务 <span className="pull-right"><Badge status="default" text="未开通" /></span>
        </Card.Grid>
        <Card.Grid style={{ width: '33%' }}>
          <MdIcon type="transport" />运输业务 <span className="pull-right"><Badge status="success" text="开通" /></span>
        </Card.Grid>
      </Card>
    );
  }
}
