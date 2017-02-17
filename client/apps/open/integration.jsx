import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Button, Table } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import { format } from 'client/common/i18n/helpers';
import messages from './message.i18n';

const formatMsg = format(messages);

@injectIntl
@connect(
  state => ({
    profile: state.account.profile,
    role: state.account.role_name,
    tenantId: state.account.tenantId,
    parentTenantId: state.account.parentTenantId,
    code: state.account.code,
  }),
)

export default class IntegrationList extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,

  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  state = {
    avatar: '',
  }
  msg = (key, values) => formatMsg(this.props.intl, key, values);
  handleCancel = () => {
    this.context.router.goBack();
  }
  columns = [{
    title: this.msg('integrationName'),
    dataIndex: 'integration_name',
  }, {
    title: this.msg('relatedPartner'),
    width: 400,
    dataIndex: 'related_partner',
  }, {
    title: this.msg('incomingStatus'),
    dataIndex: 'incoming_status',
    width: 200,
  }, {
    title: this.msg('outgoingStatus'),
    dataIndex: 'outgoing_status',
    width: 200,
  }, {
    title: this.msg('opColumn'),
    width: 100,
    render: () => (
      <span>
        <a href="#">修改</a>
        <span className="ant-divider" />
        <a href="#">停用</a>
      </span>
  ),
  }];

  mockDataSource = [{
    integration_name: 'Amber Road CTM',
    related_partner: '西门子贸易',
    incoming_status: '正常',
    outgoing_status: '异常',
  },
  ];

  render() {
    return (
      <div className="page-body" >
        <div className="toolbar">
          <Button type="primary" size="large" icon="plus" onClick={this.handleAddWarehouse}>
            {this.msg('addIntegration')}
          </Button>
        </div>
        <div className="panel-body table-panel">
          <Table columns={this.columns} dataSource={this.mockDataSource} />
        </div>
      </div>
    );
  }
}