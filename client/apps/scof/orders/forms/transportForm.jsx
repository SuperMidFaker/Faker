import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Button, Form, Row, Col, Card, Input, Select, Icon } from 'antd';
import RegionCascader from 'client/components/chinaRegionCascader';
import { setClientForm, loadFlowNodeData } from 'common/reducers/crmOrders';
import { uuidWithoutDash } from 'client/common/uuid';
import { GOODS_TYPES } from 'common/constants';
import { format } from 'client/common/i18n/helpers';
import messages from '../message.i18n';

const formatMsg = format(messages);
const FormItem = Form.Item;
const Option = Select.Option;
const InputGroup = Input.Group;

const formItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 18 },
};

@injectIntl
@connect(
  state => ({
    formRequires: state.crmOrders.formRequires,
  }),
  { setClientForm, loadFlowNodeData }
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
  componentDidMount() {
    const { formData, formRequires } = this.props;
    const node = formData.node;
    if (!node.uuid && node.node_uuid) {
      this.props.loadFlowNodeData(node.node_uuid, node.kind).then((result) => {
        if (!result.error) {
          const nodedata = result.data;
          const consigner = formRequires.consignerLocations.filter(cl => cl.node_id === nodedata.consigner_id)[0];
          const consignee = formRequires.consigneeLocations.filter(cl => cl.node_id === nodedata.consignee_id)[0];
          const transitMode = formRequires.transitModes.filter(tm => tm.mode_code === nodedata.transit_mode)[0];
          this.handleSetClientForm({
            consigner_id: nodedata.consigner_id,
            consigner_name: consigner && consigner.name,
            consigner_province: consigner && consigner.province,
            consigner_city: consigner && consigner.city,
            consigner_district: consigner && consigner.district,
            consigner_street: consigner && consigner.street,
            consigner_region_code: consigner && consigner.region_code,
            consigner_addr: consigner && consigner.addr,
            consigner_email: consigner && consigner.email,
            consigner_contact: consigner && consigner.contact,
            consigner_mobile: consigner && consigner.mobile,
            consignee_id: nodedata.consignee_id,
            consignee_name: consignee && consignee.name,
            consignee_province: consignee && consignee.province,
            consignee_city: consignee && consignee.city,
            consignee_district: consignee && consignee.district,
            consignee_street: consignee && consignee.street,
            consignee_region_code: consignee && consignee.region_code,
            consignee_addr: consignee && consignee.addr,
            consignee_email: consignee && consignee.email,
            consignee_contact: consignee && consignee.contact,
            consignee_mobile: consignee && consignee.mobile,
            pack_count: null,
            gross_wt: null,
            goods_type: nodedata.goods_type,
            trs_mode_id: transitMode && transitMode.id,
            trs_mode_code: nodedata.transit_mode,
            trs_mode: transitMode && transitMode.mode_name,
            remark: '',
            package: '',
            uuid: uuidWithoutDash() });
        }
      });
    }
  }
  msg = key => formatMsg(this.props.intl, key)
  handleSetClientForm = (data) => {
    const { index, formData } = this.props;
    const newData = { ...formData, node: { ...formData.node, ...data } };
    this.props.setClientForm(index, newData);
  }
  handleChange = (key, value) => {
    this.handleSetClientForm({ [key]: value });
  }
  handleConsignChange = (key, value) => {
    if (typeof value !== 'string') {
      return;
    }
    const consignForm = {};
    if (key === 'consigner_name') {
      const consign = this.props.formRequires.consignerLocations.find(item => item.name === value);
      if (consign) {
        consignForm.consigner_name = consign.name;
        consignForm.consigner_province = consign.province;
        consignForm.consigner_city = consign.city;
        consignForm.consigner_district = consign.district;
        consignForm.consigner_street = consign.street;
        consignForm.consigner_region_code = consign.region_code;
        consignForm.consigner_addr = consign.addr;
        consignForm.consigner_email = consign.email;
        consignForm.consigner_contact = consign.contact;
        consignForm.consigner_mobile = consign.mobile;
      } else if (!value) {
        consignForm.consigner_id = null;
        consignForm.consigner_name = null;
        consignForm.consigner_province = null;
        consignForm.consigner_city = null;
        consignForm.consigner_district = null;
        consignForm.consigner_street = null;
        consignForm.consigner_region_code = null;
        consignForm.consigner_addr = null;
        consignForm.consigner_email = null;
        consignForm.consigner_contact = null;
        consignForm.consigner_mobile = null;
      } else {
        consignForm.consigner_id = null;
      }
    } else if (key === 'consignee_name') {
      const consign = this.props.formRequires.consigneeLocations.find(item => item.name === value);
      if (consign) {
        consignForm.consignee_name = consign.name;
        consignForm.consignee_province = consign.province;
        consignForm.consignee_city = consign.city;
        consignForm.consignee_district = consign.district;
        consignForm.consignee_street = consign.street;
        consignForm.consignee_region_code = consign.region_code;
        consignForm.consignee_addr = consign.addr;
        consignForm.consignee_email = consign.email;
        consignForm.consignee_contact = consign.contact;
        consignForm.consignee_mobile = consign.mobile;
      } else if (!value) {
        consignForm.consignee_id = null;
        consignForm.consignee_name = null;
        consignForm.consignee_province = null;
        consignForm.consignee_city = null;
        consignForm.consignee_district = null;
        consignForm.consignee_street = null;
        consignForm.consignee_region_code = null;
        consignForm.consignee_addr = null;
        consignForm.consignee_email = null;
        consignForm.consignee_contact = null;
        consignForm.consignee_mobile = null;
      } else {
        consignForm.consignee_id = null;
      }
    }
    this.handleSetClientForm(consignForm);
  }
  handleConsignSelect = (key, value) => {
    const consignForm = {};
    if (key === 'consigner_name') {
      const consign = this.props.formRequires.consignerLocations.find(item => item.node_id === value);
      if (consign) {
        consignForm.consigner_id = consign.node_id;
        consignForm.consigner_name = consign.name;
        consignForm.consigner_province = consign.province;
        consignForm.consigner_city = consign.city;
        consignForm.consigner_district = consign.district;
        consignForm.consigner_street = consign.street;
        consignForm.consigner_region_code = consign.region_code;
        consignForm.consigner_addr = consign.addr;
        consignForm.consigner_email = consign.email;
        consignForm.consigner_contact = consign.contact;
        consignForm.consigner_mobile = consign.mobile;
      }
    } else if (key === 'consignee_name') {
      const consign = this.props.formRequires.consigneeLocations.find(item => item.node_id === value);
      if (consign) {
        consignForm.consignee_id = consign.node_id;
        consignForm.consignee_name = consign.name;
        consignForm.consignee_province = consign.province;
        consignForm.consignee_city = consign.city;
        consignForm.consignee_district = consign.district;
        consignForm.consignee_street = consign.street;
        consignForm.consignee_region_code = consign.region_code;
        consignForm.consignee_addr = consign.addr;
        consignForm.consignee_email = consign.email;
        consignForm.consignee_contact = consign.contact;
        consignForm.consignee_mobile = consign.mobile;
      }
    }
    this.handleSetClientForm(consignForm);
  }
  handleRegionValueChange = (consignType, region) => {
    const [code, province, city, district, street] = region;
    const consign = {};
    consign[`${consignType}_region_code`] = code;
    consign[`${consignType}_province`] = province;
    consign[`${consignType}_city`] = city;
    consign[`${consignType}_district`] = district;
    consign[`${consignType}_street`] = street;
    this.handleSetClientForm(consign);
  }
  handleTransmodeChange = (value) => {
    const transportMode = this.props.formRequires.transitModes.find(item => item.id === value);
    this.handleSetClientForm({
      trs_mode_id: transportMode.id,
      trs_mode_code: transportMode.mode_code,
      trs_mode: transportMode.mode_name,
    });
  }
  handleCommonFieldChange = (filed, value) => {
    this.handleSetClientForm({ [filed]: value });
  }

  render() {
    const { formRequires, formData } = this.props;
    const node = formData.node;
    const consignerRegion = [
      node.consigner_province, node.consigner_city,
      node.consigner_district, node.consigner_street,
    ];
    const consigneeRegion = [
      node.consignee_province, node.consignee_city,
      node.consignee_district, node.consignee_street,
    ];
    return (
      <Card>
        <Row>
          <Col sm={24}>
            <FormItem label="发货方">
              <Col span="6" style={{ paddingRight: 8 }}>
                <Select allowClear size="large" mode="combobox" showArrow value={node.consigner_id} optionLabelProp="children"
                  onChange={value => this.handleConsignChange('consigner_name', value)}
                  onSelect={value => this.handleConsignSelect('consigner_name', value)}
                >
                  {formRequires.consignerLocations.map(dw =>
                    <Option value={dw.node_id} key={dw.node_id}>{dw.name}</Option>)
                }
                </Select>
              </Col>
              <Col span="18">
                <InputGroup size="large">
                  <Col span="8">
                    <RegionCascader defaultRegion={consignerRegion} region={consignerRegion}
                      onChange={region => this.handleRegionValueChange('consigner', region)}
                    />
                  </Col>
                  <Col span="16">
                    <Input prefix={<Icon type="environment-o" />} value={node.consigner_addr}
                      onChange={e => this.handleChange('consigner_addr', e.target.value)}
                      addonAfter={<Button size="small" icon="contacts" />}
                    />
                  </Col>
                </InputGroup>
                <InputGroup size="large">
                  <Col span="8">
                    <Input prefix={<Icon type="user" />} value={node.consigner_contact}
                      onChange={e => this.handleChange('consigner_contact', e.target.value)}
                    />
                  </Col>
                  <Col span="8">
                    <Input prefix={<Icon type="mobile" />} value={node.consigner_mobile} type="tel"
                      onChange={e => this.handleChange('consigner_mobile', e.target.value)}
                    />
                  </Col>
                  <Col span="8">
                    <Input prefix={<Icon type="mail" />} value={node.consigner_email} type="email"
                      onChange={e => this.handleChange('consigner_email', e.target.value)}
                    />
                  </Col>
                </InputGroup>
              </Col>
            </FormItem>
          </Col>
          <Col sm={24}>
            <FormItem label="收货方">
              <Col span="6" style={{ paddingRight: 8 }}>
                <Select allowClear size="large" mode="combobox" showArrow value={node.consignee_id} optionLabelProp="children"
                  onChange={value => this.handleConsignChange('consignee_name', value)}
                  onSelect={value => this.handleConsignSelect('consignee_name', value)}
                >
                  {formRequires.consigneeLocations.map(dw =>
                    <Option value={dw.node_id} key={dw.node_id}>{dw.name}</Option>)
                }
                </Select>
              </Col>
              <Col span="18">
                <InputGroup size="large">
                  <Col span="8">
                    <RegionCascader defaultRegion={consigneeRegion} region={consigneeRegion}
                      onChange={region => this.handleRegionValueChange('consignee', region)}
                    />
                  </Col>
                  <Col span="16">
                    <Input prefix={<Icon type="environment-o" />} value={node.consignee_addr}
                      onChange={e => this.handleChange('consignee_addr', e.target.value)}
                      addonAfter={<Button size="small" icon="contacts" />}
                    />
                  </Col>
                </InputGroup>
                <InputGroup size="large">
                  <Col span="8">
                    <Input prefix={<Icon type="user" />} value={node.consignee_contact}
                      onChange={e => this.handleChange('consignee_contact', e.target.value)}
                    />
                  </Col>
                  <Col span="8">
                    <Input prefix={<Icon type="mobile" />} value={node.consignee_mobile} type="tel"
                      onChange={e => this.handleChange('consignee_mobile', e.target.value)}
                    />
                  </Col>
                  <Col span="8">
                    <Input prefix={<Icon type="mail" />} value={node.consignee_email} type="email"
                      onChange={e => this.handleChange('consignee_email', e.target.value)}
                    />
                  </Col>
                </InputGroup>
              </Col>
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem label="运输模式" {...formItemLayout} required="true">
              <Select value={node.trs_mode_id} onChange={this.handleTransmodeChange}>
                {formRequires.transitModes.map(
                  tm => <Option value={tm.id} key={`${tm.mode_code}${tm.id}`}>{tm.mode_name}</Option>
                )}
              </Select>
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem label="货物类型" {...formItemLayout}>
              <Select value={node.goods_type} onChange={value => this.handleCommonFieldChange('goods_type', value)}>
                {GOODS_TYPES.map(gt => <Option value={gt.value} key={gt.value}>{gt.text}</Option>)}
              </Select>
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem label="备注" {...formItemLayout}>
              <Input value={node.remark} onChange={e => this.handleCommonFieldChange('remark', e.target.value)} />
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem label={this.msg('packageNum')} {...formItemLayout}>
              <InputGroup compact>
                <Input type="number" style={{ width: '50%' }} value={node.pack_count} onChange={e => this.handleChange('pack_count', e.target.value)} />
                <Select size="large" style={{ width: '50%' }} placeholder="选择包装方式"
                  value={node.package} onChange={value => this.handleCommonFieldChange('package', value)}
                >
                  {formRequires.packagings.map(
                    pk => <Option value={pk.package_code} key={pk.package_code}>{pk.package_name}</Option>
                  )}
                </Select>
              </InputGroup>
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem label={this.msg('delgGrossWt')} {...formItemLayout}>
              <Input value={node.gross_wt} addonAfter="千克" type="number"
                onChange={e => this.handleCommonFieldChange('gross_wt', e.target.value)}
              />
            </FormItem>
          </Col>
        </Row>
      </Card>
    );
  }
}
