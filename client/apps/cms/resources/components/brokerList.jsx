import React, { Component, PropTypes } from 'react';
import { Breadcrumb, Table, Button, Layout, Menu, Popconfirm } from 'antd';
import QueueAnim from 'rc-queue-anim';
import moment from 'moment';
import NavLink from 'client/components/nav-link';
import SearchBar from 'client/components/search-bar';
import { PrivilegeCover } from 'client/common/decorators/withPrivilege';
import BrokerModal from '../modals/brokerModal';
import connectNav from 'client/common/decorators/connect-nav';
import { mapPartnerships } from '../util/dataMapping';

const { Header, Content, Sider } = Layout;
const rowSelection = {
  onSelect() {},
};
@connectNav({
  depth: 2,
  muduleName: 'clearance',
})
export default class BrokerList extends Component {
  static propTyps = {
    dataSource: PropTypes.array,
    onAddBtnClicked: PropTypes.func.isRequired,
    onStopBtnClick: PropTypes.func.isRequired,
    onDeleteBtnClick: PropTypes.func.isRequired,
    onResumeBtnClick: PropTypes.func.isRequired,
    onEditBtnClick: PropTypes.func.isRequired,
  }
  state = {
    searchText: '',
  }
  handleSearch = (value) => {
    this.setState({ searchText: value });
  }
  renderEditAndStopOperations = itemInfo => (
    <PrivilegeCover module="corp" feature="partners" action="edit">
      <span>
        <a onClick={() => this.props.onEditBtnClick(itemInfo)}>修改</a>
        <span className="ant-divider" />
        <a onClick={() => this.props.onStopBtnClick(itemInfo.id)}>停用</a>
      </span>
    </PrivilegeCover>
    )

  renderDeleteAndResumeOperations = (itemInfo) => {
    const { id } = itemInfo;
    return (
      <span>
        <PrivilegeCover module="corp" feature="partners" action="delete">
          <Popconfirm title="确定要删除吗？" onConfirm={() => this.props.onDeleteBtnClick(id)}>
            <a>删除</a>
          </Popconfirm>
        </PrivilegeCover>
        <span className="ant-divider" />
        <PrivilegeCover module="corp" feature="partners" action="edit">
          <a onClick={() => this.props.onResumeBtnClick(id)}>启用</a>
        </PrivilegeCover>
      </span>
    );
  }
  render() {
    const { dataSource, onAddBtnClicked } = this.props;
    const data = dataSource.filter((item) => {
      if (this.state.searchText) {
        const reg = new RegExp(this.state.searchText);
        return reg.test(item.name) || reg.test(item.customs_code) || reg.test(item.partner_unique_code);
      } else {
        return true;
      }
    });
    const columns = [
      {
        title: '报关行名称',
        dataIndex: 'name',
        key: 'name',
      }, {
        title: '海关十位编码',
        dataIndex: 'customs_code',
        key: 'customs_code',
      }, {
        title: '统一社会信用代码',
        dataIndex: 'partner_unique_code',
        key: 'partner_unique_code',
      }, {
        title: '业务类型',
        dataIndex: 'business',
        key: 'business',
        render(o) {
          return (
            <span>{o ? mapPartnerships(o.split(',')) : ''}</span>
          );
        },
      }, {
        title: '创建日期',
        dataIndex: 'created_date',
        key: 'created_date',
        render(o) {
          return moment(o).format('YYYY/MM/DD HH:mm');
        },
      }, {
        title: '操作',
        dataIndex: 'status',
        key: 'status',
        render: (_, record, index) => {
          if (record.status === 1) {
            return this.renderEditAndStopOperations(record, index);
          } else {
            return this.renderDeleteAndResumeOperations(record);
          }
        },
      },
    ];
    return (
      <QueueAnim type={['bottom', 'up']}>
        <Header className="top-bar">
          <Breadcrumb>
            <Breadcrumb.Item>
              资源设置
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              报关行
            </Breadcrumb.Item>
          </Breadcrumb>
          <div className="top-bar-tools">
            <SearchBar placeholder="名称/海关十位编码/统一社会信用代码" onInputSearch={this.handleSearch}
              value={this.state.searchText} size="large"
            />
          </div>
        </Header>
        <Content className="main-content" key="main">
          <div className="page-body">
            <Layout className="main-wrapper">
              <Sider className="nav-sider">
                <Menu
                  defaultSelectedKeys={['broker']}
                  mode="inline"
                >
                  <Menu.Item key="broker"><NavLink to="/clearance/resources/broker">报关行</NavLink></Menu.Item>
                  <Menu.Item key="unit"><NavLink to="/clearance/resources/unit">经营单位</NavLink></Menu.Item>
                </Menu>
              </Sider>
              <Content className="nav-content">
                <div className="toolbar">
                  <PrivilegeCover module="clearance" feature="resources" action="create">
                    <Button type="primary" size="large" onClick={onAddBtnClicked} icon="plus-circle-o">新增报关行</Button>
                  </PrivilegeCover>
                </div>
                <div className="panel-body table-panel">
                  <Table dataSource={data} columns={columns} rowSelection={rowSelection} />
                </div>
              </Content>
            </Layout>
            <BrokerModal />
          </div>
        </Content>
      </QueueAnim>
    );
  }
}
