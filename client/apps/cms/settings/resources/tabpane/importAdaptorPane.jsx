import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Table, Button, Layout, Popconfirm } from 'antd';
import { connect } from 'react-redux';
// import { loadAdaptors, delAdaptors } from 'common/reducers/saasLineFileAdaptor';
import { PrivilegeCover } from 'client/common/decorators/withPrivilege';
import { LINE_FILE_ADAPTOR_MODELS } from 'common/constants';

const { Content } = Layout;

@connect(state => ({
  businessUnits: state.saasLineFileAdaptor.businessUnits,
  customer: state.cmsResources.customer,
})/* , { loadAdaptors, delAdaptors }*/)
export default class ImportAdaptorPane extends Component {
  static propTyps = {
    customer: PropTypes.object.isRequired,
    businessUnits: PropTypes.array.isRequired,
  }
  state = {
  }
  componentWillReceiveProps(nextProps) {
    if (!nextProps.loaded || this.props.customer !== nextProps.customer) {
      this.props.loadBusinessUnits({ tenantId: nextProps.tenantId, customerPartnerId: nextProps.customer.id });
    }
  }
  handleEditBtnClick = (businessUnit) => {
    this.props.toggleBusinessUnitModal(true, 'edit', businessUnit);
  }
  handleAddBtnClick = (type) => {
    this.props.toggleBusinessUnitModal(true, 'add', { relation_type: type });
  }
  handleDeleteBtnClick = (id) => {
    this.props.deleteBusinessUnit(id);
  }
  handleRuleBtnClick = (record) => {
    this.props.toggleUnitRuleSetModal(true, record.id);
    this.props.loadBusinessUnitUsers(record.id);
  }
  adaptorColumns = [{
    title: '名称',
    dataIndex: 'name',
    width: 200,
  }, {
    title: '业务对象',
    dataIndex: 'biz_model',
    width: 180,
    render: model => model && LINE_FILE_ADAPTOR_MODELS[model].name,
  }, {
    title: '操作',
    width: 120,
    key: 'id',
    render: (_, record) => (
      <span>
        {record.example_file ? <PrivilegeCover module="corp" feature="partners" action="edit">
          <a onClick={() => this.handleEditBtnClick(record)}>修改</a>
        </PrivilegeCover> : <span />}
        <span className="ant-divider" />
        <PrivilegeCover module="corp" feature="partners" action="delete">
          <Popconfirm title="确定要删除吗？" onConfirm={() => this.props.deleteBusinessUnit(record.id)}>
            <a>删除</a>
          </Popconfirm>
        </PrivilegeCover>
      </span>
        ),
  }];
  render() {
    const { businessUnits } = this.props;
    const { type } = this.state;
    const data = businessUnits.filter(item => item.relation_type === type).filter((item) => {
      if (this.state.searchText) {
        const reg = new RegExp(this.state.searchText);
        return reg.test(item.comp_name) || reg.test(item.comp_code) || reg.test(item.receive_code);
      } else {
        return true;
      }
    });
    return (
      <Content>
        <div className="toolbar">
          <PrivilegeCover module="clearance" feature="resources" action="create">
            <Button type="primary" onClick={() => this.handleAddBtnClick(type)} icon="plus-circle-o">新增</Button>
          </PrivilegeCover>
        </div>
        <div className="panel-body table-panel table-fixed-layout">
          <Table dataSource={data} columns={this.adaptorColumns} rowKey="code" />
        </div>
      </Content>

    );
  }
}
