import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { connect } from 'react-redux';
import { Card, DatePicker, Form, Icon, Input, Select, Row, Col } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import InfoItem from 'client/components/InfoItem';
import { fillEntryId } from 'common/reducers/cmsManifest';
import { updateMark, loadCiqDeclHead, loadCiqParams } from 'common/reducers/cmsDeclare';
import { format } from 'client/common/i18n/helpers';
import messages from '../message.i18n';

const formatMsg = format(messages);
const FormItem = Form.Item;
const InputGroup = Input.Group;

@injectIntl
@connect(
  state => ({
    formRequire: state.cmsManifest.params,
    organizetions: state.cmsDeclare.ciqParams.organizetions,
    currencies: state.cmsDeclare.ciqParams.currencies,
    ports: state.cmsDeclare.ciqParams.ports,
    countries: state.cmsDeclare.ciqParams.countries,
    units: state.cmsDeclare.ciqParams.units,
  }),
  { fillEntryId, updateMark, loadCiqDeclHead, loadCiqParams }
)
export default class CiqDeclHeadPane extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    ioType: PropTypes.string.isRequired,
    form: PropTypes.object.isRequired,
    formData: PropTypes.object.isRequired,
    formRequire: PropTypes.object.isRequired,
    fillEntryId: PropTypes.func.isRequired,
    updateMark: PropTypes.func.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  state = {
    head: {},
  }
  componentDidMount() {
    this.props.loadCiqDeclHead(this.context.router.params.declNo).then((result) => {
      if (!result.error) {
        this.setState({
          head: result.data,
        });
      }
    });
    this.props.loadCiqParams();
  }
  msg = (descriptor, values) => formatMsg(this.props.intl, descriptor, values)
  render() {
    const { ioType, organizetions, countries, ports } = this.props;
    const { head } = this.state;
    const formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 8 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 16 },
      },
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
    };
    const formItemSpan3Layout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 3 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 21 },
      },
    };
    return (
      <div className="pane">
        <Form layout="horizontal" colon={false} hideRequiredMark>
          <div className="panel-header">
            <Row>
              <Col span="6">
                <InfoItem size="small" field={head.pre_entry_seq_no}
                  addonBefore={this.msg('统一编号')}
                />
              </Col>
              <Col span="6">
                <InfoItem size="small" field={head.ciq_decl_no} placeholder="点击回填"
                  addonBefore={this.msg('报检号')}
                />
              </Col>
              <Col span="6">
                <InfoItem size="small" field={head.ciq_customs_no} placeholder="点击回填"
                  addonBefore={this.msg('通关单号')}
                />
              </Col>
            </Row>
          </div>
          <div className="pane-content form-layout-multi-col">
            <Card bodyStyle={{ padding: 16, paddingBottom: 0 }} hoverable={false}>
              <Row>
                <Col span="6">
                  <FormItem {...formItemLayout} colon={false} label={'报检类别'} required >
                    <Input value={head.ciq_decl_type} />
                  </FormItem>
                </Col>
                <Col span="6">
                  <FormItem {...formItemLayout} colon={false} label={'报检机构'} required >
                    <Input prefix={<Icon type="safety" />} value={head.ciq_org_code && organizetions.find(org => org.org_code === head.ciq_org_code)} />
                  </FormItem>
                </Col>
                <Col span="6">
                  <FormItem {...formItemLayout} colon={false} label={'口岸机构'} required >
                    <Input prefix={<Icon type="safety" />} />
                  </FormItem>
                </Col>
                <Col span="6">
                  <FormItem {...formItemLayout} colon={false} label={'报检日期'} required >
                    <DatePicker style={{ width: '100%' }} />
                  </FormItem>
                </Col>
              </Row>
              <Row>
                <Col span="12">
                  <FormItem {...formItemSpan2Layout} colon={false} label={'报检单位'} required >
                    <InputGroup compact>
                      <Input placeholder="报检登记号" value={head.agent_ciq_code} style={{ width: '30%' }} />
                      <Input placeholder="中文名称" value={head.agent_name} style={{ width: '70%' }} />
                    </InputGroup>
                  </FormItem>
                </Col>
                <Col span="6">
                  <FormItem {...formItemLayout} colon={false} label={'报检员'} >
                    <InputGroup compact>
                      <Input placeholder="编码" value={head.agent_ciq_person_certno} style={{ width: '50%' }} />
                      <Input placeholder="姓名" value={head.agent_ciq_person} style={{ width: '50%' }} />
                    </InputGroup>
                  </FormItem>
                </Col>
                <Col span="6">
                  <FormItem {...formItemLayout} colon={false} label={'联系人'} >
                    <InputGroup compact>
                      <Input placeholder="姓名" value={head.agent_ciq_contact} style={{ width: '50%' }} />
                      <Input placeholder="电话" value={head.agent_ciq_tel} style={{ width: '50%' }} />
                    </InputGroup>
                  </FormItem>
                </Col>
              </Row>
              {ioType === 'in' && <Row>
                <Col span="18">
                  <FormItem {...formItemSpan3Layout} colon={false} label={'收货人'} required >
                    <InputGroup compact>
                      <Input placeholder="收货人代码" style={{ width: '20%' }} />
                      <Input placeholder="收货人中文" value={head.ciq_consignor_name_cn} style={{ width: '40%' }} />
                      <Input placeholder="收货人英文" value={head.ciq_consignor_name_en} style={{ width: '40%' }} />
                    </InputGroup>
                  </FormItem>
                </Col>
                <Col span="6">
                  <FormItem {...formItemLayout} colon={false} label={'企业性质'} >
                    <Input />
                  </FormItem>
                </Col>
              </Row>}
              {ioType === 'in' && <Row>
                <Col span="18">
                  <FormItem {...formItemSpan3Layout} colon={false} label={'发货人'} >
                    <InputGroup compact>
                      <Input placeholder="发货人代码" value={head.ciq_consignor_code} style={{ width: '20%' }} />
                      <Input placeholder="发货人中文" value={head.ciq_consignor_name_cn} style={{ width: '40%' }} />
                      <Input placeholder="发货人英文" value={head.ciq_consignor_name_en} style={{ width: '40%' }} />
                    </InputGroup>
                  </FormItem>
                </Col>
                <Col span="6">
                  <FormItem {...formItemLayout} label={'发货人地址'} >
                    <Input value={head.ciq_consignor_addr} />
                  </FormItem>
                </Col>
              </Row>}
              {ioType === 'out' && <Row>
                <Col span="18">
                  <FormItem {...formItemSpan3Layout} colon={false} label={'发货人'} required >
                    <InputGroup compact>
                      <Input placeholder="发货人代码" value={head.ciq_consignor_code} style={{ width: '20%' }} />
                      <Input placeholder="发货人中文" value={head.ciq_consignor_name_cn} style={{ width: '40%' }} />
                      <Input placeholder="发货人英文" value={head.ciq_consignor_name_en} style={{ width: '40%' }} />
                    </InputGroup>
                  </FormItem>
                </Col>
                <Col span="6">
                  <FormItem {...formItemLayout} colon={false} label={'企业性质'} >
                    <Input />
                  </FormItem>
                </Col>
              </Row>}
              {ioType === 'out' && <Row>
                <Col span="18">
                  <FormItem {...formItemSpan3Layout} colon={false} label={'收货人'} >
                    <InputGroup compact>
                      <Input placeholder="收货人代码" value={head.ciq_consignee_code} style={{ width: '20%' }} />
                      <Input placeholder="收货人中文" value={head.ciq_consignee_name_cn} style={{ width: '40%' }} />
                      <Input placeholder="收货人英文" value={head.ciq_consignee_name_en} style={{ width: '40%' }} />
                    </InputGroup>
                  </FormItem>
                </Col>
                <Col span="6">
                  <FormItem {...formItemLayout} colon={false} label={'收货人地址'} >
                    <Input value={head.ciq_consignee_addr} />
                  </FormItem>
                </Col>
              </Row>}
            </Card>
            <Card bodyStyle={{ padding: 16, paddingBottom: 0 }} hoverable={false}>
              <Row>
                <Col span="6">
                  <FormItem {...formItemLayout} colon={false} label={'运输方式'} required >
                    <Input value={head.traf_mode} />
                  </FormItem>
                </Col>
                <Col span="6">
                  <FormItem {...formItemLayout} label={'运输工具名称'} >
                    <Input value={head.traf_name} />
                  </FormItem>
                </Col>
                <Col span="6">
                  <FormItem {...formItemLayout} label={'运输工具号码'} >
                    <Input value={head.traf_mean_no} />
                  </FormItem>
                </Col>
                {ioType === 'in' && <Col span="6">
                  <FormItem {...formItemLayout} label={'提货单号'} >
                    <Input value={head.delivery_order} />
                  </FormItem>
                </Col>}
                {ioType === 'in' && <Col span="6">
                  <FormItem {...formItemLayout} label={'提/运单号'} required >
                    <Input value={head.bill_lad_no} />
                  </FormItem>
                </Col>}
                <Col span="6">
                  <FormItem {...formItemLayout} label={'合同号'} required >
                    <Input value={head.contr_no} />
                  </FormItem>
                </Col>
                <Col span="6">
                  <FormItem {...formItemLayout} colon={false} label={'贸易方式'} required >
                    <Input value={head.ciq_trade_mode} />
                  </FormItem>
                </Col>
                {ioType === 'in' && <Col span="6">
                  <FormItem {...formItemLayout} colon={false} label={'贸易国别'} required >
                    <Input value={countries.find(cou => cou.country_code === head.ciq_trade_country) && countries.find(cou => cou.country_code === head.ciq_trade_country).country_cn_name} />
                  </FormItem>
                </Col>}
                {ioType === 'in' && <Col span="6">
                  <FormItem {...formItemLayout} label={'启运口岸'} required >
                    <Input value={ports.find(port => port.port_code === head.ciq_desp_dest_port) && ports.find(port => port.port_code === head.ciq_desp_dest_port).port_cname} />
                  </FormItem>
                </Col>}
                {ioType === 'in' && <Col span="6">
                  <FormItem {...formItemLayout} label={'启运国家'} >
                    <Input value={countries.find(cou => cou.country_code === head.ciq_desp_dest_country) && countries.find(cou => cou.country_code === head.ciq_desp_dest_country).country_cn_name} />
                  </FormItem>
                </Col>}
                {ioType === 'out' && <Col span="6">
                  <FormItem {...formItemLayout} colon={false} label={'施检机构'} required >
                    <Input prefix={<Icon type="safety" />} value={head.ciq_insp_orgcode} />
                  </FormItem>
                </Col>}
                {ioType === 'out' && <Col span="6">
                  <FormItem {...formItemLayout} colon={false} label={'输往国家/地区'} >
                    <Input value={head.ciq_desp_dest_country} />
                  </FormItem>
                </Col>}
                {ioType === 'in' && <Col span="6">
                  <FormItem {...formItemLayout} label={'停经口岸'} >
                    <Input value={ports.find(port => port.port_code === head.ciq_stop_port) && ports.find(port => port.port_code === head.ciq_stop_port).port_cname} />
                  </FormItem>
                </Col>}
                <Col span="6">
                  <FormItem {...formItemLayout} colon={false} label={ioType === 'in' ? '入境口岸' : '离境口岸'} required >
                    <Select mode="combobox" />
                  </FormItem>
                </Col>
                {ioType === 'in' && <Col span="6">
                  <FormItem {...formItemLayout} label={'目的地'} required >
                    <Input value={head.dest_code} />
                  </FormItem>
                </Col>}
                {ioType === 'in' && <Col span="6">
                  <FormItem {...formItemLayout} label={'目的机构'} required >
                    <Input prefix={<Icon type="safety" />} value={head.ciq_purp_orgcode} />
                  </FormItem>
                </Col>}
                {ioType === 'out' && <Col span="6">
                  <FormItem {...formItemLayout} colon={false} label={'到达口岸'} required >
                    <Input />
                  </FormItem>
                </Col>}
                <Col span="6">
                  <FormItem {...formItemLayout} label={'存放地点'} required >
                    <Input value={head.goods_place} />
                  </FormItem>
                </Col>
                <Col span="6">
                  <FormItem {...formItemLayout} colon={false} label={'领证机构'} required >
                    <Input prefix={<Icon type="safety" />} value={head.ciq_vsa_orgcode} />
                  </FormItem>
                </Col>
                {ioType === 'in' && <Col span="6">
                  <FormItem {...formItemLayout} label={'启运日期'} required >
                    <DatePicker style={{ width: '100%' }} value={head.desp_date ? moment(head.desp_date, 'YYYY/MM/DD') : ''} />
                  </FormItem>
                </Col>}
                {ioType === 'in' && <Col span="6">
                  <FormItem {...formItemLayout} label={'到货日期'} required >
                    <DatePicker style={{ width: '100%' }} value={head.arrival_date ? moment(head.arrival_date, 'YYYY/MM/DD') : ''} />
                  </FormItem>
                </Col>}
                {ioType === 'in' && <Col span="6">
                  <FormItem {...formItemLayout} label={'卸毕日期'} >
                    <DatePicker style={{ width: '100%' }} value={head.cmpl_dschrg_date ? moment(head.cmpl_dschrg_date, 'YYYY/MM/DD') : ''} />
                  </FormItem>
                </Col>}
                {ioType === 'in' && <Col span="6">
                  <FormItem {...formItemLayout} label={'索赔截止日期'} >
                    <DatePicker style={{ width: '100%' }} value={head.counter_claim_date ? moment(head.counter_claim_date, 'YYYY/MM/DD') : ''} />
                  </FormItem>
                </Col>}
                {ioType === 'out' && <Col span="6">
                  <FormItem {...formItemLayout} colon={false} label={'发货日期'} >
                    <DatePicker style={{ width: '100%' }} />
                  </FormItem>
                </Col>}
                <Col span="6">
                  <FormItem {...formItemLayout} label={'报关海关'} >
                    <Input value={head.decl_port} />
                  </FormItem>
                </Col>
                <Col span="6">
                  <FormItem {...formItemLayout} label={'海关注册号'} >
                    <Input value={head.customs_reg_no} />
                  </FormItem>
                </Col>
                <Col span="6">
                  <FormItem {...formItemLayout} label={'关联报检号'} >
                    <Input value={head.correl_ciq_decl_no} />
                  </FormItem>
                </Col>
                <Col span="6">
                  <FormItem {...formItemLayout} label={'关联理由'} >
                    <Input value={head.correl_reason_flag} />
                  </FormItem>
                </Col>
                <Col span="6">
                  <FormItem {...formItemLayout} label={'分运单号'} >
                    <Input value={head.split_bill_lad_no} />
                  </FormItem>
                </Col>
              </Row>
              <Row>
                <Col span="12">
                  <FormItem {...formItemSpan2Layout} colon={false} label={'特殊业务标识'} >
                    <Input value={head.special_decl_flag} />
                  </FormItem>
                </Col>
                <Col span="12">
                  <FormItem {...formItemSpan2Layout} colon={false} label={'特殊通关模式'} >
                    <Input value={head.spec_pass_flag} />
                  </FormItem>
                </Col>
                <Col span="12">
                  <FormItem {...formItemSpan2Layout} colon={false} label={'特殊检验检疫要求'} >
                    <Input value={head.specl_insp_qura_re} />
                  </FormItem>
                </Col>
                <Col span="12">
                  <FormItem {...formItemSpan2Layout} colon={false} label={'标记号码'} >
                    <Input value={head.mark_no} />
                  </FormItem>
                </Col>
                <Col span="12">
                  <FormItem {...formItemSpan2Layout} colon={false} label={'所需单证'} >
                    <Select mode="combobox" />
                  </FormItem>
                </Col>
                <Col span="12">
                  <FormItem {...formItemSpan2Layout} colon={false} label={'随附单据'} >
                    <Input value={head.atta_collect_name} />
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
