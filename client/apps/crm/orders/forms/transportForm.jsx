import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { Form, Row, Col, Card, Input, Button, Select, InputNumber, Popover } from 'antd';
import RegionCascade from 'client/components/region-cascade';
import { setClientForm } from 'common/reducers/crmOrders';
import { intlShape, injectIntl } from 'react-intl';
import messages from '../message.i18n';
import { format } from 'client/common/i18n/helpers';
import ConsignInfo from './consignInfo';
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
    formData: state.crmOrders.formData,
    formRequires: state.crmOrders.formRequires,
  }),
  { setClientForm }
)

export default class TransportForm extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    operation: PropTypes.oneOf(['view', 'edit', 'create']),
    formRequires: PropTypes.object.isRequired,
    formData: PropTypes.object.isRequired,
    setClientForm: PropTypes.func.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }

  msg = key => formatMsg(this.props.intl, key)

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
      trs_bulk_container: '',
    };

    const transports = [...this.props.formData.transports];
    if (transports.length > 0) {
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
      transport.trs_bulk_container = transports[lastPos].trs_bulk_container;
    }
    transports.push(transport);
    this.props.setClientForm({ transports });
  }
  handleRemoveRow(k) {
    const transports = [...this.props.formData.transports];
    transports.splice(k, 1);
    this.props.setClientForm({ transports });
  }
  handleChange = (k, key, value) => {
    const transports = [...this.props.formData.transports];
    transports[k][key] = value;
    this.props.setClientForm({ transports });
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
    this.props.setClientForm({ transports });
  }
  handleRegionValueChange = (k, consignType, region) => {
    const [code, province, city, district, street] = region;

    const transports = [...this.props.formData.transports];
    transports[k][`${consignType}_region_code`] = code;
    transports[k][`${consignType}_province`] = province;
    transports[k][`${consignType}_city`] = city;
    transports[k][`${consignType}_district`] = district;
    transports[k][`${consignType}_street`] = street;
    this.props.setClientForm({ transports });
  }
  handleTransmodeChange = (value) => {
    const transportMode = this.props.formRequires.transitModes.find(item => item.id === value);
    const transports = this.props.formData.transports.map((item) => {
      return {
        ...item,
        trs_mode_id: transportMode.id,
        trs_mode_code: transportMode.mode_code,
        trs_mode: transportMode.mode_name,
      };
    });
    this.props.setClientForm({ transports });
  }
  renderConsign = (consignType, consign, index) => {
    const title = consignType === 'consigner' ? '发货方' : '收货方';
    const consignRegion = [
      consign[`${consignType}_province`], consign[`${consignType}_city`],
      consign[`${consignType}_district`], consign[`${consignType}_street`],
    ];
    const content = (
      <div style={{ width: 250 }}>
        <FormItem label="目的地" {...formItemLayout}>
          <RegionCascade defaultRegion={consignRegion} region={consignRegion}
            onChange={region => this.handleRegionValueChange(index, consignType, region)}
            style={{ width: '100%' }}
          />
        </FormItem>
        <FormItem label="送货地址" {...formItemLayout}>
          <Input value={consign[`${consignType}_addr`]}
            onChange={e => this.handleChange(index, `${consignType}_addr`, e.target.value)}
          />
        </FormItem>
        <FormItem label="联系人" {...formItemLayout}>
          <Input value={consign[`${consignType}_contact`]}
            onChange={e => this.handleChange(index, `${consignType}_contact`, e.target.value)}
          />
        </FormItem>
        <FormItem label="电话" {...formItemLayout}>
          <Input value={consign[`${consignType}_mobile`]} type="tel"
            onChange={e => this.handleChange(index, `${consignType}_mobile`, e.target.value)}
          />
        </FormItem>
        <FormItem label="邮箱" {...formItemLayout}>
          <Input value={consign[`${consignType}_email`]} type="email"
            onChange={e => this.handleChange(index, `${consignType}_email`, e.target.value)}
          />
        </FormItem>

      </div>);
    return (
      <Popover content={content} title={title} placement="topRight" trigger="click">
        <a type="primary">{title}</a>
      </Popover>
    );
  }
  render() {
    const { formRequires, formData } = this.props;
    const transitMode = formData.transports.length > 0 ? formData.transports[0].trs_mode : '';
    const formItems = formData.transports.map((item, k) => {
      return (
        <Row key={k} style={{ marginBottom: 8 }}>
          <Col sm={6}>
            <FormItem
              label={
                <ConsignInfo
                  consignType="consigner"
                  consign={item}
                  index={k}
                  handleRegionValueChange={this.handleRegionValueChange}
                  handleChange={this.handleChange}
                />}
              {...formItemLayout}
            >
              <Select combobox value={item.consigner_name} onChange={value => this.handleConsignChange(k, 'consigner_name', value)}>
                {formRequires.consignerLocations.map(dw =>
                  <Option value={dw.node_id} key={dw.node_id}>{dw.name}</Option>)
              }
              </Select>
            </FormItem>
          </Col>
          <Col sm={6}>
            <FormItem
              label={
                <ConsignInfo
                  consignType="consignee"
                  consign={item}
                  index={k}
                  handleRegionValueChange={this.handleRegionValueChange}
                  handleChange={this.handleChange}
                />}
              {...formItemLayout}
            >
              <Select combobox value={item.consignee_name} onChange={value => this.handleConsignChange(k, 'consignee_name', value)}>
                {formRequires.consigneeLocations.map(dw =>
                  <Option value={dw.node_id} key={dw.node_id}>{dw.name}</Option>)
              }
              </Select>
            </FormItem>
          </Col>
          <Col sm={5}>
            <FormItem label={this.msg('packageNum')} {...formItemLayout}>
              <InputNumber min={1} style={{ width: '100%' }} value={item.pack_count}
                onChange={value => this.handleChange(k, 'pack_count', value)}
              />
            </FormItem>
          </Col>
          <Col sm={5}>
            <FormItem label={this.msg('delgGrossWt')} {...formItemLayout}>
              <Input value={item.gross_wt} addonAfter="公斤" type="number"
                onChange={e => this.handleChange(k, 'gross_wt', e.target.value)}
              />
            </FormItem>
          </Col>
          <Col span={1} offset={1}>
            {formData.transports.length > 1 ?
              <Button type="ghost" shape="circle" onClick={() => this.handleRemoveRow(k)} icon="delete" />
            : null
            }
          </Col>
        </Row>
      );
    });
    return (
      <Card>
        <Row>
          <Col sm={6}>
            <FormItem label="运输模式" {...formItemLayout} required="true">
              <Select value={transitMode} onChange={this.handleTransmodeChange}>
                {formRequires.transitModes.map(
                  tm => <Option value={tm.id} key={`${tm.mode_code}${tm.id}`}>{tm.mode_name}</Option>
                )}
              </Select>
            </FormItem>
          </Col>
        </Row>
        {formItems}
        <div style={{ marginTop: 8 }}>
          <Button type="dashed" size="large" onClick={this.handleAddRow} icon="plus" style={{ width: '100%' }}>
            {this.msg('addMore')}
          </Button>
        </div>
      </Card>
    );
  }
}
