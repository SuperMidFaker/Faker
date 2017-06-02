import React, { Component } from 'react';
import { intlShape, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import connectNav from 'client/common/decorators/connect-nav';
import { Layout, Table, Tooltip, Button, Input, Breadcrumb, Tabs, Card, Popover, Menu } from 'antd';
import { format } from 'client/common/i18n/helpers';
import messages from '../message.i18n';
import WarehouseModal from './modal/warehouseModal';
import MdIcon from 'client/components/MdIcon';
import { showWarehouseModal } from 'common/reducers/cwmWarehouse';

const formatMsg = format(messages);
const { Header, Content, Sider } = Layout;
const Search = Input.Search;
const TabPane = Tabs.TabPane;
const SubMenu = Menu.SubMenu;
@injectIntl
@connectNav({
  depth: 2,
  moduleName: 'cwm',
})
@connect(
  () => ({}),
  { showWarehouseModal }
)
export default class WareHouse extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
  }
  state = {
    collapsed: false,
  }
  componentWillMount() {
  }
  componentWillReceiveProps() {

  }
  msg = key => formatMsg(this.props.intl, key);
  showWarehouseModal = () => {
    this.props.showWarehouseModal();
  }
  render() {
    const columns = [{
      dataIndex: 'wh_name',
      key: 'wh_name',
    }];
    return (
      <Layout>
        <Sider width={320} className="menu-sider" key="sider" trigger={null}
          collapsible
          collapsed={this.state.collapsed}
          collapsedWidth={0}
        >
          <div className="left-sider-panel">
            <div className="top-bar">
              <Breadcrumb>
                <Breadcrumb.Item>
                  仓库
                </Breadcrumb.Item>
              </Breadcrumb>
              <div className="pull-right">
                <Tooltip placement="bottom" title="新增仓库">
                  <Button type="primary" shape="circle" icon="plus" onClick={this.showWarehouseModal} />
                </Tooltip>
              </div>
            </div>
            <div className="left-sider-panel">
              <div className="toolbar">
                <Search
                  placeholder={this.msg('searchPlaceholder')}
                  size="large"
                />
              </div>
              <Table columns={columns} showHeader={false} />
              <WarehouseModal />
            </div>
          </div>
        </Sider>
        <Layout>
          <Header className="top-bar">
            <Breadcrumb>
              <Breadcrumb.Item>
                仓库
              </Breadcrumb.Item>
            </Breadcrumb>
          </Header>
          <Content className="main-content">
            <Card>
              <Tabs defaultActiveKey="1">
                <TabPane tab="库区/库位" key="1">
                  <Layout className="main-wrapper">
                    <Sider className="nav-sider">
                      <Menu defaultOpenKeys={['deptMenu']} mode="inline">
                        <SubMenu key="deptMenu" title={<span><MdIcon mode="fontello" type="sitemap" />库区</span>} />
                      </Menu>
                      <div className="nav-sider-footer">
                        <Popover placement="bottom" title="创建部门" trigger="click">
                          <Button type="dashed" size="large" icon="plus-circle">创建库区</Button>
                        </Popover>
                      </div>
                    </Sider>
                    <Content className="nav-content">
                      <div className="nav-content-head">
                        <Button size="large" type="primary" icon="user-add">
                          添加库位
                        </Button>
                      </div>
                      <div className="panel-body table-panel">
                        <Table />
                      </div>
                    </Content>
                  </Layout>
                </TabPane>
                <TabPane tab="监管系统" key="2" />
              </Tabs>
            </Card>
          </Content>
        </Layout>
      </Layout>
    );
  }
}
