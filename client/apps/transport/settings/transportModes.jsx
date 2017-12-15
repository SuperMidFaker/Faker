import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import connectNav from 'client/common/decorators/connect-nav';
import { Breadcrumb, Layout, Menu, Icon, Popconfirm, Input, message } from 'antd';
import DataTable from 'client/components/DataTable';
import { format } from 'client/common/i18n/helpers';
import NavLink from 'client/components/NavLink';
import messages from './message.i18n';
import { loadTransportModes, removeTransportMode, addTransportMode, updateTransportMode } from 'common/reducers/transportSettings';
import withPrivilege from 'client/common/decorators/withPrivilege';
import { PRESET_TRANSMODES } from 'common/constants';
import connectFetch from 'client/common/decorators/connect-fetch';

const formatMsg = format(messages);
const { Header, Content, Sider } = Layout;
const SubMenu = Menu.SubMenu;

function fetchData({ dispatch, state }) {
  return dispatch(loadTransportModes(state.account.tenantId));
}

@connectFetch()(fetchData)
@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    transportModes: state.transportSettings.transportModes,
  }),
  {
    loadTransportModes, removeTransportMode, addTransportMode, updateTransportMode,
  }
)
@connectNav({
  depth: 2,
  moduleName: 'transport',
})
@withPrivilege({ module: 'transport', feature: 'setting', action: 'edit' })
export default class TransportModes extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
    transportModes: PropTypes.array.isRequired,
    loadTransportModes: PropTypes.func.isRequired,
    removeTransportMode: PropTypes.func.isRequired,
    addTransportMode: PropTypes.func.isRequired,
    updateTransportMode: PropTypes.func.isRequired,
  }
  state = {
    editId: -2,
    transportModes: [],
  }
  componentWillReceiveProps(nextProps) {
    this.setState({ transportModes: nextProps.transportModes.concat([{ id: -1, mode_name: '', mode_code: '' }]) });
  }
  msg = key => formatMsg(this.props.intl, key)
  handleEdit = (id) => {
    const { transportModes } = this.state;
    const mode = transportModes.find(item => item.id === id);
    if (mode && mode.mode_name) {
      this.props.updateTransportMode(mode).then(() => {
        this.setState({ editId: -2 });
      });
    } else {
      message.error('名称不能为空');
    }
  }
  handleAdd = () => {
    const { transportModes } = this.state;
    const index = transportModes.length - 1;
    if (transportModes[index].mode_name) {
      this.props.addTransportMode({
        tenant_id: this.props.tenantId,
        mode_code: transportModes[index].mode_code,
        mode_name: transportModes[index].mode_name,
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
    this.props.removeTransportMode(record.id).then((result) => {
      if (result.error) {
        message.error(result.error.message, 10);
      }
    });
  }
  render() {
    const columns = [
      {
        title: '名称',
        dataIndex: 'mode_name',
        key: 'mode_name',
        render: (col, row) => {
          if (this.state.editId === row.id) {
            return (<Input value={col} onChange={(e) => {
              const transportModes = this.state.transportModes.map((item) => {
                if (item.id === row.id) {
                  return { ...item, mode_name: e.target.value };
                } else {
                  return item;
                }
              });
              this.setState({ transportModes });
            }}
            />);
          } else {
            return col;
          }
        },
      }, {
        title: '代码',
        dataIndex: 'mode_code',
        key: 'mode_code',
        render: (col, row) => {
          if (this.state.editId === row.id) {
            return (<Input value={col} onChange={(e) => {
              const transportModes = this.state.transportModes.map((item) => {
                if (item.id === row.id) {
                  return { ...item, mode_code: e.target.value };
                } else {
                  return item;
                }
              });
              this.setState({ transportModes });
            }}
            />);
          } else {
            return col;
          }
        },
      }, {
        title: '操作',
        dataIndex: 'OPS_COL',
        key: 'enabled',
        render: (_, row) => {
          if (row.mode_code !== PRESET_TRANSMODES.ftl && row.mode_code !== PRESET_TRANSMODES.exp &&
            row.mode_code !== PRESET_TRANSMODES.ltl && row.mode_code !== PRESET_TRANSMODES.ctn) {
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
              ><Icon type="plus" />
              </a>);
            } else {
              return (
                <span>
                  <a onClick={() => {
                    this.setState({ editId: row.id });
                  }}
                  ><Icon type="edit" />
                  </a>
                  <span className="ant-divider" />
                  <Popconfirm title="确认删除?" onConfirm={() => this.handleRemove(row)}>
                    <a role="presentation"><Icon type="delete" /></a>
                  </Popconfirm>
                </span>
              );
            }
          } else {
            return '';
          }
        },
      },
    ];
    return (
      <Layout>
        <Header className="page-header">
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
                  defaultSelectedKeys={['transportModes']}
                  mode="inline"
                >
                  <SubMenu key="bizdata" title={<span><Icon type="setting" /><span>业务数据</span></span>}>
                    <Menu.Item key="transportModes"><NavLink to="/transport/settings/transportModes">运输模式</NavLink></Menu.Item>
                    <Menu.Item key="paramVehicles"><NavLink to="/transport/settings/paramVehicles">车型车长</NavLink></Menu.Item>
                  </SubMenu>
                </Menu>
              </Sider>
              <Content className="nav-content">
                <DataTable columns={columns} dataSource={this.state.transportModes} rowKey="id" />
              </Content>
            </Layout>
          </div>
        </Content>
      </Layout>
    );
  }
}
