import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { submitWarehouse, loadWarehouses, updateWh, delWh, beginEdit, edit, cancelEdit } from 'common/reducers/warehouse';
import { isLoaded } from 'client/common/redux-actions';
import connectFetch from 'client/common/connect-fetch';
import { toNumber } from 'client/common/transformer';
import {Table, Button, Icon, Form, Input, Radio, Row, Col, DatePicker, Select, message} from 'ant-ui';
const FormItem = Form.Item;
const Option = Select.Option;
const RadioGroup = Radio.Group;
const InputGroup = Input.Group;

function fetchData({ state, dispatch, cookie }) {
  if (!isLoaded(state, 'warehouse')) {
    return dispatch(loadWarehouses({ corpId: state.account.corpId }, cookie));
  }
}

@connectFetch({deferred: true})(fetchData)
@connect(
  state => ({
    corpId: state.account.corpId,
    tenantId: state.account.tenantId,
    whlist: state.warehouse.whlist,
    needUpdate: state.warehouse.needUpdate,
    formData: state.warehouse.formData,
    loading: state.warehouse.loading
  }),
  { updateWh, delWh, loadWarehouses, submitWarehouse, beginEdit, edit, cancelEdit }
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
export default class Warehouse extends React.Component {
  static propTypes = {
    formhoc: PropTypes.object.isRequired,
    whlist: PropTypes.object.isRequired,
    formData: PropTypes.object.isRequired,
    loading: PropTypes.bool.isRequired,
    updateWh: PropTypes.func.isRequired,
    delWh: PropTypes.func.isRequired,
    beginEdit: PropTypes.func.isRequired,
    edit: PropTypes.func.isRequired,
    cancelEdit: PropTypes.func.isRequired,
    loadWarehouses: PropTypes.func.isRequired,
    submitWarehouse: PropTypes.func.isRequired,
    needUpdate: PropTypes.bool,
    corpId: PropTypes.number.isRequired,
    tenantId: PropTypes.number.isRequired
  }
  constructor(props) {
    super(props);
    this.state = {
      showForm: false
    };
  }
  handleWhReg() {
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
        this.props.updateWh(this.props.formData).then((result) => {
          if (result.error) {
            message.error(result.error.message, 10);
          } else {
            this.setState({
              showForm: false
            });
          }
        });
      } else {
        this.props.submitWarehouse(this.props.formData, this.props.corpId, this.props.tenantId).then(
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
  handleWhEdit(warehouse, index) {
    this.props.beginEdit(warehouse, index);
    this.setState({
      showForm: true
    });
  }
  handleWhRemove(whKey) {
    this.props.delWh(whKey);
  }
  renderInput(labelName, field, required, rules, fieldProps) {
    const {getFieldProps, getFieldError} = this.props.formhoc;
    return (
      <FormItem label={labelName} labelCol={{span: 6}} wrapperCol={{span: 8}}
      help={ rules && getFieldError(field)} hasFeedback required={required}>
        <Input type="text" {...getFieldProps(field, {rules, ...fieldProps})} />
      </FormItem>
    );
  }
  render() {
    const { whlist, loading, needUpdate, formhoc: {getFieldProps, getFieldError} } = this.props;
    const dataSource = new Table.DataSource({
      fetcher: (params) => this.props.loadWarehouses(params),
      resolve: (result) => result.data,
      needUpdate,
      extraParams: { corpId: this.props.corpId },
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
      title: '仓库代码',
      dataIndex: 'wh_no'
    }, {
      title: '名称',
      dataIndex: 'wh_name'
    }, {
      title: '联系电话',
      dataIndex: 'mobile'
    }, {
      title: '描述',
      width: '30%',
      dataIndex: 'wh_desc'
    }, {
      title: '操作',
      width: 150,
      render: (text, record, index) => {// todo down icon not horiztonal
        return (<span>
          <Button shape="circle" type="primary" title="编辑" onClick={ () => this.handleWhEdit(record, index) } size="small"><Icon type="edit" /></Button>
          <span className="ant-divider"></span>
          <Button shape="circle" type="primary" title="删除" onClick={ () => this.handleWhRemove(record.key)} size="small"><Icon type="cross" /></Button>
          <span className="ant-divider"></span>
          <a href="#" className="ant-dropdown-link">
          更多 <Icon type="down" />
          </a>
        </span>);
      }
    }];
    return (
      <div className="table-wrapper">
        <div className="row">
          <div className={ this.state.showForm ? 'form-fade-leave' : '' }>
            <div className="table-header">
              <Button type="primary" size="large" onClick={ () => this.handleWhReg() }><Icon type="plus" /><span>新增</span></Button>
            </div>
            <div className="table-body">
              <Table rowSelection={rowSelection} columns={ columns } loading={ loading } remoteData={ whlist } dataSource={ dataSource }/>
            </div>
          </div>
          <div className={(this.state.showForm ? 'form-fade-enter' : 'form-fade-leave')} form={ this.props.formhoc }>
            <Form horizontal onSubmit={ (ev) => this.handleSubmit(ev) }>
              {this.renderInput('仓库代码', 'wh_no', true, [{required: true, message: '请填写仓库代码'}])}
              <FormItem label="仓库类型: " labelCol={{span: 6}} wrapperCol={{span: 8}}
                help={getFieldError('wh_mode')} hasFeedback required>
                <RadioGroup value="paid" name="wh_mode" {...getFieldProps('wh_mode', {rules: [{required: true, message: '仓库类型必选'}]})}>
                  <Radio value="paid">收费</Radio>
                  <Radio value="free">免费</Radio>
                </RadioGroup>
              </FormItem>
              {this.renderInput('名称', 'wh_name', true, [{required: true, message: '请填写仓库名称'}])}
              {this.renderInput('简称', 'wh_short_name')}
              <FormItem label="描述:" labelCol={{span: 6}} wrapperCol={{span: 8}}>
                <Input type="textarea" rows={3} name="wh_desc" {...getFieldProps('wh_desc', {initialValue: ''})} />
              </FormItem>
              <FormItem label="区域: " labelCol={{span: 6}} wrapperCol={{span: 8}}>
                <InputGroup>
                  <Col span="6">
                    <Input name="country" placeholder="国家" {...getFieldProps('country')} />
                  </Col>
                  <Col span="6">
                    <Input name="province" addonAfter="省" {...getFieldProps('province')} />
                  </Col>
                  <Col span="6">
                    <Input name="city" addonAfter="市" {...getFieldProps('city')} />
                  </Col>
                  <Col span="6">
                    <Input name="district" addonAfter="区" {...getFieldProps('district')} />
                  </Col>
                </InputGroup>
              </FormItem>
              {this.renderInput('详细地址', 'address')}
              <FormItem label="开业日期: " labelCol={{span: 6}} wrapperCol={{span: 4}}>
                <DatePicker name="open_date" {...getFieldProps('open_date', {initialValue: null})} />
              </FormItem>
              {this.renderInput('联系人', 'linkman')}
              {this.renderInput('联系手机号', 'mobile')}
              {this.renderInput('座机', 'telephone')}
              {this.renderInput('传真', 'fax')}
              {this.renderInput('邮箱', 'email')}
              {this.renderInput('QQ', 'qq')}
              {this.renderInput('官网', 'url')}
              {this.renderInput('面积', 'acreage')}
              {this.renderInput('日租金', 'day_rent')}
              {this.renderInput('最短租期', 'rent_term')}
              {this.renderInput('服务人数', 'service_man_qty', false, [{type: 'integer', message: '人数须为整数'}],
                                {transform: toNumber})}
              {this.renderInput('每天服务时间', 'service_time')}
              {this.renderInput('工作天数', 'week_days', false, [{type: 'integer', message: '工作天数须为整数'}],
                                {transform: toNumber})}
              {this.renderInput('休息日人数', 'rest_man_qty', false, [{type: 'integer', message: '人数须为整数'}],
                                {transform: toNumber})}
              {this.renderInput('假期天数', 'vacation_day', false, [{type: 'integer', message: '天数须为整数'}],
                                {transform: toNumber})}
              <FormItem label="营运方式" labelCol={{span: 6}} wrapperCol={{span: 8}}>
                <Select size="large" style={{width:200}} name="service_mode" {...getFieldProps('service_mode', {
                  transform: toNumber, adapt: (val) => (val ? `${val}` : '')})}>
                  <Option value="0">自营</Option>
                  <Option value="1">平台代营</Option>
                </Select>
              </FormItem>
              {this.renderInput('经度', 'longitude', false, [{type: 'number', message: '非数字类型'}], {transform: toNumber})}
              {this.renderInput('纬度', 'latitude', false, [{type: 'number', message: '非数字类型'}], {transform: toNumber})}
              {this.renderInput('邮政编码', 'zip_code')}
              <FormItem id="remark" label="备忘" labelCol={{span: 6}} wrapperCol={{span: 8}}>
                <Input type="textarea" id="remark" name="remark" placeholder="仓库备忘信息..." {...getFieldProps('remark',
                   {initialValue: ''})} />
              </FormItem>
              <div className={`bottom-fixed-row${this.state.showForm ? ' form-fade-enter' : ' form-fade-leave'}`}>
                <Row>
                  <Col span="2" offset="8">
                    <Button type="primary" htmlType="submit">确定</Button>
                  </Col>
                  <Col span="2">
                    <Button type="primary" onClick={ (ev) => this.handleSubmitCancel(ev) }>取消</Button>
                  </Col>
                </Row>
              </div>
            </Form>
          </div>
        </div>
      </div>
    );
  }
}
