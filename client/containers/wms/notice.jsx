import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import connectFetch from '../../../reusable/decorators/connect-fetch';
import { load, submit, update, del, beginEdit, edit, cancelEdit } from '../../../universal/redux/reducers/notice';
import { isLoaded } from '../../../reusable/common/redux-actions';
import cx from '../../../reusable/browser-util/classname-join';
import {Table, Button, AntIcon, Form, Input, Row, Col, message} from '../../../reusable/ant-ui';
const FormItem = Form.Item;

function fetchData({ state, dispatch, cookie }) {
  if (!isLoaded(state, 'notice')) {
    return dispatch(load({ corpId: state.account.corpId }, cookie));
  }
}

@connectFetch({ deferred: true })(fetchData)
@connect(
  state => ({
    corpId: state.account.corpId,
    tenantId: state.account.tenantId,
    formData: state.notice.formData,
    notices: state.notice.notices,
    needUpdate: state.notice.needUpdate,
    loading: state.notice.loading
  }),
  {load, submit, update, del, beginEdit, edit, cancelEdit}
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
export default class Notice extends React.Component {
  static propTypes = {
    formhoc: PropTypes.object.isRequired,
    formData: PropTypes.object.isRequired,
    notices: PropTypes.object.isRequired,
    loading: PropTypes.bool.isRequired,
    update: PropTypes.func.isRequired,
    del: PropTypes.func.isRequired,
    load: PropTypes.func.isRequired,
    submit: PropTypes.func.isRequired,
    beginEdit: PropTypes.func.isRequired,
    edit: PropTypes.func.isRequired,
    cancelEdit: PropTypes.func.isRequired,
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
        this.props.update(this.props.formData).then((result) => {
          if (result.error) {
            message.error(result.error.message, 10);
          } else {
            this.setState({
              showForm: false
            });
          }
        });
      } else {
        this.props.submit(this.props.formData, this.props.corpId, this.props.tenantId).then(
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
  handleEdit(notice, index) {
    this.props.beginEdit(notice, index);
    this.setState({
      showForm: true
    });
  }
  handleRemove(key) {
    this.props.del(key);
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
    const { notices, loading, needUpdate, formhoc: {getFieldProps, getFieldError} } = this.props;
    const dataSource = new Table.DataSource({
      fetcher: (params) => this.props.load(params),
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
      title: '标题',
      dataIndex: 'title'
    }, {
      title: '分类',
      dataIndex: 'subject'
    }, {
      title: '发布时间',
      dataIndex: 'created_date',
      render: (o, record) => {
        const date = new Date(record.created_date);
        return <span>{`${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`}</span>;
      }
    }, {
      title: '操作',
      dataIndex: '',
      width: 150,
      render: (text, record, index) => {
        return (<span>
          <Button shape="circle" type="primary" title="编辑" onClick={() => this.handleEdit(record, index)} size="small"><AntIcon type="edit" /></Button>
          <span className="ant-divider"></span>
          <Button shape="circle" type="primary" title="删除" onClick={() => this.handleRemove(record.key)} size="small"><AntIcon type="cross" /></Button>
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
              <Table rowSelection={rowSelection} columns={ columns } loading={ loading } remoteData={ notices } dataSource={ dataSource }/>
            </div>
          </div>
          <div className={ this.state.showForm ? 'form-fade-enter' : 'form-fade-leave' }>
            <Form horizontal onSubmit={(ev) => this.handleSubmit(ev)}>
              {this.renderInput('标题', 'title', true, [{required: true, message: '标题不能为空'}])}
              {this.renderInput('分类', 'subject', true, [{required: true, message: '类别不能为空'}])}
              <FormItem label="内容" labelCol={{span: 6}} wrapperCol={{span: 8}} validateStatus={this.renderValidateStyle('body')}
                help={getFieldError('body')} hasFeedback required>
                <Input type="textarea" rows="10" name="body" {...getFieldProps('body', {rules: [{required: true, message: '内容不能为空'}]})} />
              </FormItem>
              <Row>
                <Col span="2" offset="8">
                  <Button type="primary" htmlType="submit">确定</Button>
                </Col>
                <Col span="2">
                  <Button type="primary" onClick={(ev) => this.handleSubmitCancel(ev)}>取消</Button>
                </Col>
              </Row>
            </Form>
          </div>
        </div>
      </div>);
  }
}
