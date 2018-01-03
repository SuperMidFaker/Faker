import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Avatar, Card, Badge } from 'antd';
import { format } from 'client/common/i18n/helpers';
import messages from '../message.i18n';
import { MdIcon } from 'client/components/FontIcon';
import { BUSINESS_TYPES } from 'common/constants';

const formatMsg = format(messages);

@injectIntl
@connect(
  () => ({}),
  { },
)
export default class OverviewCard extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    customer: PropTypes.object.isRequired,
  }
  msg = key => formatMsg(this.props.intl, key);
  render() {
    const { customer } = this.props;
    return (
      <Card bodyStyle={{ padding: 0 }}>
        <div style={{ padding: 24 }}>
          <Avatar shape="square" icon="global" />
          <h2 style={{ display: 'inline-block', marginLeft: 8 }}>{customer.name}</h2>
        </div>
        {
          BUSINESS_TYPES.map((item) => {
            let iconType = item.value;
            if (item.value === 'warehousing') {
              iconType = 'cwm';
            }
            return (
              <Card.Grid style={{ width: `${1 / BUSINESS_TYPES.length * 100}%`, fontSize: 16 }}>
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
