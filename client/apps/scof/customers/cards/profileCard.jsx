import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Card, Collapse } from 'antd';
import { format } from 'client/common/i18n/helpers';
import { showCustomerModal } from 'common/reducers/sofCustomers';
import messages from '../message.i18n';
import DetailPane from '../pane/detailPane';
import SubCustomerPane from '../pane/subCustomerPane';

const formatMsg = format(messages);
const Panel = Collapse.Panel;

@injectIntl
@connect(
  () => ({
  }),
  { showCustomerModal }
)

export default class ProfileCard extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    customer: PropTypes.object.isRequired,
    showCustomerModal: PropTypes.func.isRequired,
  }

  msg = key => formatMsg(this.props.intl, key)
  render() {
    const { customer } = this.props;
    return (
      <Card bodyStyle={{ padding: 0 }}>
        <Collapse bordered={false} defaultActiveKey={['profile']}>
          <Panel header={this.msg('profile')} key="profile">
            <DetailPane customer={customer} />
          </Panel>
          <Panel header={this.msg('subCustomer')} key="sub">
            {customer.parent_id === 0 ? (<SubCustomerPane customer={customer} />) : null}
          </Panel>
        </Collapse>
      </Card>
    );
  }
}
