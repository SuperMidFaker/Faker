import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { connect } from 'react-redux';
import { Button, Card, DatePicker, Form, Icon, Input, Select, Row, Col, message } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import InfoItem from 'client/components/InfoItem';
import FormPane from 'client/components/FormPane';
import { loadCiqDeclHead, searchOrganizations, searchWorldPorts, searchChinaPorts, searchCountries,
   setFixedCountry, setFixedOrganizations, setFixedWorldPorts, updateCiqHeadField, loadCiqParams, searchCustoms } from 'common/reducers/cmsCiqDeclare';
import { loadCmsBrokers } from 'common/reducers/cmsBrokers';
import { loadBusinessUnits } from 'common/reducers/cmsResources';
import { FormRemoteSearchSelect } from '../../common/form/formSelect';
import { CiqCodeAutoCompSelect } from '../../common/form/headFormItems';
import { format } from 'client/common/i18n/helpers';
import messages from '../message.i18n';
import { CIQ_IN_DECL_TYPE, CIQ_OUT_DECL_TYPE, CIQ_SPECIAL_DECL_FLAG, CIQ_SPECIAL_PASS_FLAG, CIQ_TRANSPORTS_TYPE } from 'common/constants';

const formatMsg = format(messages);
const FormItem = Form.Item;
const InputGroup = Input.Group;
const Option = Select.Option;
const { TextArea } = Input;
const ButtonGroup = Button.Group;

@injectIntl
@connect(
  state => ({
    organizations: state.cmsCiqDeclare.ciqParams.organizations,
    currencies: state.cmsCiqDeclare.ciqParams.currencies,
    worldPorts: state.cmsCiqDeclare.ciqParams.worldPorts,
    chinaPorts: state.cmsCiqDeclare.ciqParams.chinaPorts,
    countries: state.cmsCiqDeclare.ciqParams.countries,
    units: state.cmsCiqDeclare.ciqParams.units,
    customs: state.cmsCiqDeclare.ciqParams.customs,
    ciqDeclHead: state.cmsCiqDeclare.ciqDeclHead.head,
    brokers: state.cmsBrokers.brokers,
    businessUnits: state.cmsResources.businessUnits,
    fixedCountries: state.cmsCiqDeclare.ciqParams.fixedCountries,
    fixedOrganizations: state.cmsCiqDeclare.ciqParams.fixedOrganizations,
    fixedWorldPorts: state.cmsCiqDeclare.ciqParams.fixedWorldPorts,
  }),
  { loadCiqDeclHead,
    searchOrganizations,
    searchWorldPorts,
    searchChinaPorts,
    searchCountries,
    loadCmsBrokers,
    loadBusinessUnits,
    setFixedCountry,
    setFixedOrganizations,
    setFixedWorldPorts,
    updateCiqHeadField,
    loadCiqParams,
    searchCustoms,
  }
)
export default class CiqDeclHeadPane extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    ioType: PropTypes.string.isRequired,
    form: PropTypes.object.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  componentDidMount() {
    this.props.loadCiqDeclHead(this.context.router.params.declNo).then((result) => {
      if (!result.error) {
        this.props.loadBusinessUnits({ customerPartnerId: this.props.ciqDeclHead.owner_cuspartner_id });
      }
    });
    this.props.loadCmsBrokers();
    this.props.loadCiqParams();
  }
  msg = (descriptor, values) => formatMsg(this.props.intl, descriptor, values)
  handleSearchOrg = (field, value) => {
    if (value) {
      this.props.searchOrganizations(value);
    }
  }
  handleSearchWorldPorts = (field, value) => {
    if (value) {
      this.props.searchWorldPorts(value);
    }
  }
  handleSearchChinaPorts = (field, value) => {
    if (value) {
      this.props.searchChinaPorts(value);
    }
  }
  handleSearchCountries = (field, value) => {
    if (value) {
      this.props.searchCountries(value);
    }
  }
  handleSearchCus = (field, value) => {
    if (value) {
      this.props.searchCustoms(value);
    }
  }
  handleAgentSelect = (value) => {
    const { form, brokers } = this.props;
    const broker = brokers.find(bk => bk.ciq_code === value);
    form.setFieldsValue({ agent_name: broker.comp_name });
  };
  handleConsigneeSelect = (codeField, cnameField, enameField, value) => {
    const { businessUnits, form } = this.props;
    const consignee = businessUnits.find(unit => unit.ciq_code === value);
    form.setFieldsValue({
      [cnameField]: consignee.comp_name,
    });
  }
  handleConsignorSelect = (codeField, cnameField, enameField, value) => {
    const { businessUnits, form } = this.props;
    const consignor = businessUnits.find(unit => unit.ciq_code === value);
    form.setFieldsValue({
      [cnameField]: consignor.comp_name,
    });
  }
  handleCountrySelect = (value) => {
    const { fixedCountries, countries } = this.props;
    const country = countries.find(coun => coun.country_code === value);
    if (!(fixedCountries.find(coun => coun.country_code === country.country_code))) {
      fixedCountries.push(country);
    }
    this.props.setFixedCountry(fixedCountries);
  }
  handleOrganizationSelect = (value) => {
    const { fixedOrganizations, organizations } = this.props;
    const organization = organizations.find(org => org.org_code === value);
    if (!(fixedOrganizations.find(org => org.org_code === organization.org_code))) {
      fixedOrganizations.push(organization);
    }
    this.props.setFixedOrganizations(fixedOrganizations);
  }
  handleWorldPortsSelect = (value) => {
    const { fixedWorldPorts, worldPorts } = this.props;
    const port = worldPorts.find(po => po.port_code === value);
    if (!(fixedWorldPorts.find(po => po.port_code === port.port_code))) {
      fixedWorldPorts.push(port);
    }
    this.props.setFixedWorldPorts(fixedWorldPorts);
  }
  handleEdit = (field, value) => {
    if (field === 'ciq_decl_no' && value.length !== 15) {
      message.error('报检号不为15位');
      return;
    }
    if (field === 'ciq_cl_no' && value.length !== 18) {
      message.error('通关单号不为18位');
      return;
    }
    this.props.updateCiqHeadField(field, value, this.props.ciqDeclHead.pre_entry_seq_no);
  }
  render() {
    const { ioType, organizations, countries, worldPorts, chinaPorts, ciqDeclHead, form,
       form: { getFieldDecorator }, brokers, intl, businessUnits, customs } = this.props;
    const formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 8 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 16 },
      },
      colon: false,
    };
    const formItemSpan2Layout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 4 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 20 },
      },
      colon: false,
    };
    const addonAfter = (<ButtonGroup size="small">
      <Button type="primary" ghost><Icon type="left" /></Button>
      <Button type="primary" ghost><Icon type="right" /></Button>
      <Button type="primary" ghost><Icon type="ellipsis" /></Button>
    </ButtonGroup>);
    const header = (<Row>
      <Col span="6">
        <InfoItem size="small" field={ciqDeclHead.ciq_decl_no} placeholder="点击回填"
          addonBefore={this.msg('报检号')} editable={!ciqDeclHead.ciq_decl_no} onEdit={value => this.handleEdit('ciq_decl_no', value)}
        />
      </Col>
      <Col span="6">
        <InfoItem size="small" field={ciqDeclHead.ciq_cl_no} placeholder="点击回填"
          addonBefore={this.msg('通关单号')} editable={!ciqDeclHead.ciq_cl_no} onEdit={value => this.handleEdit('ciq_cl_no', value)}
        />
      </Col>
    </Row>);
    return (
      <FormPane header={header} fullscreen={this.props.fullscreen} hideRequiredMark>
        <Card bodyStyle={{ padding: 16, paddingBottom: 0 }} hoverable={false}>
          <Row>
            <Col span="6">
              {ioType === 'in' && <FormItem {...formItemLayout} label={'报检类别'} required >
                  {getFieldDecorator('ciq_decl_type', {
                    initialValue: ciqDeclHead.ciq_decl_type,
                  })(
                    <Select>
                      {CIQ_IN_DECL_TYPE.map(type => <Option key={type.value}>{type.value} | {type.text}</Option>)}
                    </Select>
                )}
                </FormItem>}
              {ioType === 'out' && <FormItem {...formItemLayout} label={'报检类别'} required >
                  {getFieldDecorator('ciq_decl_type', {
                    initialValue: ciqDeclHead.ciq_decl_type,
                  })(
                    <Select>
                      {CIQ_OUT_DECL_TYPE.map(type => <Option key={type.value}>{type.value} | {type.text}</Option>)}
                    </Select>
                )}
                </FormItem>}
            </Col>
            <FormRemoteSearchSelect outercol={6} label={<span><Icon type="safety" />报检地</span>} col={8} field="ciq_org_code"
              getFieldDecorator={form.getFieldDecorator} formData={ciqDeclHead} required
              options={organizations.map(org => ({
                value: org.org_code,
                text: `${org.org_code} | ${org.org_name}`,
                search: `${org.org_code}${org.org_name}`,
              }))} onSearch={this.handleSearchOrg} onSelect={this.handleOrganizationSelect}
            />
            <FormRemoteSearchSelect outercol={6} label={<span><Icon type="safety" />口岸机构</span>} col={8} field="ciq_insp_orgcode"
              getFieldDecorator={form.getFieldDecorator} formData={ciqDeclHead} required
              options={organizations.map(org => ({
                value: org.org_code,
                text: `${org.org_code} | ${org.org_name}`,
                search: `${org.org_code}${org.org_name}`,
              }))} onSearch={this.handleSearchOrg} onSelect={this.handleOrganizationSelect}
            />
            <Col span="6">
              <FormItem {...formItemLayout} label={'报检日期'} required >
                {getFieldDecorator('ciq_decl_date', {
                  initialValue: ciqDeclHead.ciq_decl_date && moment(ciqDeclHead.ciq_decl_date),
                })(
                  <DatePicker style={{ width: '100%' }} format="YYYY/MM/DD" />
                )}
              </FormItem>
            </Col>
          </Row>
          <Row>
            <Col span="12">
              <FormItem {...formItemSpan2Layout} label={'报检单位'} required >
                <InputGroup compact>
                  {getFieldDecorator('agent_ciq_code', {
                    initialValue: ciqDeclHead.agent_ciq_code,
                  })(
                    <Select style={{ width: '30%' }} onSelect={this.handleAgentSelect}>
                      {brokers.map(bk => (<Option key={bk.ciq_code}>
                        {bk.ciq_code}
                      </Option>))}
                    </Select>
                  )}
                  {getFieldDecorator('agent_name', {
                    initialValue: ciqDeclHead.agent_name,
                  })(
                    <Input style={{ width: '70%' }} />
                  )}
                </InputGroup>
              </FormItem>
            </Col>
            <Col span="6">
              <FormItem {...formItemLayout} label={'报检员'} >
                <InputGroup compact>
                  {getFieldDecorator('agent_ciq_person_certno', {
                    initialValue: ciqDeclHead.agent_ciq_person_certno,
                  })(
                    <Input placeholder="编码" style={{ width: '50%' }} />
                  )}
                  {getFieldDecorator('agent_ciq_person', {
                    initialValue: ciqDeclHead.agent_ciq_person,
                  })(
                    <Input prefix={<Icon type="user" />} placeholder="姓名" value={ciqDeclHead.agent_ciq_person} style={{ width: '50%' }} />
                  )}
                </InputGroup>
              </FormItem>
            </Col>
            <Col span="6">
              <FormItem {...formItemLayout} label={'联系人'} >
                <InputGroup compact>
                  {getFieldDecorator('agent_ciq_contact', {
                    initialValue: ciqDeclHead.agent_ciq_contact,
                  })(
                    <Input prefix={<Icon type="user" />} placeholder="姓名" style={{ width: '50%' }} />
                  )}
                  {getFieldDecorator('agent_ciq_tel', {
                    initialValue: ciqDeclHead.agent_ciq_tel,
                  })(
                    <Input prefix={<Icon type="phone" />} placeholder="电话" style={{ width: '50%' }} />
                  )}
                </InputGroup>
              </FormItem>
            </Col>
          </Row>
          {ioType === 'in' && <Row>
            <Col span="18">
              <CiqCodeAutoCompSelect labelCol="3" label="收货人" formData={ciqDeclHead}
                codeField="ciq_consignee_code"
                cnameField="ciq_consignee_name_cn"
                enameField="ciq_consignee_name_en"
                getFieldDecorator={form.getFieldDecorator}
                getFieldValue={form.getFieldValue}
                options={businessUnits.map(bu => ({
                  ciqcode: bu.ciq_code,
                  name: bu.comp_name,
                  code: bu.customs_code,
                }))} intl={intl} onSelect={this.handleConsigneeSelect}
              />
            </Col>
            <Col span="6">
              <FormItem {...formItemLayout} label={'企业资质'} >
                <Input addonAfter={addonAfter} />
              </FormItem>
            </Col>
            </Row>}
          {ioType === 'in' && <Row>
            <Col span="18">
              <CiqCodeAutoCompSelect labelCol="3" label="发货人" formData={ciqDeclHead}
                codeField="ciq_consignor_code"
                cnameField="ciq_consignor_name_cn"
                enameField="ciq_consignor_name_en"
                getFieldDecorator={form.getFieldDecorator}
                getFieldValue={form.getFieldValue}
                options={businessUnits.map(bu => ({
                  ciqcode: bu.ciq_code,
                  name: bu.comp_name,
                  code: bu.customs_code,
                }))} intl={intl} onSelect={this.handleConsignorSelect}
              />
            </Col>
            <Col span="6">
              <FormItem {...formItemLayout} label={'发货人地址'} >
                {getFieldDecorator('ciq_consignor_addr', {
                  initialValue: ciqDeclHead.ciq_consignor_addr,
                })(
                  <Input />
                )}
              </FormItem>
            </Col>
            </Row>}
          {ioType === 'out' && <Row>
            <Col span="18">
              <CiqCodeAutoCompSelect labelCol="3" label="发货人" formData={ciqDeclHead}
                codeField="ciq_consignor_code"
                cnameField="ciq_consignor_name_cn"
                enameField="ciq_consignor_name_en"
                getFieldDecorator={form.getFieldDecorator}
                getFieldValue={form.getFieldValue}
                options={businessUnits.map(bu => ({
                  ciqcode: bu.ciq_code,
                  name: bu.comp_name,
                  code: bu.customs_code,
                }))} intl={intl} onSelect={this.handleConsignorSelect}
              />
            </Col>
            <Col span="6">
              <FormItem {...formItemLayout} label={'企业性质'} >
                <Input />
              </FormItem>
            </Col>
            </Row>}
          {ioType === 'out' && <Row>
            <Col span="18">
              <CiqCodeAutoCompSelect labelCol="3" label="收货人" formData={ciqDeclHead}
                codeField="ciq_consignee_code"
                cnameField="ciq_consignee_name_cn"
                enameField="ciq_consignee_name_en"
                getFieldDecorator={form.getFieldDecorator}
                getFieldValue={form.getFieldValue}
                options={businessUnits.map(bu => ({
                  ciqcode: bu.ciq_code,
                  name: bu.comp_name,
                  code: bu.customs_code,
                }))} intl={intl} onSelect={this.handleConsigneeSelect}
              />
            </Col>
            <Col span="6">
              <FormItem {...formItemLayout} label={'收货人地址'} >
                {getFieldDecorator('ciq_consignee_addr', {
                  initialValue: ciqDeclHead.ciq_consignee_addr,
                })(
                  <Input />
                )}
              </FormItem>
            </Col>
            </Row>}
        </Card>
        <Card bodyStyle={{ padding: 16, paddingBottom: 0 }} hoverable={false}>
          <Row>
            <Col span="6">
              <FormItem {...formItemLayout} label={'运输方式'} required >
                {getFieldDecorator('traf_mode', {
                  initialValue: (ciqDeclHead.traf_mode && [0, 1, 7, 8, 9].indexOf(Number(ciqDeclHead.traf_mode))) !== -1 ? 9 : Number(ciqDeclHead.traf_mode),
                })(
                  <Select>
                    {CIQ_TRANSPORTS_TYPE.map(tran => <Option value={tran.value} key={tran.value}>{tran.text}</Option>)}
                  </Select>
                )}
              </FormItem>
            </Col>
            <Col span="6">
              <FormItem {...formItemLayout} label={'运输工具名称'} >
                {getFieldDecorator('traf_name', {
                  initialValue: ciqDeclHead.traf_name,
                })(
                  <Input />
                )}
              </FormItem>
            </Col>
            <Col span="6">
              <FormItem {...formItemLayout} label={'运输工具号码'} >
                {getFieldDecorator('traf_mean_no', {
                  initialValue: ciqDeclHead.traf_mean_no,
                })(
                  <Input />
                )}
              </FormItem>
            </Col>
            {ioType === 'in' && <Col span="6">
              <FormItem {...formItemLayout} label={'提货单号'} >
                {getFieldDecorator('delivery_order', {
                  initialValue: ciqDeclHead.delivery_order,
                })(
                  <Input />
                )}
              </FormItem>
            </Col>}
            {ioType === 'in' && <Col span="6">
              <FormItem {...formItemLayout} label={'提/运单号'} required >
                {getFieldDecorator('bill_lad_no', {
                  initialValue: ciqDeclHead.bill_lad_no,
                })(
                  <Input />
                )}
              </FormItem>
            </Col>}
            <Col span="6">
              <FormItem {...formItemLayout} label={'合同号'} required >
                {getFieldDecorator('contr_no', {
                  initialValue: ciqDeclHead.contr_no,
                })(
                  <Input />
                )}
              </FormItem>
            </Col>
            <Col span="6">
              <FormItem {...formItemLayout} label={'贸易方式'} required >
                {getFieldDecorator('ciq_trade_mode', {
                  initialValue: ciqDeclHead.ciq_trade_mode,
                })(
                  <Input />
                )}
              </FormItem>
            </Col>
            {ioType === 'in' &&
            <FormRemoteSearchSelect outercol={6} label="贸易国家" col={8} field="ciq_trade_country"
              getFieldDecorator={form.getFieldDecorator} formData={ciqDeclHead}
              options={countries.map(coun => ({
                value: coun.country_code,
                text: `${coun.country_code} | ${coun.country_cn_name}`,
                search: `${coun.country_code}${coun.country_cn_name}`,
              }))} onSearch={this.handleSearchCountries} onSelect={this.handleCountrySelect}
            />}
            {ioType === 'in' &&
            <FormRemoteSearchSelect outercol={6} label="启运口岸" col={8} field="ciq_desp_dest_port"
              getFieldDecorator={form.getFieldDecorator} formData={ciqDeclHead}
              options={worldPorts.map(port => ({
                value: port.port_code,
                text: `${port.port_code} | ${port.port_cname}`,
                search: `${port.port_code}${port.port_cname}`,
              }))} onSearch={this.handleSearchWorldPorts} onSelect={this.handleWorldPortsSelect}
            />}
            {ioType === 'in' &&
            <FormRemoteSearchSelect outercol={6} label="启运国家" col={8} field="ciq_desp_dest_country"
              getFieldDecorator={form.getFieldDecorator} formData={ciqDeclHead}
              options={countries.map(coun => ({
                value: coun.country_code,
                text: `${coun.country_code} | ${coun.country_cn_name}`,
                search: `${coun.country_code}${coun.country_cn_name}`,
              }))} onSearch={this.handleSearchCountries} onSelect={this.handleCountrySelect}
            />}
            {ioType === 'out' &&
            <FormRemoteSearchSelect outercol={6} label={<span><Icon type="safety" />施检地</span>} col={8} field="ciq_insp_orgcode"
              getFieldDecorator={form.getFieldDecorator} formData={ciqDeclHead}
              options={organizations.map(org => ({
                value: org.org_code,
                text: `${org.org_code} | ${org.org_name}`,
                search: `${org.org_code}${org.org_name}`,
              }))} onSearch={this.handleSearchOrg} onSelect={this.handleOrganizationSelect}
            />}
            {ioType === 'out' &&
              <FormRemoteSearchSelect outercol={6} label="输往国家/地区" col={8} field="ciq_desp_dest_country"
                getFieldDecorator={form.getFieldDecorator} formData={ciqDeclHead}
                options={countries.map(coun => ({
                  value: coun.country_code,
                  text: `${coun.country_code} | ${coun.country_cn_name}`,
                  search: `${coun.country_code}${coun.country_cn_name}`,
                }))} onSearch={this.handleSearchCountries} onSelect={this.handleCountrySelect}
              />}
            {ioType === 'in' &&
            <FormRemoteSearchSelect outercol={6} label="停经口岸" col={8} field="ciq_stop_port"
              getFieldDecorator={form.getFieldDecorator} formData={ciqDeclHead}
              options={worldPorts.map(port => ({
                value: port.port_code,
                text: `${port.port_code} | ${port.port_cname}`,
                search: `${port.port_code}${port.port_cname}`,
              }))} onSearch={this.handleSearchWorldPorts} onSelect={this.handleWorldPortsSelect}
            />}
            <FormRemoteSearchSelect outercol={6} label={ioType === 'in' ? '入境口岸' : '离境口岸'} col={8} field="ciq_entry_exit_port"
              getFieldDecorator={form.getFieldDecorator} formData={ciqDeclHead}
              options={chinaPorts.map(port => ({
                value: port.port_code,
                text: `${port.port_code} | ${port.port_cname}`,
                search: `${port.port_code}${port.port_cname}`,
              }))} onSearch={this.handleSearchChinaPorts}
            />
            {ioType === 'in' &&
              <FormRemoteSearchSelect outercol={6} label="目的地" col={8} field="dest_code"
                getFieldDecorator={form.getFieldDecorator} formData={ciqDeclHead}
                options={countries.map(coun => ({
                  value: coun.country_code,
                  text: `${coun.country_code} | ${coun.country_cn_name}`,
                  search: `${coun.country_code}${coun.country_cn_name}`,
                }))} onSearch={this.handleSearchCountries} onSelect={this.handleCountrySelect}
              />}
            {ioType === 'in' &&
            <FormRemoteSearchSelect outercol={6} label={<span><Icon type="safety" />目的机构</span>} col={8} field="ciq_purp_orgcode"
              getFieldDecorator={form.getFieldDecorator} formData={ciqDeclHead} required
              options={organizations.map(org => ({
                value: org.org_code,
                text: `${org.org_code} | ${org.org_name}`,
                search: `${org.org_code}${org.org_name}`,
              }))} onSearch={this.handleSearchOrg} onSelect={this.handleOrganizationSelect}
            />}
            {ioType === 'out' &&
            <FormRemoteSearchSelect outercol={6} label="到达口岸" col={8} field="ciq_desp_dest_port"
              getFieldDecorator={form.getFieldDecorator} formData={ciqDeclHead}
              options={worldPorts.map(port => ({
                value: port.port_code,
                text: `${port.port_code} | ${port.port_cname}`,
                search: `${port.port_code}${port.port_cname}`,
              }))} onSearch={this.handleSearchWorldPorts} onSelect={this.handleWorldPortsSelect}
            />}
            <Col span="6">
              <FormItem {...formItemLayout} label={'存放地点'} required >
                {getFieldDecorator('goods_place', {
                  initialValue: ciqDeclHead.goods_place,
                })(
                  <Input />
                )}
              </FormItem>
            </Col>
            <FormRemoteSearchSelect outercol={6} label={<span><Icon type="safety" />领证地</span>} col={8} field="ciq_vsa_orgcode"
              getFieldDecorator={form.getFieldDecorator} formData={ciqDeclHead} required
              options={organizations.map(org => ({
                value: org.org_code,
                text: `${org.org_code} | ${org.org_name}`,
                search: `${org.org_code}${org.org_name}`,
              }))} onSearch={this.handleSearchOrg} onSelect={this.handleOrganizationSelect}
            />
            {ioType === 'in' && <Col span="6">
              <FormItem {...formItemLayout} label={'启运日期'} required >
                {getFieldDecorator('desp_date', {
                  initialValue: ciqDeclHead.desp_date && moment(ciqDeclHead.desp_date),
                })(
                  <DatePicker style={{ width: '100%' }} format="YYYY/MM/DD" />
                )}
              </FormItem>
            </Col>}
            {ioType === 'in' && <Col span="6">
              <FormItem {...formItemLayout} label={'到货日期'} required >
                {getFieldDecorator('arrival_date', {
                  initialValue: ciqDeclHead.arrival_date && moment(ciqDeclHead.arrival_date),
                })(
                  <DatePicker style={{ width: '100%' }} format="YYYY/MM/DD" />
                )}
              </FormItem>
            </Col>}
            {ioType === 'in' && <Col span="6">
              <FormItem {...formItemLayout} label={'卸毕日期'} >
                {getFieldDecorator('cmpl_dschrg_date', {
                  initialValue: ciqDeclHead.cmpl_dschrg_date && moment(ciqDeclHead.cmpl_dschrg_date),
                })(
                  <DatePicker style={{ width: '100%' }} format="YYYY/MM/DD" />
                )}
              </FormItem>
            </Col>}
            {ioType === 'in' && <Col span="6">
              <FormItem {...formItemLayout} label={'索赔截止日期'} >
                {getFieldDecorator('counter_claim_date', {
                  initialValue: ciqDeclHead.counter_claim_date && moment(ciqDeclHead.counter_claim_date),
                })(
                  <DatePicker style={{ width: '100%' }} format="YYYY/MM/DD" />
              )}
              </FormItem>
            </Col>}
            {ioType === 'out' && <Col span="6">
              <FormItem {...formItemLayout} label={'发货日期'} >
                <DatePicker style={{ width: '100%' }} />
              </FormItem>
            </Col>}
            <FormRemoteSearchSelect outercol={6} label="报关海关" col={8} field="decl_port"
              getFieldDecorator={form.getFieldDecorator} formData={ciqDeclHead}
              options={customs.map(cus => ({
                value: cus.customs_code,
                text: `${cus.customs_code} | ${cus.customs_name}`,
                search: `${cus.customs_code}${cus.customs_name}`,
              }))} onSearch={this.handleSearchCus} onSelect={this.handleCustomsSelect}
            />
            <Col span="6">
              <FormItem {...formItemLayout} label={'海关注册号'} >
                {getFieldDecorator('customs_reg_no', {
                  initialValue: ciqDeclHead.customs_reg_no,
                })(
                  <Input />
                )}
              </FormItem>
            </Col>
            <Col span="6">
              <FormItem {...formItemLayout} label={'关联报检号'} >
                {getFieldDecorator('correl_ciq_decl_no', {
                  initialValue: ciqDeclHead.correl_ciq_decl_no,
                })(
                  <Input />
                )}
              </FormItem>
            </Col>
            <Col span="6">
              <FormItem {...formItemLayout} label={'关联理由'} >
                {getFieldDecorator('correl_reason_flag', {
                  initialValue: ciqDeclHead.correl_reason_flag,
                })(
                  <Input />
                )}
              </FormItem>
            </Col>
            <Col span="6">
              <FormItem {...formItemLayout} label={'分运单号'} >
                {getFieldDecorator('split_bill_lad_no', {
                  initialValue: ciqDeclHead.split_bill_lad_no,
                })(
                  <Input />
                )}
              </FormItem>
            </Col>
          </Row>
          <Row>
            <Col span="12">
              <FormItem {...formItemSpan2Layout} label={'特殊业务标识'} >
                {getFieldDecorator('special_decl_flag', {
                  initialValue: ciqDeclHead.special_decl_flag && ciqDeclHead.special_decl_flag.split(','),
                })(
                  <Select mode="multiple">
                    {CIQ_SPECIAL_DECL_FLAG.map(type => <Option key={type.value}>{type.text}</Option>)}
                  </Select>
                )}
              </FormItem>
            </Col>
            <Col span="12">
              <FormItem {...formItemSpan2Layout} label={'特殊通关模式'} >
                {getFieldDecorator('spec_pass_flag', {
                  initialValue: ciqDeclHead.spec_pass_flag && ciqDeclHead.spec_pass_flag.split(','),
                })(
                  <Select mode="multiple">
                    {CIQ_SPECIAL_PASS_FLAG.map(type => <Option key={type.value}>{type.text}</Option>)}
                  </Select>
                )}
              </FormItem>
            </Col>
          </Row>
          <Row>
            <Col span="12">
              <FormItem {...formItemSpan2Layout} label={'特殊检验检疫要求'} >
                {getFieldDecorator('specl_insp_qura_re', {
                  initialValue: ciqDeclHead.specl_insp_qura_re,
                })(
                  <TextArea autosize />
                )}
              </FormItem>
            </Col>
            <Col span="12">
              <FormItem {...formItemSpan2Layout} label={'标记号码'} >
                {getFieldDecorator('mark_no', {
                  initialValue: ciqDeclHead.mark_no,
                })(
                  <TextArea autosize />
                )}
              </FormItem>
            </Col>
          </Row>
          <Row>
            <Col span="12">
              <FormItem {...formItemSpan2Layout} label={'所需单证'} >
                <Input addonAfter={<Button type="primary" ghost size="small"><Icon type="ellipsis" /></Button>} />
              </FormItem>
            </Col>
            <Col span="12">
              <FormItem {...formItemSpan2Layout} label={'随附单据'} >
                {getFieldDecorator('atta_collect_name', {
                  initialValue: ciqDeclHead.atta_collect_name,
                })(
                  <Input addonAfter={<Button type="primary" ghost size="small"><Icon type="ellipsis" /></Button>} />
                )}
              </FormItem>
            </Col>
          </Row>
        </Card>
      </FormPane>
    );
  }
}