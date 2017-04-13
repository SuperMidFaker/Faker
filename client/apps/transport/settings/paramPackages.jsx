import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import connectNav from 'client/common/decorators/connect-nav';
import { Breadcrumb, Layout, Menu, Icon, Table, Popconfirm, Input, message } from 'antd';
import { format } from 'client/common/i18n/helpers';
import NavLink from 'client/components/nav-link';
import messages from './message.i18n';
import { loadParamPackages, removeParamPackage, addParamPackage, updateParamPackage } from 'common/reducers/transportSettings';
import withPrivilege from 'client/common/decorators/withPrivilege';
import connectFetch from 'client/common/decorators/connect-fetch';

const formatMsg = format(messages);
const { Header, Content, Sider } = Layout;
const SubMenu = Menu.SubMenu;

function fetchData({ dispatch, state }) {
  return dispatch(loadParamPackages(state.account.tenantId));
}

@connectFetch()(fetchData)
@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    paramPackages: state.transportSettings.paramPackages,
  }),
  { loadParamPackages, removeParamPackage, addParamPackage, updateParamPackage }
)
@connectNav({
  depth: 2,
  moduleName: 'transport',
})
@withPrivilege({ module: 'transport', feature: 'setting', action: 'edit' })
export default class ParamPackages extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
    paramPackages: PropTypes.array.isRequired,
    loadParamPackages: PropTypes.func.isRequired,
    removeParamPackage: PropTypes.func.isRequired,
    addParamPackage: PropTypes.func.isRequired,
    updateParamPackage: PropTypes.func.isRequired,
  }
  state = {
    editId: -2,
    paramPackages: [],
  }
  componentWillReceiveProps(nextProps) {
    this.setState({ paramPackages: nextProps.paramPackages.concat([{ id: -1, package_name: '', package_code: '' }]) });
  }
  msg = key => formatMsg(this.props.intl, key)
  handleEdit = (id) => {
    const { paramPackages } = this.state;
    const pack = paramPackages.find(item => item.id === id);
    if (pack && pack.package_name) {
      this.props.updateParamPackage(pack).then(() => {
        this.setState({ editId: -2 });
      });
    } else {
      message.error('名称不能为空');
    }
  }
  handleAdd = () => {
    const { paramPackages } = this.state;
    const index = paramPackages.length - 1;
    if (paramPackages[index].package_name) {
      this.props.addParamPackage({
        tenant_id: this.props.tenantId,
        package_code: paramPackages[index].package_code,
        package_name: paramPackages[index].package_name,
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
    this.props.removeParamPackage(record.id).then((result) => {
      if (result.error) {
        message.error(result.error.message, 10);
      }
    });
  }
  render() {
    const columns = [
      {
        title: '名称',
        dataIndex: 'package_name',
        key: 'package_name',
        render: (col, row) => {
          if (this.state.editId === row.id) {
            return (<Input value={col} onChange={(e) => {
              const paramPackages = this.state.paramPackages.map((item) => {
                if (item.id === row.id) {
                  return { ...item, package_name: e.target.value };
                } else {
                  return item;
                }
              });
              this.setState({ paramPackages });
            }}
            />);
          } else {
            return col;
          }
        },
      }, {
        title: '代码',
        dataIndex: 'package_code',
        key: 'package_code',
        render: (col, row) => {
          if (this.state.editId === row.id) {
            return (<Input value={col} onChange={(e) => {
              const paramPackages = this.state.paramPackages.map((item) => {
                if (item.id === row.id) {
                  return { ...item, package_code: e.target.value };
                } else {
                  return item;
                }
              });
              this.setState({ paramPackages });
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
                  defaultSelectedKeys={['paramPackages']}
                  mode="inline"
                >
                  <SubMenu key="bizdata" title={<span><Icon type="setting" /><span>业务数据</span></span>}>
                    <Menu.Item key="transportModes"><NavLink to="/transport/settings/transportModes">运输模式</NavLink></Menu.Item>
                    <Menu.Item key="paramVehicles"><NavLink to="/transport/settings/paramVehicles">车型车长</NavLink></Menu.Item>
                    <Menu.Item key="paramPackages"><NavLink to="/transport/settings/paramPackages">包装方式</NavLink></Menu.Item>
                  </SubMenu>
                </Menu>
              </Sider>
              <Content className="nav-content">
                <Table columns={columns} dataSource={this.state.paramPackages} rowKey="id" />
              </Content>
            </Layout>
          </div>
        </Content>
      </Layout>
    );
  }
}
