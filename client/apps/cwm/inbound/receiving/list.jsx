import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Breadcrumb, Layout, Radio, Table } from 'antd';
import QueueAnim from 'rc-queue-anim';
import SearchBar from 'client/components/search-bar';
import connectNav from 'client/common/decorators/connect-nav';
import { format } from 'client/common/i18n/helpers';
import messages from '../message.i18n';

const formatMsg = format(messages);
const { Header, Content } = Layout;
const RadioGroup = Radio.Group;
const RadioButton = Radio.Button;

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
  }),
)
@connectNav({
  depth: 2,
  moduleName: 'cwm',
})
export default class ReceivingNoticeList extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  state = {
    selectedRowKeys: [],
    searchInput: '',
  }
  msg = key => formatMsg(this.props.intl, key);
  columns = [{
    title: this.msg('asnNo'),
    dataIndex: 'asn_no',
    width: 200,
  }, {
    title: this.msg('owner'),
    width: 200,
    dataIndex: 'owner_code',
  }, {
    title: this.msg('status'),
    width: 200,
    dataIndex: 'status',
  }, {
    title: this.msg('estReceivingDate'),
    dataIndex: 'est_receiving_date',
    width: 160,
  }, {
    title: this.msg('plannedQty'),
    width: 120,
    dataIndex: 'planned_qty',
  }, {
    title: this.msg('vendor'),
    dataIndex: 'vendor',
  }]
  handleStatusChange = (ev) => {
    if (ev.target.value === this.props.listFilter.status) {

    }
  }
  render() {
    return (
      <QueueAnim type={['bottom', 'up']}>
        <Header className="top-bar" key="header">
          <Breadcrumb>
            <Breadcrumb.Item>
              {this.msg('inbound')}
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              {this.msg('receivingNotice')}
            </Breadcrumb.Item>
          </Breadcrumb>
          <RadioGroup onChange={this.handleStatusChange} size="large">
            <RadioButton value="pending">{this.msg('pending')}</RadioButton>
            <RadioButton value="received">{this.msg('received')}</RadioButton>
          </RadioGroup>
          <div className="toolbar-right" />
        </Header>
        <Content className="main-content" key="main">
          <div className="page-body">
            <div className="toolbar">
              <SearchBar placeholder={this.msg('searchPlaceholder')} size="large" onInputSearch={this.handleSearch} />
              <div className="toolbar-right" />
              <div className={`bulk-actions ${this.state.selectedRowKeys.length === 0 ? 'hide' : ''}`}>
                <h3>已选中{this.state.selectedRowKeys.length}项</h3>
              </div>
            </div>
            <div className="panel-body table-panel">
              <Table columns={this.columns} dataSource={this.dataSource} rowKey="id" scroll={{ x: 1200 }} />
            </div>
          </div>
        </Content>
      </QueueAnim>
    );
  }
}
