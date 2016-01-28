import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { submitDelegate, loadDelegates, updateId, delId, beginEdit, edit, cancelEdit,loadStatus } from '../../../universal/redux/reducers/importdelegate';
import { isLoaded } from '../../../reusable/common/redux-actions';
import connectFetch from '../../../reusable/decorators/connect-fetch';
import SearchBar from '../../../reusable/components/search-bar';
import cx from '../../../reusable/browser-util/classname-join';
import { toNumber } from '../../../reusable/common/transformer'; 
import {Table, Button, AntIcon, Form, Input, Radio, Row, Col, Datepicker, Select, message} from '../../../reusable/ant-ui';
const FormItem = Form.Item;
const Option = Select.Option;
const RadioGroup = Radio.Group;
const InputGroup = Input.Group;

function fetchData({ state, dispatch, cookie }) {
    const promises = [];
    !isLoaded(state, 'importdelegate')
    {
       let p =dispatch(loadDelegates(cookie, { 
                tenantId: state.account.tenantId,
                pageSize: state.importdelegate.idlist.pageSize,
                currentPage: state.importdelegate.idlist.current
            }));
        promises.push(p);
        
        p = dispatch(loadStatus(cookie, {
              tenantId: state.account.tenantId
            }));
        promises.push(p);
    }
  return Promise.all(promises);
}

@connectFetch()(fetchData)
@connect(
  state => ({
    tenantId: state.account.tenantId,
    idlist: state.importdelegate.idlist,
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
  static propTypes = {
    formhoc: PropTypes.object.isRequired,
    idlist: PropTypes.object.isRequired,
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
    this.state = {
      showForm: false,
      statusAll:'ghost',
      statusNotSend:'primary',
      statusNotAccept:'ghost',
      statusAccept:'ghost',
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
  handleIdRemove(idKey) {
    this.props.delId(idKey);
  }
  handleGetDateFromUTC(datestring) {
      if(datestring.length>0) {
          return datestring.substring(0,10);
      }
      
  }
  handleChangeStatus(status) {
    this.setState({
        statusAll:"statusAll"===status?"primary":"ghost",
        statusNotSend:"statusNotSend"===status?"primary":"ghost",
        statusNotAccept:"statusNotAccept"===status?"primary":"ghost",
        statusAccept:"statusAccept"===status?"primary":"ghost"
    });
  }
   handleSearch(searchVal) {
    alert('123');
    const filters = [[{
      name: 'del_no',
      value: searchVal
    }, {
      name: 'bill_no',
      value: searchVal
    }, {
      name: 'invoice_no',
      value: searchVal
    }]];
    this.props.loadDelegates(null, {
      tenantId: this.props.tenant.id,
      pageSize: this.props.idlist.pageSize,
      currentPage: 1,
      filters: JSON.stringify(filters)
    });
  }
  renderValidateStyle(item) {
    const {isFieldValidating, getFieldError, getFieldsValue} = this.props.formhoc;
    return cx({
      'error': getFieldError(item),
      'validating': isFieldValidating(item),
      'success': getFieldsValue([item])[item] && !getFieldError(item) && !isFieldValidating(item)
    });
  }
  renderInput(labelName, field, required, rules, fieldProps) {
    const {getFieldProps, getFieldError} = this.props.formhoc;
    return (
      <FormItem label={labelName} labelCol={{span: 6}} wrapperCol={{span: 8}} validateStatus={rules && this.renderValidateStyle(field)}
      help={ rules && getFieldError(field)} hasFeedback required={required}>
        <Input type="text" {...getFieldProps(field, {rules, ...fieldProps})} />
      </FormItem>
    );
  }
  render() {
    const { idlist, loading, needUpdate, formhoc: {getFieldProps, getFieldError} } = this.props;
    const { statusAll, statusAccept, statusNotAccept, statusNotSend } = this.state;
    const dataSource = new Table.DataSource({
      fetcher: (params) => this.props.loadDelegates(params),
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
          sortOrder: sorter.order
        };
        for (const key in filters) {
          if (filters[key]) {
            params[key] = filters[key];
          }
        }
        // console.log('getParams 的参数是：', pagination, filters, sorter, '请求参数：', params);
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
      title: '报关业务单号',
      dataIndex: 'del_no'
    }, {
      title: '报关行',
      dataIndex: 'rec_tenant_id'
    }, {
      title: '委托时间',
      dataIndex: 'del_date',
      render: (text, record, index) => {// todo down icon not horiztonal
        return (<span>
           {this.handleGetDateFromUTC(record.del_date)}
            </span>);
      }
    }, {
      title: '接单时间',
      dataIndex: 'rec_del_date',
        render: (text, record, index) => {// todo down icon not horiztonal
        return (<span>
           {this.handleGetDateFromUTC(record.rec_del_date)}
            </span>);
      }
    }, {
      title: '提单号',
      dataIndex: 'bill_no'
    }, {
      title: '状态',
      render: (text, record, index) => {// todo down icon not horiztonal
        return (<span>
            未发送
            </span>);
      }
    }, {
      title: '操作',
      width: 150,
      render: (text, record, index) => {// todo down icon not horiztonal
        return (<span>
          <Button shape="circle" type="primary" title="编辑" onClick={ () => this.handleDgEdit(record, index) } size="small"><AntIcon type="edit" /></Button>
          <span className="ant-divider"></span>
          <Button shape="circle" type="primary" title="删除" onClick={ () => this.handleDgRemove(record.key)} size="small"><AntIcon type="cross" /></Button>
          <span className="ant-divider"></span>
          <a href="#" className="ant-dropdown-link">
          更多 <AntIcon type="down" />
          </a>
        </span>);
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
              <Button type={statusAll} style={{marginRight:5}} onClick={ () => this.handleChangeStatus('statusAll') } ><span>全部</span></Button>
              <Button type={statusNotSend} style={{marginRight:5}} onClick={ () => this.handleChangeStatus('statusNotSend') } ><span>未发送(2)</span></Button>
              <Button type={statusNotAccept} style={{marginRight:5}} onClick={ () => this.handleChangeStatus('statusNotAccept') } ><span>未受理(0)</span></Button>
              <Button type={statusAccept} style={{marginRight:5}} onClick={ () => this.handleChangeStatus('statusAccept') } ><span>已接单(0)</span></Button>
          </div>
          <div className="panel-body body-responsive">
             <Table rowSelection={rowSelection} columns={ columns } loading={ loading } remoteData={ idlist } dataSource={ dataSource }/>
          </div>
        </div>
      </div>
    );
  }
}
