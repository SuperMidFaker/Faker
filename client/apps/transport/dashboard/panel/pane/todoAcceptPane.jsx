import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Button, Table, Radio } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import { formatMsg } from '../../message.i18n';

const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;


@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
  })
)
export default class TodoAcceptPane extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
  }
  msg = formatMsg(this.props.intl)
  mockDataSource = [{
    shipmt_no: 'NLO17000498TC',
    scope: '全局',
    subs_events: 'Manifest Created, Customs Cleared',
    callback_url: 'https://wms.nlocn.com/hook',
    sign: 'd3ec0148208487f4136d0d03a997d5b798',
  },
  ];
  render() {
    const columns = [{
      dataIndex: 'item',
      render: (o, record) => (<div style={{ paddingLeft: 15 }}>{record.shipmt_no}</div>),
    }, {
      dataIndex: 'action',
      render: (o, record) => (<Button type="primary" ghost>{record.scope}</Button>
      ),
    }];
    return (
      <div>
        <div className="pane-header">
          <RadioGroup onChange={this.handleTodoFilter} size="large">
            <RadioButton value="all">{this.msg('all')}</RadioButton>
            <RadioButton value="toAccept">{this.msg('toAccept')}</RadioButton>
            <RadioButton value="toDispatch">{this.msg('toDispatch')}</RadioButton>
            <RadioButton value="prompt">{this.msg('prompt')}</RadioButton>
          </RadioGroup>
        </div>
        <div className="pane-content">
          <Table size="middle" dataSource={this.mockDataSource} columns={columns} showHeader={false}
            locale={{ emptyText: '没有待办事项' }} pagination={false}
          />
        </div>
      </div>
    );
  }
}
