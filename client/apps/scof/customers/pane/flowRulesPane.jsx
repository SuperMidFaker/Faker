import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Table } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import { loadCustomerFlows } from 'common/reducers/sofCustomers';
import { format } from 'client/common/i18n/helpers';
import messages from '../message.i18n';

const formatMsg = format(messages);

@injectIntl
@connect(state => ({
  tenantId: state.account.tenantId,
}), { loadCustomerFlows })

export default class FlowRulesPane extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
    customer: PropTypes.object.isRequired,
    loadCustomerFlows: PropTypes.func.isRequired,
  }
  state = {
    flows: [],
  }
  componentWillReceiveProps(nextProps) {
    if (this.props.customer && this.props.customer.id !== nextProps.customer.id) {
      nextProps.loadCustomerFlows({ customerPartnerId: nextProps.customer.id, tenantId: nextProps.tenantId }).then((result) => {
        this.setState({ flows: result.data });
      });
    }
  }
  msg = key => formatMsg(this.props.intl, key)
  render() {
    const columns = [{
      dataIndex: 'name',
      key: 'name',
      title: '流程名称',
    }, {
      dataIndex: 'nodes',
      key: 'nodes',
      title: '流程节点',
      render: o => o.map(item => item.name).join('->'),
    }, {
      dataIndex: 'tracking_name',
      key: 'tracking_name',
      title: '客户追踪表',
    }];
    return (
      <Table size="middle" columns={columns} dataSource={this.state.flows} rowKey="id" />
    );
  }
}
