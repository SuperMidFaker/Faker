import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Modal, Button, Table, Select, message } from 'antd';
import { PARTNER_ROLES } from 'common/constants';
import { loadSubFlowProviders, addRepoUser, deleteRepoUser } from 'common/reducers/scofFlow';
import { loadPartners } from 'common/reducers/partner';
import RowAction from 'client/components/RowAction';
import { formatMsg } from '../message.i18n';

const { Option } = Select;

@injectIntl
@connect(
  state => ({
    visible: state.scofFlow.subFlowAuthModal.visible,
  }),
  {
    loadPartners, loadSubFlowProviders, addRepoUser, deleteRepoUser,
  }
)
export default class SubFlowAuthModal extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    flow_id: PropTypes.number.isRequired,
  }
  state = {
    providerList: [],
    vendorTenants: [],
    addOne: {},
  };
  componentDidMount() {
    this.props.loadPartners({ role: PARTNER_ROLES.SUP }).then((result) => {
      this.setState({
        vendorTenants: result.data.filter(item =>
          item.partner_tenant_id !== -1 && item.status === 1),
      });
    });
    this.props.loadSubFlowProviders(this.props.flow_id).then((result) => {
      if (!result.error) {
        this.setState({ providerList: result.data });
      }
    });
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.flow_id && nextProps.flow_id !== this.props.flow_id) {
      this.props.loadSubFlowProviders(nextProps.flow_id).then((result) => {
        if (!result.error) {
          this.setState({ providerList: result.data });
        }
      });
    }
  }
  msg = formatMsg(this.props.intl)
  handleAdd = () => {
    const addOne = {
      tenant_id: null,
    };
    const data = this.state.providerList;
    data.push(addOne);
    this.setState({ providerList: data, addOne });
  }
  handleSave = (record) => {
    this.props.addRepoUser(record.tenant_id).then((result) => {
      if (result.error) {
        message.error(result.error.message, 10);
      } else {
        message.info('保存成功', 5);
        this.props.loadSubFlowProviders(this.props.repo.id);
      }
    });
  }
  handleDelete = (subFlowId) => {
    this.props.deleteRepoUser(subFlowId).then((result) => {
      if (result.error) {
        message.error(result.error.message, 10);
      }
    });
  }
  handleTradeSel = (partnerTenantId) => {
    const addOne = { ...this.state.addOne };
    addOne.partnerTenantId = partnerTenantId;
    const broker = this.state.vendorTenants.find(tr => tr.partner_tenant_id === partnerTenantId);
    if (broker) {
      addOne.name = broker.name;
    }
    const providerList = [...this.state.providerList];
    providerList[providerList.length - 1] = addOne;
    this.setState({ providerList, addOne });
  }
  handleAddCancel = (index) => {
    const providerList = [...this.state.providerList];
    providerList.splice(index, 1);
    this.setState({ providerList });
  }
    columns = [{
      title: '授权提供方',
      dataIndex: 'tenant_id',
      render: (provider) => {
        if (!provider) {
          return (
            <Select value={provider} onChange={this.handleTradeSel} style={{ width: '100%' }}>
              {
                this.state.vendorTenants.map(opt =>
                  <Option value={opt.partner_tenant_id} key={opt.name}>{opt.name}</Option>)
              }
            </Select>
          );
        }
        return provider;
      },
    }, {
      width: 80,
      render: (o, record) =>
        <RowAction shape="circle" confirm="确定删除?" onConfirm={() => this.handleDelete(record.id)} icon="delete" />
      ,
    }];
    render() {
      const { providerList } = this.state;
      return (
        <Modal
          title="授权子流程业务提供方"
          visible={this.props.visible}
          maskClosable={false}
          footer={[]}
          onCancel={this.handleAuthAcOk}
        >
          <Table
            size="middle"
            pagination={false}
            columns={this.columns}
            dataSource={providerList}
            rowKey="id"
            footer={() => <Button type="dashed" onClick={this.handleAdd} icon="plus" style={{ width: '100%' }}>新增</Button>}
          />
        </Modal>
      );
    }
}

