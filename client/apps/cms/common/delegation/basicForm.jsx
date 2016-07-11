import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { Form, Select, Input, Card, Col } from 'ant-ui';
import { setClientForm, searchParams } from 'common/reducers/cmsDelegation';
import { TENANT_ASPECT } from 'common/constants';

const FormItem = Form.Item;
const Option = Select.Option;
const formItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 18 },
};

function getFieldInits(aspect, formData) {
  const init = {};
  if (formData) {
    [
      `invoice_no`, `contract_no`, `bl_wb_no`, `pieces`, `weight`, `trans_mode`,
      `voyage_no`, `trade_mode`, `decl_way_code`, `ems_no`, `customer_name`,
      'order_no',
    ].forEach(fd => init[fd] = formData[fd]);
    init.internal_no = aspect === TENANT_ASPECT.BO ? formData.ref_delg_external_no
      : formData.ref_recv_external_no;
  }
  return init;
}

function LocalSearchSelect(props) {
  const { options, field, initialValue, getFieldProps, placeholder, searchKeyFn } = props;
  return (
    <Select size="large" combobox={!!searchKeyFn} {...getFieldProps(field, { initialValue })}
      placeholder={placeholder} optionFilterProp={ searchKeyFn ? 'search' : undefined}
    >
    {options.map(opt => (<Option key={opt.value} value={opt.value}
      search={searchKeyFn ? searchKeyFn(opt) : undefined}>{opt.text}</Option>))}
    </Select>
  );
}

LocalSearchSelect.propTypes = {
  options: PropTypes.array.isRequired,
  field: PropTypes.string.isRequired,
  getFieldProps: PropTypes.func.isRequired,
  searchKeyFn: PropTypes.func,
  initialValue: PropTypes.string,
  placeholder: PropTypes.string,
};

function RemoteSearchSelect(props) {
  const { options, field, initialValue, getFieldProps, onSearch, placeholder } = props;
  function handleSearch(searched) {
    if (onSearch) {
      onSearch(field, searched);
    }
  }
  return (
    <Select size="large" filterOption={false} showSearch onSearch={handleSearch} {
      ...getFieldProps(field, { initialValue })} defaultActiveFirstOption
      placeholder={placeholder}
    >
    {options.map(opt => <Option key={opt.value} value={opt.value}>{opt.text}</Option>)}
    </Select>
  );
}

RemoteSearchSelect.propTypes = {
  options: PropTypes.array.isRequired,
  field: PropTypes.string.isRequired,
  getFieldProps: PropTypes.func.isRequired,
  onSearch: PropTypes.func,
  initialValue: PropTypes.string,
  placeholder: PropTypes.string,
};

@connect(
  state => ({
    clients: state.cmsDelegation.formRequire.clients,
    tradeModes: state.cmsDelegation.formRequire.tradeModes.map(tm => ({
      value: tm.value,
      text: `${tm.value} | ${tm.text}`,
    })),
    transModes: state.cmsDelegation.formRequire.transModes.map(tm => ({
      value: tm.value,
      text: `${tm.value} | ${tm.text}`,
    })),
    declareWayModes: state.cmsDelegation.formRequire.declareWayModes.map(dwm => ({
      value: dwm.value,
      text: `${dwm.value} | ${dwm.text}`,
    })),
    fieldInits: getFieldInits(state.account.aspect, state.cmsDelegation.formData),
  }),
  { setClientForm, searchParams }
)
export default class BasicForm extends Component {
  static propTypes = {
    form: PropTypes.object.isRequired,
    fieldInits: PropTypes.object.isRequired,
    clients: PropTypes.array.isRequired,
    tradeModes: PropTypes.array.isRequired,
    transModes: PropTypes.array.isRequired,
    declareWayModes: PropTypes.array.isRequired,
    setClientForm: PropTypes.func.isRequired,
    searchParams: PropTypes.func.isRequired,
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
  handleTradeModeSearch = (field, searched) => {
    this.props.searchParams(field, searched);
  }
  render() {
    const { form: { getFieldProps }, fieldInits, clients, tradeModes, transModes, declareWayModes } = this.props;
    return (
      <Card title="基础信息">
        <Col sm={12}>
          <FormItem label="客户" {...formItemLayout}>
            <Select size="large" combobox showArrow={false} optionFilterProp="search"
              placeholder="输入客户代码或名称"
              {...getFieldProps('customer_name', { rules: [{
                  required: true, message: '客户名称必填',
                }],
                getValueFromEvent: this.handleClientChange,
                initialValue: fieldInits.customer_name,
              })}
            >
            {
              clients.map(data => (<Option key={data.partner_id} value={data.partner_id}
                search={`${data.partner_code}${data.name}`}>{data.name}</Option>)
            )}
            </Select>
          </FormItem>
          <FormItem label="发票号" {...formItemLayout}>
            <Input {...getFieldProps('invoice_no', {
              initialValue: fieldInits.invoice_no,
            })}/>
          </FormItem>
          <FormItem label="提运单号" {...formItemLayout}>
            <Input {...getFieldProps('bl_wb_no', {
              initialValue: fieldInits.bl_wb_no,
            })}/>
          </FormItem>
          <FormItem label="备案号" {...formItemLayout}>
            <Input {...getFieldProps('ems_no', {
              initialValue: fieldInits.ems_no,
            })}/>
          </FormItem>
          <FormItem label="航名航次" {...formItemLayout}>
            <Input {...getFieldProps('voyage_no', {
              initialValue: fieldInits.voyage_no,
            })}/>
          </FormItem>
          <FormItem label="件数" {...formItemLayout}>
            <Input {...getFieldProps('pieces', {
              initialValue: fieldInits.pieces,
            })}/>
          </FormItem>
          <FormItem label="内部编号" {...formItemLayout}>
            <Input {...getFieldProps('internal_no', {
              initialValue: fieldInits.internal_no,
            })}/>
          </FormItem>
        </Col>
        <Col sm={12}>
          <FormItem label="报关类型" {...formItemLayout}>
            <LocalSearchSelect field="decl_way_code" options={declareWayModes}
              getFieldProps={getFieldProps}
              initialValue={fieldInits.decl_way_code}
            />
          </FormItem>
          <FormItem label="合同号" {...formItemLayout}>
            <Input {...getFieldProps('contract_no', {
              initialValue: fieldInits.contract_no,
            })}/>
          </FormItem>
          <FormItem label="运输方式" {...formItemLayout}>
            <LocalSearchSelect field="trans_mode" options={transModes}
              getFieldProps={getFieldProps}
              initialValue={fieldInits.trans_mode}
            />
          </FormItem>
          <FormItem label="订单号" {...formItemLayout}>
            <Input {...getFieldProps('order_no', {
              initialValue: fieldInits.order_no,
            })}/>
          </FormItem>
          <FormItem label="贸易方式" {...formItemLayout}>
            <RemoteSearchSelect field="trade_mode" options={tradeModes}
              onSearch={this.handleTradeModeSearch} getFieldProps={getFieldProps}
              initialValue={fieldInits.trade_mode} placeholder="输入代码查询"
            />
          </FormItem>
          <FormItem label="重量" {...formItemLayout}>
            <Input {...getFieldProps('weight', {
              initialValue: fieldInits.weight,
            })}/>
          </FormItem>
        </Col>
      </Card>
    );
  }
}
