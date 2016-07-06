import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { Form, Select, Input, Card, Col } from 'ant-ui';
import { searchClient, setClientForm, searchParams } from 'common/reducers/cmsDelegation';

const FormItem = Form.Item;
const Option = Select.Option;
const formItemLayout = {
  labelCol: {span: 6},
  wrapperCol: {span: 18}
};

function SearchSelect(props) {
  const { options, field, getFieldProps, onSearch } = props;
  function handleSearch(searched) {
    if (onSearch) {
      onSearch(field, searched);
    }
  }
  return (
    <Select filterOption={false} showSearch onSearch={handleSearch} {...getFieldProps(field)}>
    {options.map(opt => <Option key={opt.value} value={opt.value}>{opt.text}</Option>)}
    </Select>
  );
}

SearchSelect.propTypes = {
  options: PropTypes.array.isRequired,
  field: PropTypes.string.isRequired,
  getFieldProps: PropTypes.func.isRequired,
  onSearch: PropTypes.func,
};

@connect(
  state => ({
    tenantId: state.account.tenantId,
    clients: state.cmsDelegation.formRequire.clients,
    tradeModes: state.cmsDelegation.formRequire.tradeModes,
    transModes: state.cmsDelegation.formRequire.transModes,
    declareWayModes: state.cmsDelegation.formRequire.declareWayModes,
  }),
  { searchClient, setClientForm, searchParams }
)
export default class BasicForm extends Component {
  static propTypes = {
    form: PropTypes.object.isRequired,
    ieType: PropTypes.oneOf([ 'import', 'export' ]),
    tenantId: PropTypes.number.isRequired,
    clients: PropTypes.array.isRequired,
    tradeModes: PropTypes.array.isRequired,
    transModes: PropTypes.array.isRequired,
    declareWayModes: PropTypes.array.isRequired,
    searchClient: PropTypes.func.isRequired,
    setClientForm: PropTypes.func.isRequired,
    searchParams: PropTypes.func.isRequired,
  }
  handleClientSearch = (searched) => {
    this.props.searchClient(this.props.tenantId, searched);
  }
  handleClientChange = (value) => {
    if (typeof value === 'string') {
      return value;
    }
    const selPartnerId = Number(value);
    const clients = this.props.clients.filter(cl => cl.partner_id === selPartnerId);
    if (clients.length === 1) {
      const client = clients[0];
      this.props.setClientForm({ customer_tenant_id: client.tid, customer_partner_id: selPartnerId });
      return client.name;
    }
    return value;
  }
  handleParamSelect = (field, searched) => {
    this.props.searchParams(field, searched, this.props.tenantId, this.props.ieType);
  }
  render() {
    const { form: { getFieldProps }, clients, tradeModes, transModes, declareWayModes } = this.props;
    return (
      <Card title="基础信息">
        <Col sm={12}>
          <FormItem label="客户" {...formItemLayout}>
            <Select showSearch combobox showArrow={false} filterOption={false}
              defaultActiveFirstOption={false}
              onSearch={this.handleClientSearch}
              {...getFieldProps('customer_name', { rules: [{
                  required: true, message: '客户名称必填',
                }],
                getValueFromEvent: this.handleClientChange,
              })}
            >
            {
              clients.map(data => (<Option key={data.partner_id}
                value={data.partner_id}>{data.name}</Option>)
            )}
            </Select>
          </FormItem>
          <FormItem label="发票号" {...formItemLayout}>
            <Input {...getFieldProps('invoice_no')}/>
          </FormItem>
          <FormItem label="提运单号" {...formItemLayout}>
            <Input {...getFieldProps('bl_wb_no')}/>
          </FormItem>
          <FormItem label="备案号" {...formItemLayout}>
            <Input {...getFieldProps('ems_no')}/>
          </FormItem>
          <FormItem label="航名航次" {...formItemLayout}>
            <Input {...getFieldProps('voyage_no')}/>
          </FormItem>
          <FormItem label="件数" {...formItemLayout}>
            <Input {...getFieldProps('pieces')}/>
          </FormItem>
          <FormItem label="内部编号" {...formItemLayout}>
            <Input {...getFieldProps('internal_no')}/>
          </FormItem>
        </Col>
        <Col sm={12}>
          <FormItem label="报关类型" {...formItemLayout}>
            <SearchSelect field="decl_way_code" options={declareWayModes}
              onSearch={this.handleParamSelect} getFieldProps={getFieldProps}
            />
          </FormItem>
          <FormItem label="合同号" {...formItemLayout}>
            <Input {...getFieldProps('contract_no')}/>
          </FormItem>
          <FormItem label="运输方式" {...formItemLayout}>
            <SearchSelect field="trans_mode" options={transModes}
              onSearch={this.handleParamSelect} getFieldProps={getFieldProps}
            />
          </FormItem>
          <FormItem label="订单号" {...formItemLayout}>
            <Input {...getFieldProps('order_no')}/>
          </FormItem>
          <FormItem label="贸易方式" {...formItemLayout}>
            <SearchSelect field="trade_mode" options={tradeModes}
              onSearch={this.handleParamSelect} getFieldProps={getFieldProps}
            />
          </FormItem>
          <FormItem label="重量" {...formItemLayout}>
            <Input {...getFieldProps('weight')}/>
          </FormItem>
        </Col>
      </Card>
    );
  }
}
