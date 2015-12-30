import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { submitBill, loadBills, updateBill, delBill, beginEdit, edit, cancelEdit } from '../../../universal/redux/reducers/bill';
import { isLoaded } from '../../../reusable/common/redux-actions';
import connectFetch from '../../../reusable/decorators/connect-fetch';
import cx from '../../../reusable/browser-util/classname-join';
import { AntIcon, Table, Button, Form, Input, Row, Col, Select } from '../../../reusable/ant-ui';
const FormItem = Form.Item;
const Option = Select.Option;

function fetchData({ state, dispatch, cookie }) {
  if (!isLoaded(state, 'bill')) {
    return dispatch(loadBills({ corpId: state.account.corpId }, cookie));
  }
}

@connectFetch({ deferred: true })(fetchData)
@connect(
  state => ({
    bills: state.bill.bills,
    needUpdate: state.bill.needUpdate,
    customers: state.bill.customers,
    formData: state.bill.formData,
    corpId: state.account.corpId,
    tenantId: state.account.tenantId,
    loading: state.bill.loading
  }),
  { updateBill, delBill, loadBills, submitBill, beginEdit, edit, cancelEdit}
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
export default class Bill extends React.Component {
  static propTypes = {
    formhoc: PropTypes.object.isRequired,
    formData: PropTypes.object.isRequired,
    bills: PropTypes.object.isRequired,
    loading: PropTypes.bool.isRequired,
    corpId: PropTypes.number.isRequired,
    tenantId: PropTypes.number.isRequired,
    needUpdate: PropTypes.bool.isRequired,
    updateBill: PropTypes.func.isRequired,
    customers: PropTypes.array.isRequired,
    delBill: PropTypes.func.isRequired,
    loadBills: PropTypes.func.isRequired,
    submitBill: PropTypes.func.isRequired,
    beginEdit: PropTypes.func.isRequired,
    edit: PropTypes.func.isRequired,
    cancelEdit: PropTypes.func.isRequired
  }
  constructor(props) {
    super(props);
    this.state = {
      showForm: false
    };
  }
  handleFormReg() {
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
        this.props.updateBill(this.props.formData, () => {
          this.setState({
            showForm: false
          });
        });
      } else {
        this.props.submitBill({ ...this.props.formData, payee_id: this.props.corpId }, this.props.corpId, this.props.tenantId, () => {
          this.setState({
            showForm: false
          });
        });
      }
    });
  }
  handleSubmitCancel(ev) {
    ev.preventDefault();
    this.props.formhoc.reset();
    this.setState({
      showForm: false
    });
  }
  handleEdit(bill, index) {
    this.props.edit(bill, index);
    this.setState({
      showForm: true
    });
  }
  handleRemove(blKey) {
    this.props.delBill(blKey);
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
    const { bills, customers, loading, needUpdate, formhoc: {getFieldProps, getFieldError} } = this.props;
    const dataSource = new Table.DataSource({
      fetcher: (params) => this.props.loadBills(params),
      resolve: (result) => result.data,
      needUpdate,
      getPagination: (result) => ({
        total: result.totalCount,
        // 删除完一页时返回上一页
        current:
          result.current > result.totalCount !== 0 && Math.ceil(result.totalCount / result.pageSize) ?
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
      title: '客户名称',
      dataIndex: 'payer_name'
    }, {
      title: '主题',
      dataIndex: 'subject'
    }, {
      title: '内容',
      dataIndex: 'body'
    }, {
      title: '金额',
      dataIndex: 'amount'
    }, {
      title: '状态',
      dataIndex: 'status'
    }, {
      title: '操作',
      dataIndex: '',
      width: 150,
      render: (text, record, index) => {// todo down icon not horiztonal
        return (<span>
          <Button shape="circle" type="primary" title="编辑" onClick={ () => this.handleEdit(record, index) } size="small"><AntIcon type="edit" /></Button>
          <span className="ant-divider"></span>
          <Button shape="circle" type="primary" title="删除" onClick={ () => this.handleRemove(record.key)} size="small"><AntIcon type="cross" /></Button>
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
              <Button type="primary" size="large" onClick={ () => this.handleFormReg() }><AntIcon type="plus" /><span>新增</span></Button>
            </div>
            <div className="table-body">
              <Table rowSelection={rowSelection} columns={ columns } loading={ loading } remoteData={ bills } dataSource={ dataSource }/>
            </div>
          </div>
          <div className={ this.state.showForm ? 'form-fade-enter' : 'form-fade-leave' }>
            <Form horizontal onSubmit={ (ev) => this.handleSubmit(ev) }>
              <FormItem label="支付客户" labelCol={{span: 6}} wrapperCol={{span: 8}} validateStatus={this.renderValidateStyle('payer_id')}
                help={getFieldError('body')} hasFeedback required>
                <Select size="large" style={{width:200}} name="payer_id" {...getFieldProps('payer_id', {rules: [{required: true}]})}>
                  { customers.map(cust => (
                    <Option value={ cust.id }>{ cust.name }</Option>))
                  }
                </Select>
              </FormItem>
              {this.renderInput('订单主题', 'subject')}
              {this.renderInput('订单内容', 'body')}
              {this.renderInput('金额', 'amount')}
              <Row>
                <Col span="2" offset="8">
                  <Button type="primary" htmlType="submit">确定</Button>
                </Col>
                <Col span="2">
                  <Button type="primary" onClick={ (ev) => this.handleSubmitCancel(ev) }>取消</Button>
                </Col>
              </Row>
            </Form>
          </div>
        </div>
      </div>
    );
  }
}
