/* eslint react/no-multi-comp: 0 */
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { Form, Select, Input, Card, Col, Row } from 'antd';
import { setClientForm, searchParams } from 'common/reducers/cmsDelegation';
import { TENANT_ASPECT, GOODSTYPES } from 'common/constants';

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
      'invoice_no', 'contract_no', 'bl_wb_no', 'shipping_no', 'pieces', 'weight', 'trans_mode',
      'voyage_no', 'trade_mode', 'decl_way_code', 'customer_name', 'goods_type',
      'order_no', 'remark', 'manual_no',
    ].forEach(fd => {
      init[fd] = formData[fd] || '';
    });
    init.internal_no = aspect === TENANT_ASPECT.BO ? formData.ref_delg_external_no
      : formData.ref_recv_external_no;
  }
  return init;
}

class LocalSearchSelect extends React.Component {
  static propTypes = {
    options: PropTypes.array.isRequired,
    field: PropTypes.string.isRequired,
    getFieldProps: PropTypes.func.isRequired,
    searchKeyFn: PropTypes.func,
    initialValue: PropTypes.string,
    placeholder: PropTypes.string,
  }

  render() {
    const { options, field, initialValue, getFieldProps, placeholder, searchKeyFn } = this.props;
    return (
      <Select size="large" combobox={!!searchKeyFn} {...getFieldProps(field, { initialValue })}
        placeholder={placeholder} optionFilterProp={searchKeyFn ? 'search' : undefined}
      >
      {options.map(opt => (<Option key={opt.value} value={opt.value}
        search={searchKeyFn ? searchKeyFn(opt) : undefined}
      >{opt.text}</Option>))}
      </Select>
    );
  }
}

class RemoteSearchSelect extends React.Component {
  static propTypes = {
    options: PropTypes.array.isRequired,
    field: PropTypes.string.isRequired,
    getFieldProps: PropTypes.func.isRequired,
    onSearch: PropTypes.func,
    initialValue: PropTypes.string,
    placeholder: PropTypes.string,
  }

  handleSearch = (searched) => {
    const { field, onSearch } = this.props;
    if (onSearch) {
      onSearch(field, searched);
    }
  }
  render() {
    const { options, field, initialValue, getFieldProps, placeholder } = this.props;
    return (
      <Select size="large" filterOption={false} showSearch onSearch={this.handleSearch} {
        ...getFieldProps(field, { initialValue })}
        placeholder={placeholder}
      >
      {options.map(opt => <Option key={opt.value} value={opt.value}>{opt.text}</Option>)}
      </Select>
    );
  }
}

@connect(
  state => ({
    clients: state.cmsDelegation.formRequire.clients,
    tenantName: state.account.tenantName,
    // tradeModes: state.cmsDelegation.formRequire.tradeModes.map(tm => ({
    //   value: tm.value,
    //   text: `${tm.value} | ${tm.text}`,
    // })),
    // transModes: state.cmsDelegation.formRequire.transModes.map(tm => ({
    //   value: tm.value,
    //   text: `${tm.value} | ${tm.text}`,
    // })),
    // declareWayModes: state.cmsDelegation.formRequire.declareWayModes.map(dwm => ({
    //   value: dwm.value,
    //   text: `${dwm.value} | ${dwm.text}`,
    // })),
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
    tenantName: PropTypes.string.isRequired,
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
    // todo else search with nonempty getFieldsValue()
    if (searched) {
      this.props.searchParams(field, searched);
    }
  }
  render() {
    const { form: { getFieldProps }, fieldInits, clients, tenantName, partnershipType } = this.props;
    let customerName = {
      display: '',
      required: true,
    };
    let remarkDisplay = {
      display: '',
    };
    if (partnershipType === 'CCB') {
      customerName = {
        display: '',
        required: true,
      };
      remarkDisplay = {
        display: 'none',
      };
    } else if (partnershipType === 'CUS') {
      customerName = {
        display: 'none',
        required: false,
      };
      remarkDisplay = {
        display: '',
      };
    }
    return (
      <Card title="委托信息" bodyStyle={{ padding: 16 }}>
        <Row>
          <Col sm={8}>
            <FormItem label="委托方" {...formItemLayout} style={{ display: customerName.display }}>
              <Select size="large" combobox showArrow={false} optionFilterProp="search"
                placeholder="输入客户代码或名称"
                {...getFieldProps('customer_name', { rules: [{
                  required: customerName.required, message: '客户名称必填',
                }],
                  getValueFromEvent: this.handleClientChange,
                  initialValue: fieldInits.customer_name,
                })}
              >
              {
                clients.map(data => (<Option key={data.partner_id} value={data.partner_id}
                  search={`${data.partner_code}${data.name}`}
                >{data.name}</Option>)
              )}
              </Select>
            </FormItem>
            <FormItem label="运单号" {...formItemLayout}>
              <Input {...getFieldProps('shipping_no', {
                rules: [{ required: true, message: '运单号必填' }],
              })} />
            </FormItem>
            <FormItem label="总件数" {...formItemLayout}>
              <Input {...getFieldProps('pieces', {
                initialValue: fieldInits.pieces,
              })} />
            </FormItem>
            <FormItem label="申报单位" {...formItemLayout}>
              <Input disabled {...getFieldProps('ccb_name', {
                initialValue: tenantName,
              })} />
            </FormItem>
          </Col>
          <Col sm={8}>
            <FormItem label="客户订单号" {...formItemLayout}>
              <Input {...getFieldProps('order_no', {
                initialValue: fieldInits.order_no,
              })} />
            </FormItem>
            <FormItem label="航名/航次" {...formItemLayout}>
              <Input {...getFieldProps('voyage_no', {
                initialValue: fieldInits.voyage_no,
              })} />
            </FormItem>
            <FormItem label="总毛重" {...formItemLayout}>
              <Input {...getFieldProps('weight', {
                initialValue: fieldInits.weight,
              })} />
            </FormItem>
            <FormItem label="外部编号" {...formItemLayout}>
              <Input {...getFieldProps('internal_no', {
                initialValue: fieldInits.internal_no,
              })} />
            </FormItem>
          </Col>
          <Col sm={8}>
            <FormItem label="客户发票号" {...formItemLayout}>
              <Input {...getFieldProps('invoice_no', {
                initialValue: fieldInits.invoice_no,
              })} />
            </FormItem>
            <FormItem label="提运单号" {...formItemLayout}>
              <Input {...getFieldProps('bl_wb_no', {
                initialValue: fieldInits.bl_wb_no,
              })} />
            </FormItem>
            <FormItem label="货物类型" {...formItemLayout}>
              <Select {...getFieldProps('goods_type', {
                initialValue: fieldInits.goods_type,
                rules: [{ required: true, message: '货物类型必选', type: 'number' }],
              })}>
              {
                GOODSTYPES.map(gt =>
                  <Option value={gt.value} key={gt.value}>{gt.text}</Option>
                )
              }
              </Select>
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col>
          <FormItem label="备注" labelCol={{ span: 2 }} wrapperCol={{ span: 22 }}>
            <Input type="textarea" autosize={{ minRows: 3, maxRows: 16 }} {...getFieldProps('remark', {
              initialValue: fieldInits.remark,
            })} />
          </FormItem>
          </Col>
        </Row>
      </Card>
    );
  }
}
