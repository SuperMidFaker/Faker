import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Button, Layout, Table } from 'antd';
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
export default class CWMProductMaterialList extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
  }
  msg = key => formatMsg(this.props.intl, key);
  columns = [{
    title: this.msg('owner'),
    dataIndex: 'owner',
    width: 200,
  }, {
    title: this.msg('productName'),
    width: 160,
    dataIndex: 'product_name',
  }, {
    title: this.msg('sku'),
    dataIndex: 'sku',
    width: 160,
  }, {
    title: this.msg('vendor'),
    width: 120,
    dataIndex: 'vendor',
  }, {
    title: this.msg('warehouseLocation'),
    dataIndex: 'wh_location',
  }, {
    title: this.msg('wmsIntegration'),
    width: 120,
    dataIndex: 'wh_integration',
  }, {
    title: this.msg('opColumn'),
    width: 160,
  }]
  render() {
    return (
      <QueueAnim type={['bottom', 'up']}>
        <Header className="top-bar" key="header">
          <div className="toolbar-right">
            <SearchBar size="large" placeholder={this.msg('searchPlaceholder')} onInputSearch={this.handleSearch} />
          </div>
          <span>{this.msg('productsSku')}</span>
        </Header>
        <Content className="main-content" key="main">
          <div className="page-body">
            <div className="toolbar">
              <Button type="primary" size="large" icon="plus">
                {this.msg('createSKU')}
              </Button>
              <Button size="large" icon="cloud-upload">
                {this.msg('importSKUs')}
              </Button>
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
