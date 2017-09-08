import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Form, Select, Row, Col, Radio } from 'antd';
import { checkOwnerColumn, checkProductColumn, checkLocationColumn, checkProductLocation, changeSearchType, clearList } from 'common/reducers/cwmInventoryStock';

const FormItem = Form.Item;
const Option = Select.Option;
const RadioGroup = Radio.Group;
const RadioButton = Radio.Button;

@injectIntl
@connect(
  state => ({
    filter: state.cwmTransition.listFilter,
    owners: state.cwmContext.whseAttrs.owners,
  }),
  { checkOwnerColumn, checkProductColumn, checkLocationColumn, checkProductLocation, changeSearchType, clearList }
)

export default class HeadForm extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    form: PropTypes.object.isRequired,
  }
  state = {
    expandForm: false,
  };
  handleFormReset = () => {
    this.props.form.resetFields();
  }
  toggleForm = () => {
    this.setState({
      expandForm: !this.state.expandForm,
    });
  }
  handleStockSearch = (ev) => {
    ev.preventDefault();
    this.props.form.validateFields((err) => {
      if (!err) {
        const formData = this.props.form.getFieldsValue();
        this.props.onSearch(formData);
      }
    });
  }

  render() {
    const { form: { getFieldDecorator }, owners, filter } = this.props;
    return (
      <Row gutter={16}>
        <Col span={5}>
          <FormItem label="收货单位">
            {getFieldDecorator('owner', { initialValue: filter.owner,
              rules: [{ required: true, message: '收货单位必选' }],
            })(
              <Select placeholder="请选择收货单位" showSearch optionFilterProp="children" allowClear style={{ width: 200 }}>
                {owners.map(owner => (<Option value={owner.id} key={owner.id}>{owner.name}</Option>))}
              </Select>)}
          </FormItem>
        </Col>
        <Col span={5} offset={1}>
          <FormItem label="报关代理">
            {getFieldDecorator('broker', { initialValue: filter.broker })(
              <Select placeholder="请选择报关代理" style={{ width: 200 }} />)}
          </FormItem>
        </Col>
        <Col span={5} offset={1}>
          <FormItem label="类型">
            {getFieldDecorator('apply_type', { initialValue: filter.apply_type })(
              <Select placeholder="请选择报关申请类型" defaultValue="0" style={{ width: 200 }}>
                <Option value="0" key="0">普通报关申请单</Option>
                <Option value="1" key="1">跨关区报关申请单</Option>
                <Option value="2" key="2">保展报关申请单</Option>
              </Select>)}
          </FormItem>
        </Col>
        <Col span={5} offset={1}>
          <FormItem label="进出口标识">
            {getFieldDecorator('i_e_type', { initialValue: 'import' })(
              <RadioGroup onChange={this.handleIetypeChange}>
                <RadioButton value="import">进口</RadioButton>
                <RadioButton value="export">出口</RadioButton>
              </RadioGroup>)}
          </FormItem>
        </Col>
        <Col span={1}>
          {/*
            <FormItem style={{ width: 50 }}>
              <a style={{ marginLeft: 8, fontSize: 12 }} onClick={this.toggleForm}>
                {this.state.expandForm ? '收起' : '展开'} <Icon type={this.state.expandForm ? 'up' : 'down'} />
              </a>
            </FormItem>
            */}
        </Col>
      </Row>
    );
  }
}
