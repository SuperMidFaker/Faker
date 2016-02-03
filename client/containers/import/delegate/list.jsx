import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { submitDelegate, loadDelegates, updateId, delId, beginEdit, edit, cancelEdit, loadStatus, loadCustomsBrokers } from '../../../../universal/redux/reducers/importdelegate';
import { isLoaded } from '../../../../reusable/common/redux-actions';
import connectFetch from '../../../../reusable/decorators/connect-fetch';
import SearchBar from '../../../../reusable/components/search-bar';
import cx from '../../../../reusable/browser-util/classname-join';
import { toNumber } from '../../../../reusable/common/transformer';
import {Table, Button, AntIcon, Form, Input, Radio, Row, Col, Datepicker, Select, message} from '../../../../reusable/ant-ui';
import showWarningModal from '../../../../reusable/components/deletion-warning-modal';
const FormItem = Form.Item;
const Option = Select.Option;
const RadioGroup = Radio.Group;
const InputGroup = Input.Group;

function fetchData({ state, dispatch, cookie }) {
  const promises = [];
  if (!isLoaded(state, 'importdelegate'))
  {
   let p = dispatch(loadDelegates(cookie, {
    tenantId: state.account.tenantId,
    pageSize: state.importdelegate.idlist.pageSize,
    currentPage: state.importdelegate.idlist.current
  }));
   promises.push(p);

   p = dispatch(loadStatus(cookie, {
    tenantId: state.account.tenantId
  }));
   promises.push(p);
  p=dispatch(loadCustomsBrokers(cookie, state.account.tenantId));
   promises.push(p);
 }
 return Promise.all(promises);
}

@connectFetch()(fetchData)
@connect(
  state => ({//从初始化state中加载数据
    tenantId: state.account.tenantId,
    idlist: state.importdelegate.idlist,
    statusList: state.importdelegate.statusList,
    customsBrokerList: state.importdelegate.customsBrokerList,
    needUpdate: state.importdelegate.needUpdate,
    formData: state.importdelegate.formData,
    loading: state.importdelegate.loading
  }),
  { updateId, delId, loadDelegates, submitDelegate, beginEdit, edit, cancelEdit, loadStatus }
  )
@Form.formify({
  mapPropsToFields: (props) => (props.formData),
  onFieldsChange: (props, fields) => {
    if (Object.keys(fields).length === 1) {
      const key = Object.keys(fields)[0];
      props.edit(key, fields[key].value);
    }
  },
  formPropName: 'formhoc'
})
export default class ImportDelegate extends React.Component {
  static propTypes = {//属性检测
    formhoc: PropTypes.object.isRequired,
    idlist: PropTypes.object.isRequired,
    statusList:PropTypes.object.isRequired,
    customsBrokerList: PropTypes.object.isRequired,
    formData: PropTypes.object.isRequired,
    loading: PropTypes.bool.isRequired,
    updateId: PropTypes.func.isRequired,
    delId: PropTypes.func.isRequired,
    beginEdit: PropTypes.func.isRequired,
    edit: PropTypes.func.isRequired,
    cancelEdit: PropTypes.func.isRequired,
    loadDelegates: PropTypes.func.isRequired,
    loadStatus: PropTypes.func.isRequired,
    submitDelegate: PropTypes.func.isRequired,
    needUpdate: PropTypes.bool,
    tenantId: PropTypes.number.isRequired
  }
  constructor(props) {
    super(props);
    this.state = {//设置默认视图状态
      showForm: false,
      statusAll:'ghost',
      statusNotSend:'primary',
      statusNotAccept:'ghost',
      statusAccept:'ghost',
      statusInvalid:'ghost',
      currentStatus:0,
      searchVal:''
    };
  }
  handleIdReg() {
    this.setState({ showForm: true });
  }
  handleSubmit(ev) {
    ev.preventDefault();
    this.props.formhoc.validate((errors) => {
      if (errors) {
        this.forceUpdate();
        return;
      }
      if (this.props.formData.key) {
        this.props.updateId(this.props.formData).then((result) => {
          if (result.error) {
            message.error(result.error.message, 10);
          } else {
            this.setState({
              showForm: false
            });
          }
        });
      } else {
        this.props.submitDelegate(this.props.formData, this.props.tenantId).then(
          (result) => {
            if (result.error) {
              message.error(result.error.message, 10);
            } else {
              this.setState({
                showForm: false
              });
            }
          });
      }
    });
  }
  handleSubmitCancel(ev) {
    ev.preventDefault();
    this.props.formhoc.reset();
    this.props.cancelEdit();
    this.setState({
      showForm: false
    });
  }
  handleIdEdit(importdelegate, index) {
    this.props.beginEdit(importdelegate, index);
    this.setState({
      showForm: true
    });
  }
  handleIdRemove(idKey) {//删除
   showWarningModal({
    title: '请输入DELETE进行下一步操作',
    content: '删除的数据将无法找回',
    onOk: () => this.props.delId(idKey),
    confirmString: 'DELETE'
  });
 }
 handleChangeStatus(type, status) {
    //更新视图状态
    this.setState({
      statusAll:"statusAll" === type?'primary':'ghost',
      statusNotSend:"statusNotSend" === type?'primary':'ghost',
      statusNotAccept:"statusNotAccept" === type?'primary':'ghost',
      statusAccept:"statusAccept" === type?'primary':'ghost',
      statusInvalid:"statusInvalid" === type?'primary':'ghost',
      currentStatus:status
    });

    const filters = this.createFilters(this.state.searchVal);
    //切换状态后更新table数据
    this.props.loadDelegates(null, {
      tenantId: this.props.tenantId,
      pageSize: this.props.idlist.pageSize,
      currentPage: 1,
      currentStatus:status,
      filters: JSON.stringify(filters)
    });
    //切换状态的时候同时更新状态数量
    //  this.props.loadStatus(null, {
    //   tenantId: this.props.tenantId,
    //   filters: JSON.stringify(filters)
    // });
}
handleSearch(searchVal) {
  this.setState({
    searchVal:searchVal
  });

  const filters = this.createFilters(searchVal);

  this.props.loadDelegates(null, {
    tenantId: this.props.tenantId,
    pageSize: this.props.idlist.pageSize,
    currentPage: 1,
    currentStatus:this.state.currentStatus,
    filters: JSON.stringify(filters)
  });

  this.props.loadStatus(null, {
    tenantId: this.props.tenantId,
    filters: JSON.stringify(filters)
  });
}
 handleNavigationTo(to, query) {
    this.props.history.pushState(null, to, query);
  }
  createFilters(searchVal) {//创建过滤
    return [[{
      name: 'del_no',
      value: searchVal
    }, {
      name: 'bill_no',
      value: searchVal
    }, {
      name: 'invoice_no',
      value: searchVal
    }]];
  }
  renderColumnText(status, text) {
    let style = {};
    if (status === 3) {
      style = {color: '#CCC'};
    }
    return <span style={style}>{text}</span>;
  }
  renderValidateStyle(item) {
    const {isFieldValidating, getFieldError, getFieldsValue} = this.props.formhoc;
    return cx({
      'error': getFieldError(item),
      'validating': isFieldValidating(item),
      'success': getFieldsValue([item])[item] && !getFieldError(item) && !isFieldValidating(item)
    });
  }
  renderTextInput(labelName, placeholder, field, required, rules, fieldProps) {
    const {formhoc: {getFieldProps, getFieldError}} = this.props;
    return (
      <FormItem label={labelName} labelCol={{span: 6}} wrapperCol={{span: 16}} validateStatus={rules
        && renderValidateStyle(field, this.props.formhoc)}
        help={rules && getFieldError(field)} hasFeedback required={required}>
        <Input type="text" placeholder={placeholder} {...getFieldProps(field, {rules, ...fieldProps})} />
        </FormItem>
        );
  }

  render() {
    const { customsBrokerList, statusList: {notSendCount, notAcceptCount, acceptCount, invalidCount}, idlist, loading, needUpdate, formhoc: {getFieldProps, getFieldError} } = this.props;
    const { statusAll, statusAccept, statusInvalid, statusNotAccept, statusNotSend, currentStatus } = this.state;
    const dataSource = new Table.DataSource({
      fetcher: (params) => this.props.loadDelegates(null, params),
      resolve: (result) => result.data,
      needUpdate,
      extraParams: { tenantId: this.props.tenantId },
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
          sortOrder: sorter.order,
          currentStatus:currentStatus,
          filters: []
        };
        
        
        for (const key in filters) {
          if (filters[key]) {
            params.filters.push({
              name: key,
              value: `'${filters[key].join("','")}'`
            });
          }
        }
        params.filters= JSON.stringify( params.filters);
         console.log('getParams 的参数是：', pagination, filters, sorter, '请求参数：', params);
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
    
    const filterArray=[];
    // branches.map(br => <Select.Option key={br.key} value={`${br.key}`}>{br.name}</Select.Option>)
    customsBrokerList.map(item=>{
        filterArray.push({text:item.short_name,value:`${item.key}`});
    });
    
    const columns = [{
      title: '报关业务单号',
      dataIndex: 'del_no',
      render:(text, record) => this.renderColumnText(record.status, text)
    }, {
      title: '报关行',
      sorter: true,
      dataIndex: 'short_name',
      filters:filterArray,
      render:(text, record) => this.renderColumnText(record.status, text)
    }, {
      title: '委托时间',
      sorter: true,
      dataIndex: 'del_date',
      render:(text, record) => this.renderColumnText(record.status, text)
    }, {
      title: '接单时间',
      dataIndex: 'rec_del_date',
      render:(text, record) => this.renderColumnText(record.status, text)
    }, {
      title: '提单号',
      dataIndex: 'bill_no',
      render:(text, record) => this.renderColumnText(record.status, text)
    }, {
      title: '状态',
      dataIndex: 'status',
      sorter: true,
      render: (text, record, index) => {//根据状态定制显示状态中文描述
        let fontColor = "";
        let statusText='';
        switch (record.status) {
          case 0:
          statusText='未发送';
          fontColor='#FFD700';
          break;
          case 1:
          statusText='未受理';
          fontColor='#FF7F00';
          break;
          case 2:
          statusText='已接单';
          fontColor='#00CD00';
          break;
          case 3:
          statusText='已作废';
          fontColor='#CCC';
          break;
        }
        return (<span style={{color:fontColor}}>
          {statusText}
          </span>);
      }
    }, {
      title: '操作',
      width: 150,
      render: (text, record, index) => {//根据状态定制按钮显示
       switch (record.status) {
        case 0:
        return (
          <span>
          <a href="#" className="ant-dropdown-link">修改</a>
          <span className="ant-divider"></span>
          <a href="#" className="ant-dropdown-link">发送</a>
          </span>
          );
        case 1:
        return (
          <span>
          <a href="#" className="ant-dropdown-link">查看</a>
          <span className="ant-divider"></span>
          <a href="#" className="ant-dropdown-link">撤回</a>
          </span>
          );
        case 2:
        return (
          <span>
          <a href="#" className="ant-dropdown-link">变更</a>
          </span>
          );
        case 3:
        return (
          <span>
          <a href="#" className="ant-dropdown-link">查看</a>
          <span className="ant-divider"></span>
          <a role="button" onClick={() => this.handleIdRemove(record.key)} >删除</a>
          </span>
          );
      }
    }
  }];
  return (
    <div className="main-content">
    <div className="page-header">
    <div className="pull-right action-btns">
    <SearchBar placeholder="业务单号/发票号/提单号" onInputSearch={(val) => this.handleSearch(val)} />
    <a role="button">高级搜索</a>
    </div>
    <h2>进口委托</h2>
    </div>
    <div className="page-body">
    <div className="panel-header">
    <Button type={statusAll} style={{marginRight:5}} onClick={ () => this.handleChangeStatus('statusAll', -1) } ><span>全部</span></Button>
    <Button type={statusNotSend} style={{marginRight:5}} onClick={ () => this.handleChangeStatus('statusNotSend', 0) } ><span>未发送({notSendCount})</span></Button>
    <Button type={statusNotAccept} style={{marginRight:5}} onClick={ () => this.handleChangeStatus('statusNotAccept', 1) } ><span>未受理({notAcceptCount})</span></Button>
    <Button type={statusAccept} style={{marginRight:5}} onClick={ () => this.handleChangeStatus('statusAccept', 2) } ><span>已接单({acceptCount})</span></Button>
    <Button type={statusInvalid} style={{marginRight:5}} onClick={ () => this.handleChangeStatus('statusInvalid', 2) } ><span>已作废({invalidCount})</span></Button>
    <div className="pull-right action-btns">
    <Button type="primary" onClick={() => this.handleNavigationTo('/import/delegate/new')}>
      <span>新增</span>
    </Button>
    </div>
    </div>
    <div className="panel-body body-responsive">
    <Table rowSelection={rowSelection} columns={ columns } loading={ loading } remoteData={ idlist } dataSource={ dataSource }/>
    </div>
    </div>
    </div>
    );
}
}
