import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import connectNav from 'client/common/decorators/connect-nav';
import { Breadcrumb, Layout, Menu, Icon, Table, Popconfirm, Input, message } from 'antd';
import { format } from 'client/common/i18n/helpers';
import NavLink from 'client/components/nav-link';
import messages from './message.i18n';
import { loadParamContainers, removeParamContainer, addParamContainer, updateParamContainer } from 'common/reducers/transportSettings';
import withPrivilege from 'client/common/decorators/withPrivilege';
import connectFetch from 'client/common/decorators/connect-fetch';

const formatMsg = format(messages);
const { Header, Content, Sider } = Layout;
const SubMenu = Menu.SubMenu;

function fetchData({ dispatch, state }) {
  return dispatch(loadParamContainers(state.account.tenantId));
}

@connectFetch()(fetchData)
@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    paramContainers: state.transportSettings.paramContainers,
  }),
  { loadParamContainers, removeParamContainer, addParamContainer, updateParamContainer }
)
@connectNav({
  depth: 2,
  moduleName: 'transport',
})
@withPrivilege({ module: 'transport', feature: 'setting', action: 'edit' })
export default class ParamContainers extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
    paramContainers: PropTypes.array.isRequired,
    loadParamContainers: PropTypes.func.isRequired,
    removeParamContainer: PropTypes.func.isRequired,
    addParamContainer: PropTypes.func.isRequired,
    updateParamContainer: PropTypes.func.isRequired,
  }
  state = {
    editId: -2,
    paramContainers: [],
  }
  componentWillReceiveProps(nextProps) {
    this.setState({ paramContainers: nextProps.paramContainers.concat([{ id: -1, name: '', code: '' }]) });
  }
  msg = key => formatMsg(this.props.intl, key)
  handleEdit = (id) => {
    const { paramContainers } = this.state;
    const pack = paramContainers.find(item => item.id === id);
    if (pack && pack.package_name) {
      this.props.updateParamContainer(pack).then(() => {
        this.setState({ editId: -2 });
      });
    } else {
      message.error('名称不能为空');
    }
  }
  handleAdd = () => {
    const { paramContainers } = this.state;
    const index = paramContainers.length - 1;
    if (paramContainers[index].name) {
      this.props.addParamContainer({
        tenant_id: this.props.tenantId,
        code: paramContainers[index].code,
        name: paramContainers[index].name,
      }).then((result) => {
        if (result.error) {
          message.error(result.error.message, 10);
        } else {
          this.setState({ editId: -2 });
        }
      });
    } else {
      message.error('名称不能为空');
    }
  }
  handleRemove = (record) => {
    this.props.removeParamContainer(record.id).then((result) => {
      if (result.error) {
        message.error(result.error.message, 10);
      }
    });
  }
  render() {
    const columns = [
      {
        title: '名称',
        dataIndex: 'name',
        key: 'name',
        render: (col, row) => {
          if (this.state.editId === row.id) {
            return (<Input value={col} onChange={(e) => {
              const paramContainers = this.state.paramContainers.map((item) => {
                if (item.id === row.id) {
                  return { ...item, name: e.target.value };
                } else {
                  return item;
                }
              });
              this.setState({ paramContainers });
            }}
            />);
          } else {
            return col;
          }
        },
      }, {
        title: '代码',
        dataIndex: 'code',
        key: 'code',
        render: (col, row) => {
          if (this.state.editId === row.id) {
            return (<Input value={col} onChange={(e) => {
              const paramContainers = this.state.paramContainers.map((item) => {
                if (item.id === row.id) {
                  return { ...item, code: e.target.value };
                } else {
                  return item;
                }
              });
              this.setState({ paramContainers });
            }}
            />);
          } else {
            return col;
          }
        },
      }, {
        title: '操作',
        dataIndex: 'enabled',
        key: 'enabled',
        render: (_, row) => {
          if (this.state.editId === row.id) {
            if (row.id === -1) {
              return (<a onClick={this.handleAdd}><Icon type="save" /></a>);
            } else {
              return (<a onClick={() => this.handleEdit(row.id)}><Icon type="save" /></a>);
            }
          } else if (row.id === -1) {
            return (<a onClick={() => {
              this.setState({ editId: row.id });
            }}
            ><Icon type="plus" /></a>);
          } else {
            return (
              <span>
                <a onClick={() => {
                  this.setState({ editId: row.id });
                }}
                ><Icon type="edit" /></a>
                <span className="ant-divider" />
                <Popconfirm title="确认删除?" onConfirm={() => this.handleRemove(row)}>
                  <a role="button"><Icon type="delete" /></a>
                </Popconfirm>
              </span>
            );
          }
        },
      },
    ];
    return (
      <Layout>
        <Header className="top-bar">
          <Breadcrumb>
            <Breadcrumb.Item>
              {this.msg('appSettings')}
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              业务数据
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              数据类型
            </Breadcrumb.Item>
          </Breadcrumb>
        </Header>
        <Content className="main-content" key="main">
          <div className="page-body">
            <Layout className="main-wrapper">
              <Sider className="nav-sider">
                <Menu
                  defaultOpenKeys={['bizdata']}
                  defaultSelectedKeys={['paramContainers']}
                  mode="inline"
                >
                  <SubMenu key="bizdata" title={<span><Icon type="setting" /><span>业务数据</span></span>}>
                    <Menu.Item key="transportModes"><NavLink to="/transport/settings/transportModes">运输模式</NavLink></Menu.Item>
                    <Menu.Item key="paramVehicles"><NavLink to="/transport/settings/paramVehicles">车型车长</NavLink></Menu.Item>
                    <Menu.Item key="paramPackages"><NavLink to="/transport/settings/paramPackages">包装方式</NavLink></Menu.Item>
                    <Menu.Item key="paramGoodsTypes"><NavLink to="/transport/settings/paramGoodsTypes">货物类型</NavLink></Menu.Item>
                    <Menu.Item key="paramContainers"><NavLink to="/transport/settings/paramContainers">集装箱类型</NavLink></Menu.Item>
                  </SubMenu>
                </Menu>
              </Sider>
              <Content className="nav-content">
                <Table columns={columns} dataSource={this.state.paramContainers} rowKey="id" />
              </Content>
            </Layout>
          </div>
        </Content>
      </Layout>
    );
  }
}
