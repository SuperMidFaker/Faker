import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Table, Button, Layout, Popconfirm } from 'antd';
import moment from 'moment';
import { connect } from 'react-redux';
import connectFetch from 'client/common/decorators/connect-fetch';
import { loadBusinessUnits, deleteBusinessUnit, toggleBusinessUnitModal } from 'common/reducers/cmsResources';
import { PrivilegeCover } from 'client/common/decorators/withPrivilege';
import TraderModal from '../modal/traderModal';

const { Content } = Layout;

function fetchData({ dispatch, state, cookie }) {
  return dispatch(loadBusinessUnits(cookie, state.account.tenantId));
}

@connectFetch()(fetchData)
@connect(state => ({
  loaded: state.cmsResources.loaded,
  businessUnits: state.cmsResources.businessUnits,
  tenantId: state.account.tenantId,
}), { loadBusinessUnits, deleteBusinessUnit, toggleBusinessUnitModal })
export default class TraderList extends Component {
  static propTyps = {
    tenantId: PropTypes.number.isRequired,
    loaded: PropTypes.bool.isRequired,
    businessUnits: PropTypes.array.isRequired,
    loadBusinessUnits: PropTypes.func.isRequired,
    deleteBusinessUnit: PropTypes.func.isRequired,
    toggleBusinessUnitModal: PropTypes.func.isRequired,
  }
  state = {
    type: 'trade',
    searchText: '',
  }
  componentWillReceiveProps(nextProps) {
    if (!nextProps.loaded) {
      this.props.loadBusinessUnits(null, nextProps.tenantId);
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
  handleSearch = (value) => {
    this.setState({ searchText: value });
  }
  render() {
    const { businessUnits, onAddBtnClicked } = this.props;
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
      width: 300,
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
      key: 'credit_level',
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
      dataIndex: 'created_by',
      key: 'created_by',
      width: 120,
    }, {
      title: '操作',
      dataIndex: 'id',
      width: 80,
      key: 'id',
      render: (_, record) => (
        <span>
          <PrivilegeCover module="corp" feature="partners" action="edit">
            <a onClick={() => this.props.onEditBtnClick(record)}>修改</a>
          </PrivilegeCover>
          <span className="ant-divider" />
          <PrivilegeCover module="corp" feature="partners" action="delete">
            <Popconfirm title="确定要删除吗？" onConfirm={() => this.props.onDeleteBtnClick(record.id)}>
              <a>删除</a>
            </Popconfirm>
          </PrivilegeCover>
        </span>
        ),
    }];
    return (
      <Content>
        <div className="toolbar">
          <PrivilegeCover module="clearance" feature="resources" action="create">
            <Button type="primary" onClick={() => onAddBtnClicked(type)} icon="plus-circle-o">新增</Button>
          </PrivilegeCover>
        </div>
        <div className="panel-body table-panel">
          <Table dataSource={data} columns={columns} rowKey="id" />
        </div>
        <TraderModal />
      </Content>

    );
  }
}
