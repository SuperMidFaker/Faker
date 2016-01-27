import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { submitDelegate, loadDelegates, updateId, delId, beginEdit, edit, cancelEdit } from '../../../universal/redux/reducers/importdelegate';
import { isLoaded } from '../../../reusable/common/redux-actions';
import connectFetch from '../../../reusable/decorators/connect-fetch';
import cx from '../../../reusable/browser-util/classname-join';
import { toNumber } from '../../../reusable/common/transformer'; 
import {Table, Button, AntIcon, Form, Input, Radio, Row, Col, Datepicker, Select, message} from '../../../reusable/ant-ui';
const FormItem = Form.Item;
const Option = Select.Option;
const RadioGroup = Radio.Group;
const InputGroup = Input.Group;

function fetchData({ state, dispatch, cookie }) {
  if (!isLoaded(state, 'importDelegate')) {
    return dispatch(loadDelegates({ tenantId: state.account.tenantId }, cookie));
  }
}

@connectFetch({deferred: true})(fetchData)
@connect(
  state => ({
    tenantId: state.account.tenantId,
    idlist: state.warehouse.idlist,
    needUpdate: state.warehouse.needUpdate,
    formData: state.warehouse.formData,
    loading: state.warehouse.loading
  }),
  { updateId, delId, loadDelegates, submitDelegate, beginEdit, edit, cancelEdit }
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
    submitDelegate: PropTypes.func.isRequired,
    needUpdate: PropTypes.bool,
    tenantId: PropTypes.number.isRequired
  }
  constructor(props) {
    super(props);
    this.state = {
      showForm: false
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
  handleIdEdit(warehouse, index) {
    this.props.beginEdit(warehouse, index);
    this.setState({
      showForm: true
    });
  }
  handleIdRemove(idKey) {
    this.props.delId(idKey);
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
      dataIndex: 'del_date'
    }, {
      title: '接单时间',
      dataIndex: 'rec_del_date'
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
      <div className="table-wrapper">
        <div className="row">
          <div className={ this.state.showForm ? 'form-fade-leave' : '' }>
            <div className="table-header">
              <Button type="primary" size="large" onClick={ () => this.handleDgReg() }><AntIcon type="plus" /><span>新增</span></Button>
            </div>
            <div className="table-body">
              <Table rowSelection={rowSelection} columns={ columns } loading={ loading } remoteData={ idlist } dataSource={ dataSource }/>
            </div>
          </div>
          </div>
      </div>
    );
  }
}
