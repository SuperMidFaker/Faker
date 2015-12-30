import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { loadPersonnels, hideModal, showModal, beginEditPersonnel, delPersonnel,
  editPersonnel, changeThisPersonnel, submitPersonnel } from '../../../../universal/redux/reducers/personnel';
import { isLoaded } from '../../../../reusable/common/redux-actions';
import {Table, Button, AntIcon} from '../../../../reusable/ant-ui';
import PersonnelSetter from '../../../components/personnel-setter';
import connectFetch from '../../../../reusable/decorators/connect-fetch';

function fetchData({state, dispatch, cookie}) {
  if (!isLoaded(state, 'personnel')) {
    return dispatch(loadPersonnels(cookie));
  }
}
@connectFetch()(fetchData)
@connect(
  state => ({
    corpId: state.account.corpId,
    parentCorpId: state.account.tenantId,
    personnel: state.personnel.personnel,
    thisPersonnel: state.personnel.thisPersonnel,
    selectIndex: state.personnel.selectIndex,
    loading: state.personnel.loading,
    needUpdate: state.personnel.needUpdate,
    modalVisible: state.personnel.visible
  }),
  { hideModal, showModal, beginEditPersonnel, delPersonnel, editPersonnel,
    changeThisPersonnel, submitPersonnel, loadPersonnels })
export default class PersonnelSetting extends React.Component {
  static propTypes = {
    selectIndex: PropTypes.number,
    needUpdate: PropTypes.bool.isRequired,
    loading: PropTypes.bool.isRequired,
    personnel: PropTypes.object.isRequired,
    thisPersonnel: PropTypes.object.isRequired,
    modalVisible: PropTypes.bool.isRequired,
    corpId: PropTypes.number.isRequired,
    parentCorpId: PropTypes.number.isRequired,
    location: PropTypes.object.isRequired,
    changeThisPersonnel: PropTypes.func.isRequired,
    loadPersonnels: PropTypes.func.isRequired,
    submitPersonnel: PropTypes.func.isRequired,
    beginEditPersonnel: PropTypes.func.isRequired,
    delPersonnel: PropTypes.func.isRequired,
    editPersonnel: PropTypes.func.isRequired,
    hideModal: PropTypes.func.isRequired,
    showModal: PropTypes.func.isRequired
  }
  handlePersonnelReg() {
    this.refs.personnelform.reset();
    this.props.showModal();
  }
  handlePersonnelEdit(idx) {
    this.refs.personnelform.reset();
    this.props.beginEditPersonnel(idx);
  }
  handlePersonnelDel(record) {
    this.props.delPersonnel(record.key, record.accountId);
  }
  handlePersonnelSubmit() {
    const personnel = { ...this.props.thisPersonnel, corpId: this.props.corpId, parentCorpId: this.props.parentCorpId };
    if (this.props.thisPersonnel.key) {
      this.props.editPersonnel(personnel, this.props.selectIndex);
    } else {
      this.props.submitPersonnel(personnel);
    }
  }
  render() {
    const { personnel, thisPersonnel, loading, needUpdate } = this.props;
    const dataSource = new Table.DataSource({
      fetcher: (params) => this.props.loadPersonnels(null, params),
      resolve: (result) => result.data,
      needUpdate,
      getPagination: (result) => ({
        total: result.totalCount,
        // 删除完一页时返回上一页
        current: result.totalCount !== 0 &&
          result.current > Math.ceil(result.totalCount / result.pageSize) ?
          Math.ceil(result.totalCount / result.pageSize) : result.current,
        showSizeChanger: true,
        showQuickJumper: false,
        pageSize: result.pageSize
      }),
      getParams: (pagination, filters, sorter) => {
        const params = {
          pageSize: pagination.pageSize,
          currentPage: pagination.current,
          sortField: sorter.field,
          sortOrder: sorter.order
        };
        for (const key in filters) {
          if (filters[key]) {
            params[key] = filters[key];
          }
        }
        return params;
      }
    });
    // 通过 rowSelection 对象表明需要行选择
    const rowSelection = {
      onSelect: (/* record, selected, selectedRows */) => {
      },
      onSelectAll: (/* selected, selectedRows */) => {
      }
    };
    const columns = [{
      title: '姓名',
      dataIndex: 'name'
    }, {
      title: '手机',
      dataIndex: 'phone'
    }, {
      title: '部门',
      dataIndex: 'department'
    }, {
      title: '职位',
      dataIndex: 'position'
    }, {
      title: '操作',
      dataIndex: '',
      width: 150,
      render: (text, record, index) => {
        return (<span>
          <Button shape="circle" type="primary" title="编辑" onClick={() => this.handlePersonnelEdit(index)} size="small"><AntIcon type="edit" /></Button>
          <span className="ant-divider"></span>
          <Button shape="circle" type="primary" title="删除" onClick={() => this.handlePersonnelDel(record)} size="small"><AntIcon type="cross" /></Button>
          <span className="ant-divider"></span>
          <a href="#" className="ant-dropdown-link">
          更多 <AntIcon type="down" />
          </a>
        </span>);
      }
    }];
    return (
      <div className="page-panel">
        <div className={ (!this.props.modalVisible ? 'form-fade-enter' : 'form-fade-leave') }>
          <div className="page-header">
              <Button type="primary" onClick={ () => this.handlePersonnelReg() }>注册员工</Button>
          </div>
          <div className="page-body">
            <Table rowSelection={rowSelection} columns={columns} loading={loading} remoteData={personnel} dataSource={dataSource}/>
          </div>
        </div>
        { thisPersonnel &&
        <div className={ this.props.modalVisible ? 'form-fade-enter' : 'form-fade-leave' }>
          <PersonnelSetter ref="personnelform" thisPersonnel={ this.props.thisPersonnel } changeThisPersonnel={ this.props.changeThisPersonnel }
            handleModalHide={ this.props.hideModal } handlePersonnelSubmit={ ::this.handlePersonnelSubmit } />
        </div>
        }
      </div>
    );
  }
}
