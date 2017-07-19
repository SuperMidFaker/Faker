import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Avatar, Card, Badge, message } from 'antd';
import { format } from 'client/common/i18n/helpers';
import messages from '../message.i18n';
import { MdIcon } from 'client/components/FontIcon';
import { updateCustomerNames } from 'common/reducers/crmCustomers';
import { CUSTOMER_TYPES } from 'common/constants';

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
          <Avatar shape="square" size="large" icon="global" />
          <h2 style={{ display: 'inline-block', marginLeft: 8 }}>{customer.name}</h2>
        </div>
        {
          CUSTOMER_TYPES.map((item) => {
            let iconType = item.value;
            if (item.value === 'warehousing') {
              iconType = 'cwm';
            }
            return (
              <Card.Grid style={{ width: `${1 / CUSTOMER_TYPES.length * 100}%`, fontSize: 16 }}>
                <MdIcon type={iconType} /> {item.label}业务
                <span className="pull-right">
                  {customer.business_type && customer.business_type.indexOf(item.value) >= 0 ? <Badge status="success" text="开通" /> : <Badge status="default" text="未开通" /> }
                </span>
              </Card.Grid>
            );
          })
        }
      </Card>
    );
  }
}
