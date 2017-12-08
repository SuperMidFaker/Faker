import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { intlShape, injectIntl } from 'react-intl';
import { Table, Button, Layout } from 'antd';
import moment from 'moment';
import { connect } from 'react-redux';
import connectFetch from 'client/common/decorators/connect-fetch';
import RowAction from 'client/components/RowAction';
import { loadBusinessUnits, deleteBusinessUnit, toggleBusinessUnitModal, toggleUnitRuleSetModal, loadBusinessUnitUsers } from 'common/reducers/cmsResources';
import { PrivilegeCover } from 'client/common/decorators/withPrivilege';
import TraderModal from '../modal/traderModal';
import TraderUserModal from '../modal/traderUserModal';
import { formatMsg } from '../../message.i18n';

const { Content } = Layout;

function fetchData({ dispatch, state }) {
  return dispatch(loadBusinessUnits({ tenantId: state.account.tenantId, customerPartnerId: state.cmsResources.customer.id }));
}

@connectFetch()(fetchData)
@injectIntl
@connect(state => ({
  loaded: state.cmsResources.loaded,
  businessUnits: state.cmsResources.businessUnits,
  tenantId: state.account.tenantId,
  customer: state.cmsResources.customer,
}), { loadBusinessUnits, deleteBusinessUnit, toggleBusinessUnitModal, toggleUnitRuleSetModal, loadBusinessUnitUsers })
export default class TraderList extends Component {
  static propTyps = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
    loaded: PropTypes.bool.isRequired,
    customer: PropTypes.object.isRequired,
    businessUnits: PropTypes.array.isRequired,
    loadBusinessUnits: PropTypes.func.isRequired,
    deleteBusinessUnit: PropTypes.func.isRequired,
    toggleBusinessUnitModal: PropTypes.func.isRequired,
  }
  state = {
    type: 'trade',
  }
  componentWillReceiveProps(nextProps) {
    if (!nextProps.loaded || this.props.customer !== nextProps.customer) {
      this.props.loadBusinessUnits({ tenantId: nextProps.tenantId, customerPartnerId: nextProps.customer.id });
    }
  }
  msg = formatMsg(this.props.intl)
  handleEditBtnClick = (businessUnit) => {
    this.props.toggleBusinessUnitModal(true, 'edit', businessUnit);
  }
  handleAddBtnClick = (type) => {
    this.props.toggleBusinessUnitModal(true, 'add', { relation_type: type });
  }
  handleRuleBtnClick = (record) => {
    this.props.toggleUnitRuleSetModal(true, record.id);
    this.props.loadBusinessUnitUsers(record.id);
  }
  handleDeleteBtnClick = (row) => {
    this.props.deleteBusinessUnit(row.id);
  }
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
    const columns = [{
      title: '企业名称',
      dataIndex: 'comp_name',
      key: 'comp_name',
    }, {
      title: '统一社会信用代码',
      dataIndex: 'comp_code',
      key: 'comp_code',
      width: 180,
    }, {
      title: '海关编码',
      dataIndex: 'customs_code',
      key: 'customs_code',
      width: 120,
    }, {
      title: '检验检疫代码',
      dataIndex: 'ciq_code',
      key: 'ciq_code',
      width: 120,
  /*
    }, {
      title: '注册海关',
      dataIndex: 'reg_customs',
      key: 'reg_customs',
      width: 120,
    }, {
      title: '经营类别',
      dataIndex: 'business_type',
      key: 'business_type',
      width: 120,
    }, {
      title: '信用等级',
      dataIndex: 'credit_level',
      key: 'credit_level', */
    }, {
      title: '创建日期',
      dataIndex: 'created_date',
      key: 'created_date',
      width: 120,
      render(o) {
        return moment(o).format('YYYY/MM/DD HH:mm');
      },
    }, {
      title: '创建人',
      dataIndex: 'creater_name',
      key: 'creater_name',
      width: 120,
    }, {
      title: '操作',
      width: 160,
      key: 'id',
      render: (_, record) => (
        <span>
          <PrivilegeCover module="corp" feature="partners" action="edit">
            <RowAction onClick={this.handleEditBtnClick} icon="edit" label={this.msg('modify')} row={record} />
          </PrivilegeCover>
          <PrivilegeCover module="corp" feature="partners" action="edit">
            <RowAction onClick={this.handleRuleBtnClick} icon="key" tooltip={this.msg('auth')} row={record} />
          </PrivilegeCover>
          <PrivilegeCover module="corp" feature="partners" action="delete">
            <RowAction confirm="确定要删除？" onConfirm={this.handleDeleteBtnClick} icon="delete" tooltip={this.msg('delete')} row={record} />
          </PrivilegeCover>
        </span>
        ),
    }];
    return (
      <Content>
        <div className="toolbar">
          <PrivilegeCover module="clearance" feature="resources" action="create">
            <Button type="primary" onClick={() => this.handleAddBtnClick(type)} icon="plus-circle-o">新增</Button>
          </PrivilegeCover>
        </div>
        <div className="panel-body table-panel table-fixed-layout">
          <Table dataSource={data} columns={columns} rowKey="id" />
        </div>
        <TraderModal />
        <TraderUserModal />
      </Content>

    );
  }
}
