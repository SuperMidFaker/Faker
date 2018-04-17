import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { connect } from 'react-redux';
import { Button, Card, DatePicker, Form, Icon, Input, Select, Rate, Row, Col } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import FormPane from 'client/components/FormPane';

import { loadHscodes, getElementByHscode } from 'common/reducers/cmsHsCode';
import { showDeclElementsModal } from 'common/reducers/cmsManifest';
import { toggleApplyCertsModal } from 'common/reducers/cmsTradeitem';
import { SPECIAL_COPNO_TERM, CMS_TRADE_ITEM_TYPE, TRADE_ITEM_APPLY_CERTS } from 'common/constants';
import DeclElementsModal from '../../../../common/modal/declElementsModal';
import ApplyCertsModal from '../modal/applyCertsModal';
import { formatMsg } from '../../../message.i18n';


const FormItem = Form.Item;
const { Option } = Select;

function getFieldInits(formData) {
  const init = {};
  if (formData) {
    ['cop_product_no', 'src_product_no', 'hscode', 'g_name', 'en_name', 'g_model', 'g_unit_1', 'g_unit_2', 'g_unit_3',
      'unit_1', 'unit_2', 'fixed_unit', 'origin_country', 'customs_control', 'inspection_quarantine',
      'currency', 'pre_classify_no', 'remark', 'appl_cert_code', 'item_type', 'cop_uom', 'proc_method', 'material_ingred', 'use',
      'confidence',
    ].forEach((fd) => {
      init[fd] = formData[fd] === undefined ? '' : formData[fd];
    });
    ['unit_net_wt', 'unit_price', 'fixed_qty', 'pre_classify_start_date', 'pre_classify_end_date'].forEach((fd) => {
      init[fd] = formData[fd] === undefined ? null : formData[fd];
    });
    init.specialMark = formData.special_mark ? formData.special_mark.split('/') : [];
    ['pre_classify_start_date', 'pre_classify_end_date'].forEach((fd) => {
      init[fd] = !formData[fd] ? null : moment(formData[fd]);
    });
    ['pre_classify_no', 'remark'].forEach((fd) => {
      init[fd] = formData[fd] === undefined ? '' : formData[fd];
    });
    if (formData.appl_cert_code) {
      const codes = formData.appl_cert_code.split(',');
      let names = '';
      codes.forEach((code) => {
        const cert = TRADE_ITEM_APPLY_CERTS.find(ce => ce.app_cert_code === code);
        if (!names) {
          names += cert.app_cert_name;
        } else {
          names += `,${cert.app_cert_name}`;
        }
      });
      init.appl_cert_name = names;
    }
  }
  return init;
}
@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    currencies: state.cmsTradeitem.params.currencies,
    units: state.cmsTradeitem.params.units.map(un => ({
      value: un.unit_code,
      text: un.unit_name,
    })),
    tradeCountries: state.cmsTradeitem.params.tradeCountries,
    hscodes: state.cmsHsCode.hscodes,
  }),
  {
    loadHscodes,
    getElementByHscode,
    showDeclElementsModal,
    toggleApplyCertsModal,
  }
)
export default class ItemMasterPane extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
    form: PropTypes.shape({ validateFields: PropTypes.func.isRequired }).isRequired,
    fieldInits: PropTypes.shape({ cop_product_no: PropTypes.string }).isRequired,
    currencies: PropTypes.arrayOf(PropTypes.shape({ curr_code: PropTypes.string })),
    units: PropTypes.arrayOf(PropTypes.shape({ value: PropTypes.string })),
    tradeCountries: PropTypes.arrayOf(PropTypes.shape({ cntry_co: PropTypes.string })),
    hscodes: PropTypes.arrayOf(PropTypes.shape({ hscode: PropTypes.string.isRequired })),
    action: PropTypes.string.isRequired,
    itemData: PropTypes.shape({ cop_product_no: PropTypes.string }).isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  state = { fieldInits: {} }
  componentWillReceiveProps(nextProps) {
    if (this.props.hscodes !== nextProps.hscodes) {
      if (nextProps.hscodes.data.length === 1) {
        const hscode = nextProps.hscodes.data[0];
        const firstUnit = this.props.units.filter(unit => unit.text === hscode.first_unit)[0];
        const unit1 = firstUnit ? firstUnit.value : '';
        const secondUnit = this.props.units.filter(unit => unit.text === hscode.second_unit)[0];
        const unit2 = secondUnit ? secondUnit.value : '';
        const hsField = {
          unit_1: unit1,
          unit_2: unit2,
          customs_control: hscode.customs,
          inspection_quarantine: hscode.inspection,
        };
        const gname = this.props.form.getFieldValue('g_name');
        if (!gname) {
          hsField.g_name = hscode.product_name;
        }
        this.props.form.setFieldsValue(hsField);
      } else {
        this.props.form.setFieldsValue({
          unit_1: '',
          unit_2: '',
          customs_control: '',
          inspection_quarantine: '',
        });
      }
    }
    if (nextProps.itemData !== this.props.itemData) {
      const fieldInits = getFieldInits(nextProps.itemData);
      this.setState({ fieldInits });
    }
  }
  msg = formatMsg(this.props.intl)
  handleHscodeChange = (value) => {
    const { hscodes, form } = this.props;
    form.setFieldsValue({ g_model: '' });
    this.props.loadHscodes({
      tenantId: this.props.tenantId,
      pageSize: hscodes.pageSize,
      current: hscodes.current,
      searchText: value,
    });
  }
  handleCopNoChange = (e) => {
    this.props.form.setFieldsValue({ src_product_no: e.target.value });
  }
  handleShowDeclElementModal = () => {
    const { form } = this.props;
    const { fieldInits } = this.state;
    this.props.getElementByHscode(form.getFieldValue('hscode')).then((result) => {
      if (!result.error) {
        this.props.showDeclElementsModal(
          result.data.declared_elements,
          fieldInits.id,
          form.getFieldValue('g_model'),
          false,
          form.getFieldValue('g_name')
        );
      }
    });
  }
  handleShowApplyCertsModal = () => {
    this.props.toggleApplyCertsModal(true);
  }
  handleModalChange = (model) => {
    this.props.form.setFieldsValue({ g_model: model });
  }
  handleApplCertChange = (cert) => {
    this.props.form.setFieldsValue({ appl_cert_name: cert });
  }
  render() {
    const {
      form: { getFieldDecorator }, currencies, units, tradeCountries, hscodes, action,
    } = this.props;
    const { fieldInits } = this.state;
    const currencyOptions = currencies.map(curr => ({
      value: curr.curr_code,
      text: `${curr.curr_code} | ${curr.curr_name}`,
      search: `${curr.curr_code}${curr.curr_symb}${curr.curr_name}`,
    }));
    const tradeCountriesOpts = tradeCountries.map(tc => ({
      value: tc.cntry_co,
      text: `${tc.cntry_co} | ${tc.cntry_name_cn}`,
      search: `${tc.cntry_co}${tc.cntry_name_en}${tc.cntry_name_cn}${tc.cntry_en_short}`,
    }));
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
    const formItemSpan4Layout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 2 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 22 },
      },
      colon: false,
    };

    return (
      <FormPane >
        <Card bodyStyle={{ padding: 16, paddingBottom: 0 }} >
          <Row>
            <Col span={6}>
              <FormItem {...formItemLayout} label={this.msg('copProductNo')}>
                {getFieldDecorator('cop_product_no', {
                  rules: [{ required: true, message: '商品货号必填' }],
                  initialValue: fieldInits.cop_product_no,
                })(<Input disabled={action !== 'create'} onChange={this.handleCopNoChange} />)}
              </FormItem>
            </Col>
            <Col span={12}>
              <FormItem {...formItemSpan2Layout} label={this.msg('enName')}>
                {getFieldDecorator('en_name', {
                  initialValue: fieldInits.en_name,
                })(<Input />)}
              </FormItem>
            </Col>
            <Col span={6}>
              <FormItem {...formItemLayout} label={this.msg('itemType')}>
                {getFieldDecorator('item_type', {
                  initialValue: fieldInits.item_type,
                })(<Select onChange={this.handleItemTypeChange}>
                  {CMS_TRADE_ITEM_TYPE.map(it =>
                    <Option key={it.value}>{it.text}</Option>)}
                </Select>)}
              </FormItem>
            </Col>
            <Col span={6}>
              <FormItem {...formItemLayout} label={this.msg('copUOM')}>
                {getFieldDecorator('cop_uom', {
                  initialValue: fieldInits.cop_uom,
                })(<Select showSearch showArrow optionFilterProp="search">
                  {
                    units.map(gt =>
                      <Option key={gt.value} search={`${gt.value}${gt.text}`}>{`${gt.value} | ${gt.text}`}</Option>)
                  }
                </Select>)}
              </FormItem>
            </Col>
            <Col span={6}>
              <FormItem {...formItemLayout} label={this.msg('processingMethod')}>
                {getFieldDecorator('proc_method', {
                  initialValue: fieldInits.proc_method,
                })(<Input />)}
              </FormItem>
            </Col>
            <Col span={6}>
              <FormItem {...formItemLayout} label={this.msg('materialIngredient')}>
                {getFieldDecorator('material_ingred', {
                  initialValue: fieldInits.material_ingred,
                })(<Input />)}
              </FormItem>
            </Col>
            <Col span={6}>
              <FormItem {...formItemLayout} label={this.msg('use')}>
                {getFieldDecorator('use', {
                  initialValue: fieldInits.use,
                })(<Input />)}
              </FormItem>
            </Col>
          </Row>
        </Card>
        <Card bodyStyle={{ padding: 16, paddingBottom: 0 }} >
          <Row>
            <Col span={6}>
              <FormItem {...formItemLayout} label={this.msg('hscode')}>
                {getFieldDecorator('hscode', {
                  rules: [{ required: true, message: '商品编码必填' }],
                  initialValue: fieldInits.hscode,
                })(<Select allowClear mode="combobox" optionFilterProp="search" onChange={this.handleHscodeChange} >
                  { hscodes.data.map(data => (<Option
                    value={data.hscode}
                    key={data.hscode}
                    search={data.hscode}
                  >{data.hscode}
                  </Option>))}
                </Select>)}
              </FormItem>
            </Col>
            <Col span={12}>
              <FormItem {...formItemSpan2Layout} label={this.msg('gName')}>
                {getFieldDecorator('g_name', {
                  initialValue: fieldInits.g_name,
                  rules: [{ required: true, message: '中文品名必填' }],
                })(<Input onChange={this.handleGNameChange} />)}
              </FormItem>
            </Col>
            <Col span={6}>
              <FormItem {...formItemLayout} label={this.msg('confidence')}>
                {getFieldDecorator('confidence', {
                  initialValue: fieldInits.confidence,
                })(<Rate allowHalf />)}
              </FormItem>
            </Col>
            <Col span={24}>
              <FormItem {...formItemSpan4Layout} label={this.msg('gModel')}>
                {getFieldDecorator('g_model', {
                  initialValue: fieldInits.g_model,
                  rules: [{ required: true, message: '规格型号必填' }],
                })(<Input addonAfter={<Button type="primary" ghost size="small" onClick={this.handleShowDeclElementModal}><Icon type="ellipsis" /></Button>} />)}
              </FormItem>
            </Col>
            <Col span={6}>
              <FormItem {...formItemLayout} label={this.msg('unit1')}>
                {getFieldDecorator('unit_1', {
                  initialValue: fieldInits.unit_1,
                })(<Select >
                  {
                    units.map(gt =>
                      <Option key={gt.value} search={`${gt.value}${gt.text}`}>{`${gt.value} | ${gt.text}`}</Option>)
                  }
                </Select>)}
              </FormItem>
            </Col>
            <Col span={6}>
              <FormItem {...formItemLayout} label={this.msg('unit2')}>
                {getFieldDecorator('unit_2', {
                  initialValue: fieldInits.unit_2,
                })(<Select >
                  {
                    units.map(gt =>
                      <Option key={gt.value} search={`${gt.value}${gt.text}`}>{`${gt.value} | ${gt.text}`}</Option>)
                  }
                </Select>)}
              </FormItem>
            </Col>

            <Col span={6}>
              <FormItem {...formItemLayout} label={this.msg('gUnit1')}>
                {getFieldDecorator('g_unit_1', {
                  initialValue: fieldInits.g_unit_1,
                })(<Select showSearch showArrow optionFilterProp="search">
                  {
                  units.map(gt =>
                    <Option key={gt.value} search={`${gt.value}${gt.text}`}>{`${gt.value} | ${gt.text}`}</Option>)
                }
                </Select>)}
              </FormItem>
            </Col>
            <Col span={6}>
              <FormItem {...formItemLayout} label={this.msg('gUnit2')}>
                {getFieldDecorator('g_unit_2', {
                  initialValue: fieldInits.g_unit_2,
                })(<Select showSearch showArrow optionFilterProp="search">
                  {
                  units.map(gt =>
                    <Option key={gt.value} search={`${gt.value}${gt.text}`}>{`${gt.value} | ${gt.text}`}</Option>)
                }
                </Select>)}
              </FormItem>
            </Col>
            <Col span={6}>
              <FormItem {...formItemLayout} label={this.msg('unitNetWt')}>
                {getFieldDecorator('unit_net_wt', {
                  initialValue: fieldInits.unit_net_wt,
                })(<Input />)}
              </FormItem>
            </Col>
            <Col span={6}>
              <FormItem {...formItemLayout} label={this.msg('fixedQty')}>
                {getFieldDecorator('fixed_qty', {
                  initialValue: fieldInits.fixed_qty,
                })(<Input />)}
              </FormItem>
            </Col>
            <Col span={6}>
              <FormItem {...formItemLayout} label={this.msg('fixedUnit')}>
                {getFieldDecorator('fixed_unit', {
                  initialValue: fieldInits.fixed_unit,
                })(<Select showSearch showArrow optionFilterProp="search">
                  {
                units.map(gt =>
                  <Option key={gt.value} search={`${gt.value}${gt.text}`}>{`${gt.value} | ${gt.text}`}</Option>)
              }
                </Select>)}
              </FormItem>
            </Col>
            <Col span={6}>
              <FormItem {...formItemLayout} label={this.msg('gUnit3')}>
                {getFieldDecorator('g_unit_3', {
                  initialValue: fieldInits.g_unit_3,
                })(<Select showSearch showArrow optionFilterProp="search">
                  {
                  units.map(gt =>
                    <Option key={gt.value} search={`${gt.value}${gt.text}`}>{`${gt.value} | ${gt.text}`}</Option>)
                }
                </Select>)}
              </FormItem>
            </Col>
            <Col span={6}>
              <FormItem {...formItemLayout} label={this.msg('unitPrice')}>
                {getFieldDecorator('unit_price', {
                  initialValue: fieldInits.unit_price,
                })(<Input />)}
              </FormItem>
            </Col>
            <Col span={6}>
              <FormItem {...formItemLayout} label={this.msg('currency')}>
                {getFieldDecorator('currency', {
                  initialValue: fieldInits.currency,
                })(<Select showSearch showArrow optionFilterProp="search">
                  {
                  currencyOptions.map(data => (
                    <Option key={data.value} search={`${data.search}`} >
                      {`${data.text}`}
                    </Option>))}
                </Select>)}
              </FormItem>
            </Col>
            <Col span={6}>
              <FormItem {...formItemLayout} label={this.msg('origCountry')}>
                {getFieldDecorator('origin_country', {
                  initialValue: fieldInits.origin_country,
                })(<Select showSearch showArrow optionFilterProp="search">
                  {
                  tradeCountriesOpts.map(data => (
                    <Option key={data.value} search={`${data.search}`} >
                      {`${data.text}`}
                    </Option>))}
                </Select>)}
              </FormItem>
            </Col>
            <Col span={6}>
              <FormItem {...formItemLayout} label={this.msg('specialNo')}>
                {getFieldDecorator('specialMark', {
                  initialValue: fieldInits.specialMark,
                })(<Select mode="multiple" style={{ width: '100%' }} >
                  { SPECIAL_COPNO_TERM.map(data => (<Option value={data.value} key={data.value}>
                    {data.text}</Option>))}
                </Select>)}
              </FormItem>
            </Col>
            <Col span={6}>
              <FormItem {...formItemLayout} label={this.msg('customsPermit')}>
                {getFieldDecorator('customs_control', {
                  initialValue: fieldInits.customs_control,
                })(<Input disabled />)}
              </FormItem>
            </Col>
            <Col span={6}>
              <FormItem {...formItemLayout} label={this.msg('ciqPermit')}>
                {getFieldDecorator('inspection_quarantine', {
                  initialValue: fieldInits.inspection_quarantine,
                })(<Input disabled />)}
              </FormItem>
            </Col>
            <Col span={12}>
              <FormItem {...formItemSpan2Layout} label={this.msg('applCertCode')}>
                {getFieldDecorator('appl_cert_name', {
                  initialValue: fieldInits.appl_cert_name,
                })(<Input addonAfter={<Button type="primary" ghost size="small" onClick={this.handleShowApplyCertsModal}><Icon type="ellipsis" /></Button>} />)}
              </FormItem>
            </Col>
            <Col span={6}>
              <FormItem {...formItemLayout} {...formItemLayout} label={this.msg('preClassifyNo')}>
                {getFieldDecorator('pre_classify_no', {
                  initialValue: fieldInits.pre_classify_no,
                })(<Input />)}
              </FormItem>
            </Col>
            <Col span={6}>
              <FormItem {...formItemLayout} label={this.msg('preClassifyStartDate')}>
                {getFieldDecorator('pre_classify_start_date', {
                  initialValue: fieldInits.pre_classify_start_date,
                })(<DatePicker style={{ width: '100%' }} />)}
              </FormItem>
            </Col>
            <Col span={6}>
              <FormItem {...formItemLayout} label={this.msg('preClassifyEndDate')}>
                {getFieldDecorator('pre_classify_end_date', {
                  initialValue: fieldInits.pre_classify_end_date,
                })(<DatePicker style={{ width: '100%' }} />)}
              </FormItem>
            </Col>
            <Col span={6}>
              <FormItem {...formItemLayout} label={this.msg('remark')}>
                {getFieldDecorator('remark', {
                  initialValue: fieldInits.remark,
                })(<Input.TextArea autosize={{ minRows: 1, maxRows: 16 }} />)}
              </FormItem>
            </Col>
          </Row>
        </Card>
        <DeclElementsModal onOk={this.handleModalChange} />
        <ApplyCertsModal
          itemId={this.props.itemData.id}
          selectedRowKeys={fieldInits.appl_cert_code}
          onOk={this.handleApplCertChange}
        />
      </FormPane>
    );
  }
}
