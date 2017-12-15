import React from 'react';
import PropTypes from 'prop-types';
import { Modal, message, Select, Table, Button, Icon } from 'antd';
import { connect } from 'react-redux';
import { toggleUnitRuleSetModal, loadBusinessUnitUsers, loadBrokers, addTradeUser, deleteTradeUser } from 'common/reducers/cmsResources';
import { PARTNER_ROLES, PARTNER_BUSINESSE_TYPES } from 'common/constants';

const Option = Select.Option;

@connect(state => ({
  tenantId: state.account.tenantId,
  visible: state.cmsResources.unitRuleSetModal.visible,
  relationId: state.cmsResources.unitRuleSetModal.relationId,
  businessUnitUsers: state.cmsResources.businessUnitUsers,
}), {
  toggleUnitRuleSetModal, loadBusinessUnitUsers, loadBrokers, addTradeUser, deleteTradeUser,
})

export default class TraderUserModal extends React.Component {
  static propTypes = {
    tenantId: PropTypes.number.isRequired,
    visible: PropTypes.bool.isRequired,
    relationId: PropTypes.number,
    businessUnitUsers: PropTypes.array.isRequired,
  }

  state = {
    datas: [],
    brokers: [],
  }
  componentDidMount() {
    this.props.loadBrokers({
      tenantId: this.props.tenantId,
      role: PARTNER_ROLES.SUP,
      businessType: PARTNER_BUSINESSE_TYPES.clearance,
    }).then((result) => {
      if (result.data && result.data.length > 0) {
        this.setState({ brokers: result.data.filter(item => item.partner_tenant_id !== -1 && item.status === 1) });
      }
    });
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.businessUnitUsers !== this.props.businessUnitUsers) {
      this.setState({
        datas: nextProps.businessUnitUsers,
      });
    }
  }
  handleCancel = () => {
    this.props.toggleUnitRuleSetModal(false);
  }
  handleTradeSel = (record, value) => {
    record.tenant_id = value; // eslint-disable-line no-param-reassign
    const rels = this.state.brokers.find(tr => tr.partner_tenant_id === value);
    if (rels) {
      record.tenant_name = rels.name; // eslint-disable-line no-param-reassign
    }
    this.forceUpdate();
  }
  editDone = (index) => {
    const datas = [...this.state.datas];
    datas.splice(index, 1);
    this.setState({ datas });
  }
  handleAdd = () => {
    const addOne = {
      relation_id: this.props.relationId,
      tenant_id: null,
      tenant_name: '',
    };
    const data = this.state.datas;
    data.push(addOne);
    this.setState({ datas: data });
  }
  handleSave = (record) => {
    this.props.addTradeUser(record).then((result) => {
      if (result.error) {
        message.error(result.error.message, 10);
      } else {
        message.info('保存成功', 5);
        this.props.loadBusinessUnitUsers(this.props.relationId);
      }
    });
  }
  handleDelete = (record, index) => {
    this.props.deleteTradeUser(record.id).then((result) => {
      if (result.error) {
        message.error(result.error.message, 10);
      } else {
        const datas = [...this.state.datas];
        datas.splice(index, 1);
        this.setState({ datas });
      }
    });
  }
  render() {
    const { brokers, datas } = this.state;
    const { visible } = this.props;
    let newBrokers = brokers;
    for (let i = 0; i < datas.length; i++) {
      const data = datas[i];
      newBrokers = newBrokers.filter(ct => ct.partner_tenant_id !== data.tenant_id);
    }
    const columns = [{
      dataIndex: 'tenant_name',
      render: (o, record) => {
        if (!record.id) {
          return (
            <Select onChange={value => this.handleTradeSel(record, value)} style={{ width: '100%' }}>
              {
                newBrokers.map(opt => <Option value={opt.partner_tenant_id} key={opt.name}>{opt.name}</Option>)
              }
            </Select>
          );
        } else {
          return record.tenant_name;
        }
      },
    }, {
      width: 70,
      render: (o, record, index) => {
        if (record.tenant_id === this.props.tenantId) {
          return '';
        } else {
          return (
            <div className="editable-row-operations">{
              (record.id) ?
                <span>
                  <a onClick={() => this.handleDelete(record, index)}><Icon type="delete" /></a>
                </span>
              :
                <span>
                  <a onClick={() => this.handleSave(record)}><Icon type="save" /></a>
                  <span className="ant-divider" />
                  <a onClick={() => this.editDone(index)}><Icon type="close" /></a>
                </span>
              }
            </div>);
        }
      },
    }];
    return (
      <Modal maskClosable={false} title="授权使用单位" visible={visible} onCancel={this.handleCancel} footer={null} >
        <Table size="middle" showHeader={false} pagination={false} columns={columns} dataSource={this.state.datas}
          footer={() => <Button type="dashed" onClick={this.handleAdd} icon="plus" style={{ width: '100%' }} />}
        />
      </Modal>
    );
  }
}
