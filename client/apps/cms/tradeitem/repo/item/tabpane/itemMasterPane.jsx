import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { connect } from 'react-redux';
import { Button, Card, DatePicker, Form, Icon, Input, Select, Switch, Row, Col, message } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import FormPane from 'client/components/FormPane';
import { format } from 'client/common/i18n/helpers';
import { loadHscodes, getElementByHscode } from 'common/reducers/cmsHsCode';
import { showDeclElementsModal } from 'common/reducers/cmsManifest';
import { SPECIAL_COPNO_TERM, CMS_TRADE_ITEM_TYPE } from 'common/constants';
import DeclElementsModal from '../../../../common/modal/declElementsModal';
import messages from '../../../message.i18n';

const formatMsg = format(messages);
const FormItem = Form.Item;
const { Option } = Select;

function getFieldInits(formData) {
  const init = {};
  if (formData) {
    ['cop_product_no', 'src_product_no', 'hscode', 'g_name', 'en_name', 'g_model', 'element', 'g_unit_1', 'g_unit_2', 'g_unit_3',
      'unit_1', 'unit_2', 'fixed_unit', 'origin_country', 'customs_control', 'inspection_quarantine',
      'currency', 'pre_classify_no', 'remark',
    ].forEach((fd) => {
      init[fd] = formData[fd] === undefined ? '' : formData[fd];
    });
    ['unit_net_wt', 'unit_price', 'fixed_qty', 'pre_classify_start_date', 'pre_classify_end_date'].forEach((fd) => {
      init[fd] = formData[fd] === undefined ? null : formData[fd];
    });
    init.specialMark = formData.special_mark ? formData.special_mark.split('/') : [];
    if (formData.srcNos && formData.srcNos.length > 0) {
      init.src_product_no = `${formData.cop_product_no}_${formData.srcNos.length}`;
      let num = 0;
      for (let i = 0; i < formData.srcNos.length; i++) {
        if (formData.srcNos[i] === init.src_product_no) {
          num += 1;
          init.src_product_no = `${formData.cop_product_no}_${formData.srcNos.length + num}`;
          i = 0;
        }
      }
    }
    ['pre_classify_start_date', 'pre_classify_end_date'].forEach((fd) => {
      init[fd] = !formData[fd] ? null : moment(formData[fd]);
    });
    ['pre_classify_no', 'remark'].forEach((fd) => {
      init[fd] = formData[fd] === undefined ? '' : formData[fd];
    });
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
        this.props.form.setFieldsValue({
          g_name: hscode.product_name,
          element: hscode.declared_elements,
          unit_1: unit1,
          unit_2: unit2,
          customs_control: hscode.customs,
          inspection_quarantine: hscode.inspection,
        });
      } else {
        this.props.form.setFieldsValue({
          g_name: '',
          element: '',
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
  msg = key => formatMsg(this.props.intl, key);
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
  handleSrcNoChange = (e) => {
    this.props.itemData.srcNos.forEach((no) => {
      if (no === e.target.value) {
        message.error('该源标记号已存在', 5);
      }
    });
  }
  handleShowDeclElementModal = () => {
    const { form } = this.props;
    const { fieldInits } = this.state;
    this.props.getElementByHscode(form.getFieldValue('hscode')).then((result) => {
      if (!result.error) {
        this.props.showDeclElementsModal(result.data.declared_elements, fieldInits.id, form.getFieldValue('g_model'), false, form.getFieldValue('g_name'));
      }
    });
  }
  handleModalChange = (model) => {
    this.props.form.setFieldsValue({ g_model: model });
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
      <FormPane fullscreen={this.props.fullscreen}>
        <Card bodyStyle={{ padding: 16, paddingBottom: 0 }} hoverable={false}>
          <Row>
            <Col span={6}>
              <FormItem {...formItemLayout} label={this.msg('copProductNo')}>
                {getFieldDecorator('cop_product_no', {
                  rules: [{ required: true, message: '商品货号必填' }],
                  initialValue: fieldInits.cop_product_no,
                })(<Input disabled={action !== 'create'} onChange={this.handleCopNoChange} />)}
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
            <Col span={12}>
              <FormItem {...formItemSpan2Layout} label={this.msg('enName')}>
                {getFieldDecorator('en_name', {
                  initialValue: fieldInits.en_name,
                })(<Input />)}
              </FormItem>
            </Col>
            <Col span={6}>
              <FormItem {...formItemLayout} label={this.msg('srcProductNo')}>
                {getFieldDecorator('src_product_no', {
                  initialValue: fieldInits.src_product_no,
                })(<Input disabled={action !== 'fork'} onChange={this.handleSrcNoChange} />)}
              </FormItem>
            </Col>
            <Col span={6}>
              <FormItem {...formItemLayout} label={this.msg('copUOM')}>
                {getFieldDecorator('cop_uom', {
                  initialValue: fieldInits.cop_uom,
                })(<Input />)}
              </FormItem>
            </Col>
            <Col span={6}>
              <FormItem {...formItemLayout} label={this.msg('markPass')}>
                {getFieldDecorator('pass', {
                  initialValue: fieldInits.pass === 'Y',
                })(<Switch />)}
              </FormItem>
            </Col>
          </Row>
        </Card>
        <Card bodyStyle={{ padding: 16, paddingBottom: 0 }} hoverable={false}>
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
                })(<Input />)}
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
              <FormItem {...formItemLayout} label={this.msg('unit1')} required>
                {getFieldDecorator('unit_1', {
                  initialValue: fieldInits.unit_1,
                  rules: [{ required: true, message: '法一计量单位必填' }],
                })(<Select showSearch showArrow optionFilterProp="search">
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
                })(<Select showSearch showArrow optionFilterProp="search">
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
              <FormItem {...formItemLayout} label={this.msg('unitNetWt')}>
                {getFieldDecorator('unit_net_wt', {
                  initialValue: fieldInits.unit_net_wt,
                })(<Input />)}
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
            <Col span={24}>
              <FormItem {...formItemSpan4Layout} label={this.msg('applCertCode')}>
                {getFieldDecorator('appl_cert_code', {
                  initialValue: fieldInits.appl_cert_code,
                })(<Input placeholder="多个证书以;分隔" />)}
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
      </FormPane>
    );
  }
}
