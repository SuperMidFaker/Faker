import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Modal, Card, Form, Input } from 'antd';
import DataTable from 'client/components/DataTable';
import { validatePhone } from 'common/validater';
const FormItem = Form.Item;

export default class NodeUserList extends Component {
  state = {
    visible: false,
    ModalTitle: '添加联系人',
    nameInput: {
      value: '',
      validateStatus: '',
      help: '',
    },
    phoneInput: {
      value: '',
      validateStatus: '',
      help: '',
    },
    mode: '',
    nodeUser: {},
    update: 0,
  }
  showModal = (nodeUser) => {
    if (nodeUser) {
      this.setState({
        visible: true,
        ModalTitle: `修改${nodeUser.name}`,
        nameInput: {
          value: nodeUser.name,
        },
        phoneInput: {
          value: nodeUser.phone,
        },
        mode: 'edit',
        nodeUser,
      });
    } else {
      this.setState({
        visible: true,
        ModalTitle: '添加联系人',
        nameInput: {
          value: '',
        },
        phoneInput: {
          value: '',
        },
        mode: 'add',
        nodeUser: {},
      });
    }
  }
  handleOk = () => {
    const nodeUserInfo = {
      name: this.state.nameInput.value,
      phone: this.state.phoneInput.value,
    };
    validatePhone(nodeUserInfo.phone, (err) => {
      if (err) {
        this.setState({
          phoneInput: {
            validateStatus: 'error',
            help: '电话号码不正确',
          },
        });
      } else if (this.state.mode === 'add') {
        const { node, tenantId } = this.props;
        this.props.addNodeUser(node.node_id, { ...nodeUserInfo, tenant_id: tenantId }).then(() => {
          this.setState({
            visible: false,
          });
        });
      } else if (this.state.mode === 'edit') {
        this.props.eitNodeUser(this.state.nodeUser.id, nodeUserInfo).then(() => {
          this.setState({
            visible: false,
          });
        });
      }
    }, (messages, m) => m);
  }
  handleCancel = () => {
    this.setState({
      visible: false,
    });
  }
  handleNameInputChange = (e) => {
    this.setState({
      nameInput: {
        value: e.target.value,
      },
    });
  }
  handlePhoneInputChange = (e) => {
    this.setState({
      phoneInput: {
        value: e.target.value,
      },
    });
  }
  handleUpdateUserStatus = (loginId, disabled) => {
    this.props.updateUserStatus(loginId, disabled).then(() => {
      this.setState({
        update: this.state.update + 1,
      });
    });
  }
  renderColumnText(status, text) {
    let style = {};
    if (status === 1) {
      style = { color: '#CCC' };
    }
    return <span style={style}>{text}</span>;
  }
  render() {
    const { nodeUsers } = this.props;
    const columns = [{
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
      render: (o, record) => this.renderColumnText(record.disabled, o),
    }, {
      title: '电话',
      dataIndex: 'phone',
      key: 'phone',
      render: (o, record) => this.renderColumnText(record.disabled, o),
    }, {
      title: '操作',
      dataIndex: 'OPS_COL',
      key: 'disabled',
      render: (text, record) => {
        if (text === 0) {
          return (
            <span>
              <a onClick={() => this.showModal(record)}>修改</a>
              <span className="ant-divider" />
              <a onClick={() => { this.props.removeNodeUser(record.id, record.login_id); }}>删除</a>
              <span className="ant-divider" />
              <a onClick={() => { this.handleUpdateUserStatus(record.login_id, 1); }}>
                停用
              </a>
            </span>
          );
        } else {
          return (
            <span>
              <a onClick={() => this.showModal(record)}>修改</a>
              <span className="ant-divider" />
              <a onClick={() => { this.props.removeNodeUser(record.id, record.login_id); }}>删除</a>
              <span className="ant-divider" />
              <a onClick={() => { this.handleUpdateUserStatus(record.login_id, 0); }}>
                启用
              </a>
            </span>
          );
        }
      },
    }];
    return (
      <Card title="联系人" extra={<a onClick={() => this.showModal()}>添加</a>} style={{ margin: '0 24px 24px 12px' }}>
        <DataTable columns={columns} dataSource={nodeUsers} rowKey="id" pagination={false} />
        <Modal maskClosable={false} title="联系人"
          visible={this.state.visible}
          onOk={this.handleOk}
          confirmLoading={this.state.confirmLoading}
          onCancel={this.handleCancel}
        >
          <Form layout="horizontal">
            <FormItem
              label="姓名"
              labelCol={{ span: 5 }}
              wrapperCol={{ span: 12 }}
              placeholder="请输入姓名"
              validateStatus={this.state.nameInput.validateStatus}
              help={this.state.nameInput.help}
              required
            >
              <Input value={this.state.nameInput.value} id="error" onChange={this.handleNameInputChange} />
            </FormItem>
            <FormItem
              label="手机号"
              labelCol={{ span: 5 }}
              wrapperCol={{ span: 12 }}
              placeholder="请输入手机号"
              validateStatus={this.state.phoneInput.validateStatus}
              help={this.state.phoneInput.help}
              required
            >
              <Input value={this.state.phoneInput.value} id="error" onChange={this.handlePhoneInputChange} disabled={this.state.mode === 'edit'} />
            </FormItem>
          </Form>
        </Modal>
      </Card>
    );
  }
}

NodeUserList.propTypes = {
  node: PropTypes.object.isRequired,
  nodeUsers: PropTypes.array.isRequired,
  addNodeUser: PropTypes.func.isRequired,
  eitNodeUser: PropTypes.func.isRequired,
  removeNodeUser: PropTypes.func.isRequired,
  updateUserStatus: PropTypes.func.isRequired,
  tenantId: PropTypes.number.isRequired,
};
