import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Breadcrumb, Layout, Table } from 'antd';
import QueueAnim from 'rc-queue-anim';
import SearchBar from 'client/components/search-bar';
import connectNav from 'client/common/decorators/connect-nav';
import { format } from 'client/common/i18n/helpers';
import messages from './message.i18n';

const formatMsg = format(messages);
const { Header, Content } = Layout;

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
export default class InboundTransactionsList extends React.Component {
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
    title: this.msg('warehouse'),
    width: 160,
    dataIndex: 'warehouse_code',
  }, {
    title: this.msg('inboundNo'),
    dataIndex: 'inbound_no',
    width: 120,
  }, {
    title: this.msg('inboundDate'),
    dataIndex: 'inbound_date',
    width: 120,
  }, {
    title: this.msg('sku'),
    width: 200,
    dataIndex: 'sku_no',
  }, {
    title: this.msg('actualQty'),
    width: 100,
    dataIndex: 'actual_qty',
  }, {
    title: this.msg('postQty'),
    width: 100,
    dataIndex: 'post_inbound_qty',
  }, {
    title: this.msg('lotNo/serialNo'),
    width: 120,
  }, {
    title: this.msg('vendor'),
    dataIndex: 'vendor_name',
  }, {
    title: this.msg('ASN'),
    width: 200,
    dataIndex: 'asn_no',
  }, {
    title: this.msg('unitPrice'),
    width: 120,
    dataIndex: 'unit_price',
  }, {
    title: this.msg('manufDate/expiryDate'),
    width: 200,
    dataIndex: 'specific_date',
  }]
  render() {
    return (
      <QueueAnim type={['bottom', 'up']}>
        <Header className="top-bar">
          <Breadcrumb>
            <Breadcrumb.Item>
              {this.msg('inbound')}
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              {this.msg('inboundTransactions')}
            </Breadcrumb.Item>
          </Breadcrumb>
          <div className="toolbar-right" />
        </Header>
        <Content className="main-content" key="main">
          <div className="page-body">
            <div className="toolbar">
              <SearchBar placeholder={this.msg('searchPlaceholder')} size="large" onInputSearch={this.handleSearch} />
              <div className={`bulk-actions ${this.state.selectedRowKeys.length === 0 ? 'hide' : ''}`}>
                <h3>已选中{this.state.selectedRowKeys.length}项</h3>
              </div>
            </div>
            <div className="panel-body table-panel">
              <Table columns={this.columns} dataSource={this.dataSource} rowKey="id" scroll={{ x: 1400 }} />
            </div>
          </div>
        </Content>
      </QueueAnim>
    );
  }
}
