import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Breadcrumb, Button, Dropdown, Menu, Layout, Table } from 'antd';
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
  moduleName: 'scv',
})
export default class CWMSkuList extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  msg = key => formatMsg(this.props.intl, key);
  columns = [{
    title: this.msg('owner'),
    dataIndex: 'owner_name',
    width: 200,
  }, {
    title: this.msg('SKU'),
    dataIndex: 'sku_no',
    width: 160,
  }, {
    title: this.msg('productNo'),
    width: 200,
    dataIndex: 'product_no',
  }, {
    title: this.msg('productName'),
    width: 200,
    dataIndex: 'product_name',
  }, {
    title: this.msg('category'),
    width: 120,
    dataIndex: 'product_category',
  }, {
    title: this.msg('description'),
    dataIndex: 'product_desc',
  }, {
    title: this.msg('type'),
    width: 100,
    dataIndex: 'product_type',
  }, {
    title: this.msg('opColumn'),
    width: 160,
  }]
  handleCreateBtnClick = () => {
    this.context.router.push('/scv/products/sku/create');
  }
  render() {
    const menu = (
      <Menu>
        <Menu.Item key="1">1st menu item</Menu.Item>
        <Menu.Item key="2">2nd menu item</Menu.Item>
        <Menu.Item key="3">3d menu item</Menu.Item>
      </Menu>
);
    return (
      <QueueAnim type={['bottom', 'up']}>
        <Header className="top-bar">
          <Breadcrumb>
            <Breadcrumb.Item>
              {this.msg('products')}
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              {this.msg('productsSku')}
            </Breadcrumb.Item>
          </Breadcrumb>
          <div className="top-bar-tools">
            <Dropdown.Button overlay={menu}>
              Dropdown
            </Dropdown.Button>
            <Button.Group size="large">
              <Button>
                {this.msg('import')}
              </Button>
              <Button>
                {this.msg('export')}
              </Button>
            </Button.Group>
            <Button type="primary" size="large" icon="plus" onClick={this.handleCreateBtnClick}>
              {this.msg('createSKU')}
            </Button>
          </div>
        </Header>
        <Content className="main-content" key="main">
          <div className="page-body">
            <div className="toolbar">
              <SearchBar size="large" placeholder={this.msg('searchPlaceholder')} onInputSearch={this.handleSearch} />
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
