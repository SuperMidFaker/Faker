import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { Form, Row, Col, Card, Input, Select, InputNumber } from 'antd';
import RegionCascade from 'client/components/region-cascade';
import { setClientForm } from 'common/reducers/crmOrders';
import { intlShape, injectIntl } from 'react-intl';
import messages from '../message.i18n';
import { format } from 'client/common/i18n/helpers';

const formatMsg = format(messages);
const FormItem = Form.Item;
const Option = Select.Option;

const formItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 18 },
};

@injectIntl
@connect(
  state => ({
    formRequires: state.crmOrders.formRequires,
  }),
  { setClientForm }
)
export default class TransportForm extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    index: PropTypes.number.isRequired,
    operation: PropTypes.oneOf(['view', 'edit', 'create']),
    formRequires: PropTypes.object.isRequired,
    formData: PropTypes.object.isRequired,
    setClientForm: PropTypes.func.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }

  msg = key => formatMsg(this.props.intl, key)
  handleSetClientForm = (data) => {
    const { index, formData } = this.props;
    const newData = { ...formData, ...data };
    this.props.setClientForm(index, newData);
  }
  handleAddRow = () => {
    const transport = {
      consigner_name: '',
      consigner_province: '',
      consigner_city: '',
      consigner_district: '',
      consigner_street: '',
      consigner_region_code: '',
      consigner_addr: '',
      consigner_email: '',
      consigner_contact: '',
      consigner_mobile: '',
      consignee_name: '',
      consignee_province: '',
      consignee_city: '',
      consignee_district: '',
      consignee_street: '',
      consignee_region_code: -1,
      consignee_addr: '',
      consignee_email: '',
      consignee_contact: '',
      consignee_mobile: '',
      pack_count: 1,
      gross_wt: 0,

      trs_mode_id: -1,
      trs_mode_code: '',
      trs_mode: '',
      remark: '',
      package: '',
    };

    const transports = [...this.props.formData.transports];

    const lastPos = transports.length - 1;
    transport.consigner_name = transports[lastPos].consigner_name;
    transport.consigner_province = transports[lastPos].consigner_province;
    transport.consigner_city = transports[lastPos].consigner_city;
    transport.consigner_district = transports[lastPos].consigner_district;
    transport.consigner_street = transports[lastPos].consigner_street;
    transport.consigner_region_code = transports[lastPos].consigner_region_code;
    transport.consigner_addr = transports[lastPos].consigner_addr;
    transport.consigner_email = transports[lastPos].consigner_email;
    transport.consigner_contact = transports[lastPos].consigner_contact;
    transport.consigner_mobile = transports[lastPos].consigner_mobile;

    transport.trs_mode_id = transports[lastPos].trs_mode_id;
    transport.trs_mode_code = transports[lastPos].trs_mode_code;
    transport.trs_mode = transports[lastPos].trs_mode;
    transport.package = transports[lastPos].package;

    transports.push(transport);
    this.handleSetClientForm({ transports });
  }
  handleRemoveRow(k) {
    const transports = [...this.props.formData.transports];
    transports.splice(k, 1);
    this.handleSetClientForm({ transports });
  }
  handleChange = (k, key, value) => {
    const transports = [...this.props.formData.transports];
    transports[k][key] = value;
    this.handleSetClientForm({ transports });
  }
  handleConsignChange = (k, key, value) => {
    const transports = [...this.props.formData.transports];
    if (typeof value === 'string') {
      transports[k][key] = value;
      if (key === 'consigner_name') {
        transports[k].consigner_province = '';
        transports[k].consigner_city = '';
        transports[k].consigner_district = '';
        transports[k].consigner_street = '';
        transports[k].consigner_region_code = -1;
        transports[k].consigner_addr = '';
        transports[k].consigner_email = '';
        transports[k].consigner_contact = '';
        transports[k].consigner_mobile = '';
      } else if (key === 'consignee_name') {
        transports[k].consignee_province = '';
        transports[k].consignee_city = '';
        transports[k].consignee_district = '';
        transports[k].consignee_street = '';
        transports[k].consignee_region_code = -1;
        transports[k].consignee_addr = '';
        transports[k].consignee_email = '';
        transports[k].consignee_contact = '';
        transports[k].consignee_mobile = '';
      }
    } else {
      let consign = {};
      if (key === 'consigner_name') {
        consign = this.props.formRequires.consignerLocations.find(item => item.node_id === value);
        transports[k].consigner_name = consign.name;
        transports[k].consigner_province = consign.province;
        transports[k].consigner_city = consign.city;
        transports[k].consigner_district = consign.district;
        transports[k].consigner_street = consign.street;
        transports[k].consigner_region_code = consign.region_code;
        transports[k].consigner_addr = consign.addr;
        transports[k].consigner_email = consign.email;
        transports[k].consigner_contact = consign.contact;
        transports[k].consigner_mobile = consign.mobile;
      } else if (key === 'consignee_name') {
        consign = this.props.formRequires.consigneeLocations.find(item => item.node_id === value);
        transports[k].consignee_name = consign.name;
        transports[k].consignee_province = consign.province;
        transports[k].consignee_city = consign.city;
        transports[k].consignee_district = consign.district;
        transports[k].consignee_street = consign.street;
        transports[k].consignee_region_code = consign.region_code;
        transports[k].consignee_addr = consign.addr;
        transports[k].consignee_email = consign.email;
        transports[k].consignee_contact = consign.contact;
        transports[k].consignee_mobile = consign.mobile;
      }
    }
    this.handleSetClientForm({ transports });
  }
  handleRegionValueChange = (k, consignType, region) => {
    const [code, province, city, district, street] = region;

    const transports = [...this.props.formData.transports];
    transports[k][`${consignType}_region_code`] = code;
    transports[k][`${consignType}_province`] = province;
    transports[k][`${consignType}_city`] = city;
    transports[k][`${consignType}_district`] = district;
    transports[k][`${consignType}_street`] = street;
    this.handleSetClientForm({ transports });
  }
  handleTransmodeChange = (value) => {
    const transportMode = this.props.formRequires.transitModes.find(item => item.id === value);
    const transports = this.props.formData.transports.map(item => ({
      ...item,
      trs_mode_id: transportMode.id,
      trs_mode_code: transportMode.mode_code,
      trs_mode: transportMode.mode_name,
    }));
    this.handleSetClientForm({ transports });
  }
  handleCommonFieldChange = (filed, value) => {
    const transports = this.props.formData.transports.map(item => ({
      ...item,
      [filed]: value,
    }));
    this.handleSetClientForm({ transports });
  }

  render() {
    const { formRequires, formData } = this.props;
    const index = 0;
    const transport = formData.transports[index];
    const transitMode = formData.transports.length > 0 ? formData.transports[index].trs_mode : '';
    const consignerRegion = [
      transport.consigner_province, transport.consigner_city,
      transport.consigner_district, transport.consigner_street,
    ];
    const consigneeRegion = [
      transport.consignee_province, transport.consignee_city,
      transport.consignee_district, transport.consignee_street,
    ];
    return (
      <Card>
        <Row>
          <Col span={6}>
            <FormItem label="运输模式" {...formItemLayout} required="true">
              <Select value={transitMode} onChange={this.handleTransmodeChange}>
                {formRequires.transitModes.map(
                  tm => <Option value={tm.id} key={`${tm.mode_code}${tm.id}`}>{tm.mode_name}</Option>
                )}
              </Select>
            </FormItem>
          </Col>
          <Col span={6}>
            <FormItem label="包装方式" {...formItemLayout}>
              <Select value={transport.package} onChange={value => this.handleCommonFieldChange('package', value)}>
                {formRequires.packagings.map(
                  pk => <Option value={pk.package_code} key={pk.package_code}>{pk.package_name}</Option>
                )}
              </Select>
            </FormItem>
          </Col>
          <Col span={6}>
            <FormItem label={this.msg('packageNum')} {...formItemLayout}>
              <InputNumber min={1} style={{ width: '100%' }} value={transport.pack_count}
                onChange={value => this.handleCommonFieldChange('pack_count', value)}
              />
            </FormItem>
          </Col>
          <Col span={6}>
            <FormItem label={this.msg('delgGrossWt')} {...formItemLayout}>
              <Input value={transport.gross_wt} addonAfter="千克" type="number"
                onChange={e => this.handleCommonFieldChange('gross_wt', e.target.value)}
              />
            </FormItem>
          </Col>
        </Row>

        <Row>
          <Col sm={6}>
            <FormItem
              label="发货方"
              {...formItemLayout}
            >
              <Select combobox value={transport.consigner_name} onChange={value => this.handleConsignChange(index, 'consigner_name', value)}>
                {formRequires.consignerLocations.map(dw =>
                  <Option value={dw.node_id} key={dw.node_id}>{dw.name}</Option>)
                }
              </Select>
            </FormItem>
          </Col>
          <Col sm={6}>
            <FormItem label="始发地" {...formItemLayout}>
              <RegionCascade defaultRegion={consignerRegion} region={consignerRegion}
                onChange={region => this.handleRegionValueChange(index, 'consigner', region)}
                style={{ width: '100%' }}
              />
            </FormItem>
          </Col>
          <Col sm={12}>
            <FormItem label="提货地址" labelCol={{ span: 3 }} wrapperCol={{ span: 21 }}>
              <Input value={transport.consigner_addr}
                onChange={e => this.handleChange(index, 'consigner_addr', e.target.value)}
              />
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col sm={6}>
            <FormItem label="联系人" {...formItemLayout}>
              <Input value={transport.consigner_contact}
                onChange={e => this.handleChange(index, 'consigner_contact', e.target.value)}
              />
            </FormItem>
          </Col>
          <Col sm={6}>
            <FormItem label="电话" {...formItemLayout}>
              <Input value={transport.consigner_mobile} type="tel"
                onChange={e => this.handleChange(index, 'consigner_mobile', e.target.value)}
              />
            </FormItem>
          </Col>
          <Col sm={6}>
            <FormItem label="邮箱" {...formItemLayout}>
              <Input value={transport.consigner_email} type="email"
                onChange={e => this.handleChange(index, 'consigner_email', e.target.value)}
              />
            </FormItem>
          </Col>
        </Row>

        <Row>
          <Col sm={6}>
            <FormItem
              label="收货方"
              {...formItemLayout}
            >
              <Select combobox value={transport.consignee_name} onChange={value => this.handleConsignChange(index, 'consignee_name', value)}>
                {formRequires.consigneeLocations.map(dw =>
                  <Option value={dw.node_id} key={dw.node_id}>{dw.name}</Option>)
                }
              </Select>
            </FormItem>
          </Col>
          <Col sm={6}>
            <FormItem label="目的地" {...formItemLayout}>
              <RegionCascade defaultRegion={consigneeRegion} region={consigneeRegion}
                onChange={region => this.handleRegionValueChange(index, 'consignee', region)}
                style={{ width: '100%' }}
              />
            </FormItem>
          </Col>
          <Col sm={12}>
            <FormItem label="送货地址" labelCol={{ span: 3 }} wrapperCol={{ span: 21 }}>
              <Input value={transport.consignee_addr}
                onChange={e => this.handleChange(index, 'consignee_addr', e.target.value)}
              />
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col sm={6}>
            <FormItem label="联系人" {...formItemLayout}>
              <Input value={transport.consignee_contact}
                onChange={e => this.handleChange(index, 'consignee_contact', e.target.value)}
              />
            </FormItem>
          </Col>
          <Col sm={6}>
            <FormItem label="电话" {...formItemLayout}>
              <Input value={transport.consignee_mobile} type="tel"
                onChange={e => this.handleChange(index, 'consignee_mobile', e.target.value)}
              />
            </FormItem>
          </Col>
          <Col sm={6}>
            <FormItem label="邮箱" {...formItemLayout}>
              <Input value={transport.consignee_email} type="email"
                onChange={e => this.handleChange(index, 'consignee_email', e.target.value)}
              />
            </FormItem>
          </Col>
        </Row>

        <Row>
          <Col span={18}>
            <FormItem label="备注" labelCol={{ span: 2 }} wrapperCol={{ span: 22 }}>
              <Input value={transport.remark} onChange={e => this.handleCommonFieldChange('remark', e.target.value)} />
            </FormItem>
          </Col>
        </Row>
      </Card>
    );
  }
}
