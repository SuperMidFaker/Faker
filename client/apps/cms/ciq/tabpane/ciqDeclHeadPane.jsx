import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { connect } from 'react-redux';
import { Card, DatePicker, Form, Input, Select, Row, Col } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import InfoItem from 'client/components/InfoItem';
import { loadCiqDeclHead, loadCiqParams, searchOrganizations, searchWorldPorts,
   searchChinaPorts, searchCountries } from 'common/reducers/cmsCiqDeclare';
import { loadCmsBrokers } from 'common/reducers/cmsBrokers';
import { loadBusinessUnits } from 'common/reducers/cmsResources';
import { FormRemoteSearchSelect } from '../../common/form/formSelect';
import { RelationAutoCompSelect } from '../../common/form/headFormItems';
import { format } from 'client/common/i18n/helpers';
import messages from '../message.i18n';
import { CIQ_IMPORT_DECL_TYPE, CIQ_EXPORT_DECL_TYPE } from 'common/constants';

const formatMsg = format(messages);
const FormItem = Form.Item;
const InputGroup = Input.Group;
const Option = Select.Option;

@injectIntl
@connect(
  state => ({
    organizations: state.cmsCiqDeclare.ciqParams.organizations,
    currencies: state.cmsCiqDeclare.ciqParams.currencies,
    worldPorts: state.cmsCiqDeclare.ciqParams.worldPorts,
    chinaPorts: state.cmsCiqDeclare.ciqParams.chinaPorts,
    countries: state.cmsCiqDeclare.ciqParams.countries,
    units: state.cmsCiqDeclare.ciqParams.units,
    ciqDeclHead: state.cmsCiqDeclare.ciqDeclHead,
    brokers: state.cmsBrokers.brokers,
    businessUnits: state.cmsResources.businessUnits,
  }),
  { loadCiqDeclHead,
    loadCiqParams,
    searchOrganizations,
    searchWorldPorts,
    searchChinaPorts,
    searchCountries,
    loadCmsBrokers,
    loadBusinessUnits }
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
    this.props.loadCiqParams();
    this.props.loadCmsBrokers();
  }
  msg = (descriptor, values) => formatMsg(this.props.intl, descriptor, values)
  handleSearchOrg = (field, value) => {
    this.props.searchOrganizations(value);
  }
  handleSearchWorldPorts = (field, value) => {
    this.props.searchWorldPorts(value);
  }
  handleSearchChinaPorts = (field, value) => {
    this.props.searchChinaPorts(value);
  }
  handleSearchCountries = (field, value) => {
    this.props.searchCountries(value);
  }
  handleAgentSelect = (value) => {
    const { form, brokers } = this.props;
    const broker = brokers.find(bk => bk.ciq_code === value);
    form.setFieldsValue({ agent_name: broker.comp_name });
  };
  handleConsigneeSelect = (cnameField, codeField, enameField, value) => {
    const { businessUnits, form } = this.props;
    const consignee = businessUnits.find(unit => unit.ciq_code === value);
    form.setFieldsValue({
      [cnameField]: consignee.comp_name,
    });
  }
  handleConsignorSelect = (cnameField, codeField, enameField, value) => {
    const { businessUnits, form } = this.props;
    const consignor = businessUnits.find(unit => unit.ciq_code === value);
    form.setFieldsValue({
      [cnameField]: consignor.comp_name,
    });
  }
  render() {
    const { ioType, organizations, countries, worldPorts, chinaPorts, ciqDeclHead, form,
       form: { getFieldDecorator }, brokers, intl, businessUnits } = this.props;
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
    return (
      <div className="pane">
        <Form layout="horizontal" hideRequiredMark>
          <div className="panel-header">
            <Row>
              <Col span="6">
                <InfoItem size="small" field={ciqDeclHead.ciq_decl_no} placeholder="点击回填"
                  addonBefore={this.msg('报检号')} editable={!ciqDeclHead.ciq_decl_no}
                />
              </Col>
              <Col span="6">
                <InfoItem size="small" field={ciqDeclHead.ciq_cl_no} placeholder="点击回填"
                  addonBefore={this.msg('通关单号')} editable={!ciqDeclHead.ciq_cl_no}
                />
              </Col>
            </Row>
          </div>
          <div className="pane-content form-layout-multi-col">
            <Card bodyStyle={{ padding: 16, paddingBottom: 0 }} hoverable={false}>
              <Row>
                <Col span="6">
                  {ioType === 'in' && <FormItem {...formItemLayout} label={'报检类别'} required >
                    {getFieldDecorator('ciq_decl_type', {
                      initialValue: ciqDeclHead.ciq_decl_type,
                    })(
                      <Select>
                        {CIQ_IMPORT_DECL_TYPE.map(type => <Option value={type.value}>{type.text}</Option>)}
                      </Select>
                    )}
                  </FormItem>}
                  {ioType === 'out' && <FormItem {...formItemLayout} label={'报检类别'} required >
                    {getFieldDecorator('ciq_decl_type', {
                      initialValue: ciqDeclHead.ciq_decl_type,
                    })(
                      <Select>
                        {CIQ_EXPORT_DECL_TYPE.map(type => <Option value={type.value}>{type.text}</Option>)}
                      </Select>
                    )}
                  </FormItem>}
                </Col>
                <FormRemoteSearchSelect outercol="6" label="报检机构" col="8" field="ciq_org_code"
                  getFieldDecorator={form.getFieldDecorator} formData={ciqDeclHead}
                  options={organizations.map(org => ({
                    value: org.org_code,
                    text: `${org.org_code} | ${org.org_name}`,
                    search: `${org.org_code}${org.org_name}`,
                  }))} onSearch={this.handleSearchOrg}
                />
                <FormRemoteSearchSelect outercol="6" label="口岸机构" col="8" field="ciq_insp_orgcode"
                  getFieldDecorator={form.getFieldDecorator} formData={ciqDeclHead}
                  options={organizations.map(org => ({
                    value: org.org_code,
                    text: `${org.org_code} | ${org.org_name}`,
                    search: `${org.org_code}${org.org_name}`,
                  }))} onSearch={this.handleSearchOrg}
                />
                <Col span="6">
                  <FormItem {...formItemLayout} label={'报检日期'} required >
                    <DatePicker style={{ width: '100%' }} />
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
                          {brokers.map(bk => (<Option value={bk.ciq_code}>
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
                      <Input placeholder="编码" value={ciqDeclHead.agent_ciq_person_certno} style={{ width: '50%' }} />
                      <Input placeholder="姓名" value={ciqDeclHead.agent_ciq_person} style={{ width: '50%' }} />
                    </InputGroup>
                  </FormItem>
                </Col>
                <Col span="6">
                  <FormItem {...formItemLayout} label={'联系人'} >
                    <InputGroup compact>
                      <Input placeholder="姓名" value={ciqDeclHead.agent_ciq_contact} style={{ width: '50%' }} />
                      <Input placeholder="电话" value={ciqDeclHead.agent_ciq_tel} style={{ width: '50%' }} />
                    </InputGroup>
                  </FormItem>
                </Col>
              </Row>
              {ioType === 'in' && <Row>
                <Col span="18">
                  <RelationAutoCompSelect labelCol="3" label="收货人" formData={ciqDeclHead} custCodeField="ciq_consignee_code" codeField="ciq_consignee_name_cn"
                    nameField="ciq_consignee_name_en" getFieldDecorator={form.getFieldDecorator} getFieldValue={form.getFieldValue}
                    options={businessUnits.map(bu => ({
                      custcode: bu.ciq_code,
                      name: bu.comp_name,
                      code: bu.customs_code,
                    }))} intl={intl} onSelect={this.handleConsigneeSelect}
                  />
                </Col>
                <Col span="6">
                  <FormItem {...formItemLayout} label={'企业资质'} >
                    <Input />
                  </FormItem>
                </Col>
              </Row>}
              {ioType === 'in' && <Row>
                <Col span="18">
                  <RelationAutoCompSelect labelCol="3" label="发货人" formData={ciqDeclHead} custCodeField="ciq_consignor_code" codeField="ciq_consignor_name_cn"
                    nameField="ciq_consignor_name_en" getFieldDecorator={form.getFieldDecorator} getFieldValue={form.getFieldValue}
                    options={businessUnits.map(bu => ({
                      custcode: bu.ciq_code,
                      name: bu.comp_name,
                      code: bu.customs_code,
                    }))} intl={intl} onSelect={this.handleConsignorSelect}
                  />
                </Col>
                <Col span="6">
                  <FormItem {...formItemLayout} label={'发货人地址'} >
                    <Input value={ciqDeclHead.ciq_consignor_addr} />
                  </FormItem>
                </Col>
              </Row>}
              {ioType === 'out' && <Row>
                <Col span="18">
                  <RelationAutoCompSelect labelCol="3" label="发货人" formData={ciqDeclHead} custCodeField="ciq_consignor_code" codeField="ciq_consignor_name_cn"
                    nameField="ciq_consignor_name_en" getFieldDecorator={form.getFieldDecorator} getFieldValue={form.getFieldValue}
                    options={businessUnits.map(bu => ({
                      custcode: bu.ciq_code,
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
                  <RelationAutoCompSelect labelCol="3" label="收货人" formData={ciqDeclHead} custCodeField="ciq_consignee_code" codeField="ciq_consignee_name_cn"
                    nameField="ciq_consignee_name_en" getFieldDecorator={form.getFieldDecorator} getFieldValue={form.getFieldValue}
                    options={businessUnits.map(bu => ({
                      custcode: bu.ciq_code,
                      name: bu.comp_name,
                      code: bu.customs_code,
                    }))} intl={intl} onSelect={this.handleConsigneeSelect}
                  />
                </Col>
                <Col span="6">
                  <FormItem {...formItemLayout} label={'收货人地址'} >
                    <Input value={ciqDeclHead.ciq_consignee_addr} />
                  </FormItem>
                </Col>
              </Row>}
            </Card>
            <Card bodyStyle={{ padding: 16, paddingBottom: 0 }} hoverable={false}>
              <Row>
                <Col span="6">
                  <FormItem {...formItemLayout} label={'运输方式'} required >
                    <Input value={ciqDeclHead.traf_mode} />
                  </FormItem>
                </Col>
                <Col span="6">
                  <FormItem {...formItemLayout} label={'运输工具名称'} >
                    <Input value={ciqDeclHead.traf_name} />
                  </FormItem>
                </Col>
                <Col span="6">
                  <FormItem {...formItemLayout} label={'运输工具号码'} >
                    <Input value={ciqDeclHead.traf_mean_no} />
                  </FormItem>
                </Col>
                {ioType === 'in' && <Col span="6">
                  <FormItem {...formItemLayout} label={'提货单号'} >
                    <Input value={ciqDeclHead.delivery_order} />
                  </FormItem>
                </Col>}
                {ioType === 'in' && <Col span="6">
                  <FormItem {...formItemLayout} label={'提/运单号'} required >
                    <Input value={ciqDeclHead.bill_lad_no} />
                  </FormItem>
                </Col>}
                <Col span="6">
                  <FormItem {...formItemLayout} label={'合同号'} required >
                    <Input value={ciqDeclHead.contr_no} />
                  </FormItem>
                </Col>
                <Col span="6">
                  <FormItem {...formItemLayout} label={'贸易方式'} required >
                    <Input value={ciqDeclHead.ciq_trade_mode} />
                  </FormItem>
                </Col>
                {ioType === 'in' &&
                <FormRemoteSearchSelect outercol="6" label="贸易国家" col="8" field="ciq_trade_country"
                  getFieldDecorator={form.getFieldDecorator} formData={ciqDeclHead}
                  options={countries.map(coun => ({
                    value: coun.country_code,
                    text: `${coun.country_code} | ${coun.country_cn_name}`,
                    search: `${coun.country_code}${coun.country_cn_name}`,
                  }))} onSearch={this.handleSearchCountries}
                />}
                {ioType === 'in' &&
                <FormRemoteSearchSelect outercol="6" label="启运口岸" col="8" field="ciq_desp_dest_port"
                  getFieldDecorator={form.getFieldDecorator} formData={ciqDeclHead}
                  options={worldPorts.map(port => ({
                    value: port.port_code,
                    text: `${port.port_code} | ${port.port_cname}`,
                    search: `${port.port_code}${port.port_cname}`,
                  }))} onSearch={this.handleSearchWorldPorts}
                />}
                {ioType === 'in' &&
                <FormRemoteSearchSelect outercol="6" label="启运国家" col="8" field="ciq_desp_dest_country"
                  getFieldDecorator={form.getFieldDecorator} formData={ciqDeclHead}
                  options={countries.map(coun => ({
                    value: coun.country_code,
                    text: `${coun.country_code} | ${coun.country_cn_name}`,
                    search: `${coun.country_code}${coun.country_cn_name}`,
                  }))} onSearch={this.handleSearchCountries}
                />}
                {ioType === 'out' &&
                <FormRemoteSearchSelect outercol="6" label="施检机构" col="8" field="ciq_insp_orgcode"
                  getFieldDecorator={form.getFieldDecorator} formData={ciqDeclHead}
                  options={organizations.map(org => ({
                    value: org.org_code,
                    text: `${org.org_code} | ${org.org_name}`,
                    search: `${org.org_code}${org.org_name}`,
                  }))} onSearch={this.handleSearchOrg}
                />}
                {ioType === 'out' &&
                  <FormRemoteSearchSelect outercol="6" label="输往国家/地区" col="8" field="ciq_desp_dest_country"
                    getFieldDecorator={form.getFieldDecorator} formData={ciqDeclHead}
                    options={countries.map(coun => ({
                      value: coun.country_code,
                      text: `${coun.country_code} | ${coun.country_cn_name}`,
                      search: `${coun.country_code}${coun.country_cn_name}`,
                    }))} onSearch={this.handleSearchCountries}
                  />}
                {ioType === 'in' &&
                <FormRemoteSearchSelect outercol="6" label="停经口岸" col="8" field="ciq_stop_port"
                  getFieldDecorator={form.getFieldDecorator} formData={ciqDeclHead}
                  options={worldPorts.map(port => ({
                    value: port.port_code,
                    text: `${port.port_code} | ${port.port_cname}`,
                    search: `${port.port_code}${port.port_cname}`,
                  }))} onSearch={this.handleSearchWorldPorts}
                />}
                <FormRemoteSearchSelect outercol="6" label={ioType === 'in' ? '入境口岸' : '离境口岸'} col="8" field="ciq_entry_exit_port"
                  getFieldDecorator={form.getFieldDecorator} formData={ciqDeclHead}
                  options={chinaPorts.map(port => ({
                    value: port.port_code,
                    text: `${port.port_code} | ${port.port_cname}`,
                    search: `${port.port_code}${port.port_cname}`,
                  }))} onSearch={this.handleSearchChinaPorts}
                />
                {ioType === 'in' && <Col span="6">
                  <FormItem {...formItemLayout} label={'目的地'} required >
                    <Input value={ciqDeclHead.dest_code} />
                  </FormItem>
                </Col>}
                {ioType === 'in' &&
                <FormRemoteSearchSelect outercol="6" label="目的机构" col="8" field="ciq_purp_orgcode"
                  getFieldDecorator={form.getFieldDecorator} formData={ciqDeclHead}
                  options={organizations.map(org => ({
                    value: org.org_code,
                    text: `${org.org_code} | ${org.org_name}`,
                    search: `${org.org_code}${org.org_name}`,
                  }))} onSearch={this.handleSearchOrg}
                />}
                {ioType === 'out' &&
                <FormRemoteSearchSelect outercol="6" label="到达口岸" col="8" field="ciq_desp_dest_port"
                  getFieldDecorator={form.getFieldDecorator} formData={ciqDeclHead}
                  options={worldPorts.map(port => ({
                    value: port.port_code,
                    text: `${port.port_code} | ${port.port_cname}`,
                    search: `${port.port_code}${port.port_cname}`,
                  }))} onSearch={this.handleSearchWorldPorts}
                />}
                <Col span="6">
                  <FormItem {...formItemLayout} label={'存放地点'} required >
                    <Input value={ciqDeclHead.goods_place} />
                  </FormItem>
                </Col>
                <FormRemoteSearchSelect outercol="6" label="领证机构" col="8" field="ciq_vsa_orgcode"
                  getFieldDecorator={form.getFieldDecorator} formData={ciqDeclHead}
                  options={organizations.map(org => ({
                    value: org.org_code,
                    text: `${org.org_code} | ${org.org_name}`,
                    search: `${org.org_code}${org.org_name}`,
                  }))} onSearch={this.handleSearchOrg}
                />
                {ioType === 'in' && <Col span="6">
                  <FormItem {...formItemLayout} label={'启运日期'} required >
                    <DatePicker style={{ width: '100%' }} value={ciqDeclHead.desp_date ? moment(ciqDeclHead.desp_date, 'YYYY/MM/DD') : ''} />
                  </FormItem>
                </Col>}
                {ioType === 'in' && <Col span="6">
                  <FormItem {...formItemLayout} label={'到货日期'} required >
                    <DatePicker style={{ width: '100%' }} value={ciqDeclHead.arrival_date ? moment(ciqDeclHead.arrival_date, 'YYYY/MM/DD') : ''} />
                  </FormItem>
                </Col>}
                {ioType === 'in' && <Col span="6">
                  <FormItem {...formItemLayout} label={'卸毕日期'} >
                    <DatePicker style={{ width: '100%' }} value={ciqDeclHead.cmpl_dschrg_date ? moment(ciqDeclHead.cmpl_dschrg_date, 'YYYY/MM/DD') : ''} />
                  </FormItem>
                </Col>}
                {ioType === 'in' && <Col span="6">
                  <FormItem {...formItemLayout} label={'索赔截止日期'} >
                    <DatePicker style={{ width: '100%' }} value={ciqDeclHead.counter_claim_date ? moment(ciqDeclHead.counter_claim_date, 'YYYY/MM/DD') : ''} />
                  </FormItem>
                </Col>}
                {ioType === 'out' && <Col span="6">
                  <FormItem {...formItemLayout} label={'发货日期'} >
                    <DatePicker style={{ width: '100%' }} />
                  </FormItem>
                </Col>}
                <Col span="6">
                  <FormItem {...formItemLayout} label={'报关海关'} >
                    <Input value={ciqDeclHead.decl_port} />
                  </FormItem>
                </Col>
                <Col span="6">
                  <FormItem {...formItemLayout} label={'海关注册号'} >
                    <Input value={ciqDeclHead.customs_reg_no} />
                  </FormItem>
                </Col>
                <Col span="6">
                  <FormItem {...formItemLayout} label={'关联报检号'} >
                    <Input value={ciqDeclHead.correl_ciq_decl_no} />
                  </FormItem>
                </Col>
                <Col span="6">
                  <FormItem {...formItemLayout} label={'关联理由'} >
                    <Input value={ciqDeclHead.correl_reason_flag} />
                  </FormItem>
                </Col>
                <Col span="6">
                  <FormItem {...formItemLayout} label={'分运单号'} >
                    <Input value={ciqDeclHead.split_bill_lad_no} />
                  </FormItem>
                </Col>
              </Row>
              <Row>
                <Col span="12">
                  <FormItem {...formItemSpan2Layout} label={'特殊业务标识'} >
                    <Input value={ciqDeclHead.special_decl_flag} />
                  </FormItem>
                </Col>
                <Col span="12">
                  <FormItem {...formItemSpan2Layout} label={'特殊通关模式'} >
                    <Input value={ciqDeclHead.spec_pass_flag} />
                  </FormItem>
                </Col>
                <Col span="12">
                  <FormItem {...formItemSpan2Layout} label={'特殊检验检疫要求'} >
                    <Input value={ciqDeclHead.specl_insp_qura_re} />
                  </FormItem>
                </Col>
                <Col span="12">
                  <FormItem {...formItemSpan2Layout} label={'标记号码'} >
                    <Input value={ciqDeclHead.mark_no} />
                  </FormItem>
                </Col>
                <Col span="12">
                  <FormItem {...formItemSpan2Layout} label={'所需单证'} >
                    <Select mode="combobox" />
                  </FormItem>
                </Col>
                <Col span="12">
                  <FormItem {...formItemSpan2Layout} label={'随附单据'} >
                    <Input value={ciqDeclHead.atta_collect_name} />
                  </FormItem>
                </Col>
              </Row>
            </Card>
          </div>
        </Form>
      </div>
    );
  }
}
