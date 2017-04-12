import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import connectNav from 'client/common/decorators/connect-nav';
import { Breadcrumb, Layout, Menu, Icon, Table, Popconfirm, Input, message } from 'antd';
import { format } from 'client/common/i18n/helpers';
import NavLink from 'client/components/nav-link';
import messages from './message.i18n';
import { loadParamVehicles, removeParamVehicle, addParamVehicle, updateParamVehicle } from 'common/reducers/transportSettings';
import withPrivilege from 'client/common/decorators/withPrivilege';
import connectFetch from 'client/common/decorators/connect-fetch';

const formatMsg = format(messages);
const { Header, Content, Sider } = Layout;
const SubMenu = Menu.SubMenu;

function fetchData({ dispatch, state }) {
  return dispatch(loadParamVehicles(state.account.tenantId));
}

@connectFetch()(fetchData)
@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    paramVehicles: state.transportSettings.paramVehicles,
  }),
  { loadParamVehicles, removeParamVehicle, addParamVehicle, updateParamVehicle }
)
@connectNav({
  depth: 2,
  moduleName: 'transport',
})
@withPrivilege({ module: 'transport', feature: 'setting', action: 'edit' })
export default class ParamVehicles extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
    paramVehicles: PropTypes.array.isRequired,
    loadParamVehicles: PropTypes.func.isRequired,
    removeParamVehicle: PropTypes.func.isRequired,
    addParamVehicle: PropTypes.func.isRequired,
    updateParamVehicle: PropTypes.func.isRequired,
  }
  state = {
    editIndex: -1,
    paramVehicles: [],
  }
  componentWillReceiveProps(nextProps) {
    this.setState({ paramVehicles: nextProps.paramVehicles.concat([{ id: -1, text: '', value: '', kind: 0 }]) });
  }
  msg = key => formatMsg(this.props.intl, key)
  handleEdit = (id) => {
    const { paramVehicles } = this.state;
    const vehicle = paramVehicles.find(item => item.id === id);
    if (vehicle && vehicle.text) {
      this.props.updateParamVehicle(vehicle).then(() => {
        this.setState({ editIndex: -1 });
      });
    } else {
      message.error('名称不能为空');
    }
  }
  handleAdd = () => {
    const { editIndex, paramVehicles } = this.state;
    if (paramVehicles[editIndex].text) {
      this.props.addParamVehicle({
        tenant_id: this.props.tenantId,
        value: paramVehicles[editIndex].value,
        text: paramVehicles[editIndex].text,
        kind: paramVehicles[editIndex].kind,
      }).then((result) => {
        if (result.error) {
          message.error(result.error.message, 10);
        } else {
          this.setState({ editIndex: -1 });
        }
      });
    } else {
      message.error('名称不能为空');
    }
  }
  handleRemove = (record) => {
    this.props.removeParamVehicle(record.id).then((result) => {
      if (result.error) {
        message.error(result.error.message, 10);
      }
    });
  }
  render() {
    const columns = [
      {
        title: '名称',
        dataIndex: 'text',
        key: 'text',
        render: (col, row, index) => {
          if (this.state.editIndex === index) {
            return (<Input value={col} onChange={(e) => {
              const { paramVehicles } = this.state;
              paramVehicles[index].text = e.target.value;
              this.setState({ paramVehicles });
            }}
            />);
          } else {
            return col;
          }
        },
      }, {
        title: '代码',
        dataIndex: 'value',
        key: 'value',
        render: (col, row, index) => {
          if (this.state.editIndex === index) {
            return (<Input value={col} onChange={(e) => {
              const { paramVehicles } = this.state;
              paramVehicles[index].value = e.target.value;
              this.setState({ paramVehicles });
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
        render: (_, record, index) => {
          if (this.state.editIndex === index) {
            if (record.id === -1) {
              return (<a onClick={this.handleAdd}><Icon type="save" /></a>);
            } else {
              return (<a onClick={() => this.handleEdit(record.id)}><Icon type="save" /></a>);
            }
          } else if (record.id === -1) {
            return (<a onClick={() => {
              this.setState({ editIndex: index });
            }}
            ><Icon type="plus" /></a>);
          } else {
            return (
              <span>
                <a onClick={() => {
                  this.setState({ editIndex: index });
                }}
                ><Icon type="edit" /></a>
                <span className="ant-divider" />
                <Popconfirm title="确认删除该分类?" onConfirm={() => this.handleRemove(record)}>
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
                  defaultSelectedKeys={['paramVehicles']}
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
                <Table columns={columns} dataSource={this.state.paramVehicles} rowKey="id" />
              </Content>
            </Layout>
          </div>
        </Content>
      </Layout>
    );
  }
}
