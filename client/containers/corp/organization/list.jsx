import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { loadCorps, hideModal, showModal, beginEditCorp, delCorp, editCorp,
  changeThisCorpValue, uploadCorpPics, submitCorp } from '../../../../universal/redux/reducers/corps';
import {Table, Button, AntIcon, message} from '../../../../reusable/ant-ui';
import { isLoaded } from '../../../../reusable/common/redux-actions';
import CorpSetter from '../../../components/corp-setter';
import connectFetch from '../../../../reusable/decorators/connect-fetch';
import { corpStatusDesc, ADMIN } from '../../../../universal/constants';

function fetchData({state, dispatch, cookie}) {
  if (!isLoaded(state, 'corps') ) {
    return dispatch(loadCorps(cookie));
  }
}
@connectFetch()(fetchData)
@connect(
  state => ({
    corplist: state.corps.corps,
    thisCorp: state.corps.thisCorp,
    selectIndex: state.corps.selectIndex,
    needUpdate: state.corps.needUpdate,
    loading: state.corps.loading,
    userType: state.account.userType,
    modalVisible: state.corps.visible
  }),
  { hideModal, showModal, beginEditCorp, loadCorps, delCorp, editCorp, changeThisCorpValue,
    uploadCorpPics, submitCorp }
)
export default class CorpList extends React.Component {
  static propTypes = {
    corplist: PropTypes.object.isRequired,
    thisCorp: PropTypes.object,
    modalVisible: PropTypes.bool,
    selectIndex: PropTypes.number,
    needUpdate: PropTypes.bool.isRequired,
    loading: PropTypes.bool.isRequired,
    userType: PropTypes.bool.isRequired,
    changeThisCorpValue: PropTypes.func.isRequired,
    uploadCorpPics: PropTypes.func.isRequired,
    submitCorp: PropTypes.func.isRequired,
    beginEditCorp: PropTypes.func.isRequired,
    loadCorps: PropTypes.func.isRequired,
    delCorp: PropTypes.func.isRequired,
    editCorp: PropTypes.func.isRequired,
    hideModal: PropTypes.func.isRequired,
    showModal: PropTypes.func.isRequired
  }
  handleCorpReg() {
    this.refs.corpform.reset();
    this.props.showModal();
  }
  handleCorpBeginEdit(index) {
    const form = this.refs.corpform;
    form.reset();
    this.props.beginEditCorp(index);
  }
  handleCorpDel(key) {
    this.props.delCorp(key);
  }
  handleCorpSubmit() {
    const {thisCorp, selectIndex} = this.props;
    if (thisCorp.key) {
      this.props.editCorp(thisCorp, selectIndex);
    } else {
      this.props.submitCorp(thisCorp);
    }
  }
  render() {
    const { corplist, thisCorp, userType, loading, needUpdate } = this.props;
    const dataSource = new Table.DataSource({
      fetcher: (params) => this.props.loadCorps(null, params),
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
      title: '名称',
      dataIndex: 'name'
    }, {
      title: '移动电话',
      dataIndex: 'mobile'
    }, {
      title: '企业代号',
      dataIndex: 'code'
    }, {
      title: '状态',
      dataIndex: 'status',
      render: (o, record) => {
        return <span>{corpStatusDesc[record.status]}</span>;
      }
    }, {
      title: '操作',
      dataIndex: '',
      width: 150,
      render: (text, record, index) => {
        return (<span>
          <Button shape="circle" type="primary" title="编辑" onClick={() => this.handleCorpBeginEdit(index)} size="small"><AntIcon type="edit" /></Button>
          <span className="ant-divider"></span>
          <Button shape="circle" type="primary" title="删除" onClick={() => this.handleCorpDel(record.key)} size="small"><AntIcon type="cross" /></Button>
          <span className="ant-divider"></span>
          <a href="#" className="ant-dropdown-link">
          更多 <AntIcon type="down" />
          </a>
        </span>);
      }
    }];
    return (
      <div className="page-panel">
        <div className={ (!this.props.modalVisible ? ' form-fade-enter' : ' form-fade-leave') }>
          <div className="page-header">
            <Button type="primary" onClick={() => this.handleCorpReg()}><AntIcon type="plus" /><span>{ userType === ADMIN ? '注册企业' : '注册分公司' }</span></Button>
          </div>
          <div className="page-body">
            <Table rowSelection={rowSelection} columns={columns} loading={loading} remoteData={corplist} dataSource={dataSource}/>
          </div>
        </div>
        { thisCorp &&
        <div className={ this.props.modalVisible ? 'form-fade-enter' : 'form-fade-leave' }>
          <CorpSetter ref="corpform" thisCorp={ this.props.thisCorp } changeThisCorpValue={ this.props.changeThisCorpValue }
            uploadCorpPics={ this.props.uploadCorpPics } handleModalHide={ this.props.hideModal }
            handleCorpSubmit={ ::this.handleCorpSubmit } adminView={userType === ADMIN}/>
        </div>
        }
      </div>
    );
  }
}
