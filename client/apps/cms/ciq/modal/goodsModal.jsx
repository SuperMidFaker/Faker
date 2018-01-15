import React, { Component } from 'react';
import moment from 'moment';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Col, DatePicker, Form, Row, Icon, Input, Select, Modal, Button } from 'antd';
import { CIQ_PACK_TYPE, CIQ_GOODS_ATTR, CIQ_GOODS_USE_TO } from 'common/constants';
import { hideGoodsModal,
  updateCiqGood,
  loadCiqDeclGoods,
  searchCountries,
  setFixedCountry,
  extendCountryParam,
  toggleGoodsLicenceModal,
  toggleGoodsContModal,
  getCiqCodeByHscode,
} from 'common/reducers/cmsCiqDeclare';
import { intlShape, injectIntl } from 'react-intl';
import { format } from 'client/common/i18n/helpers';
import { FormRemoteSearchSelect } from '../../common/form/formSelect';
import GoodsLicenceModal from './goodsLicenceModal';
import StandbyPopover from '../popover/standbyPopover';
import DangerGoodsPopover from '../popover/dangerGoodsPopover';
import GoodsContModal from './goodsContModal';
import messages from '../message.i18n';

const formatMsg = format(messages);
const FormItem = Form.Item;
const InputGroup = Input.Group;
const { Option } = Select;

function unique(arr) {
  const hash = {};
  const newArr = arr.reduce((item, next) => {
    if (!hash[next.country_code]) {
      hash[next.country_code] = true;
      item.push(next);
    }
    return item;
  }, []);
  return newArr;
}

@injectIntl
@connect(
  state => ({
    visible: state.cmsCiqDeclare.goodsModal.visible,
    data: state.cmsCiqDeclare.goodsModal.data,
    countries: state.cmsCiqDeclare.ciqParams.countries,
    currencies: state.cmsCiqDeclare.ciqParams.currencies,
    units: state.cmsCiqDeclare.ciqParams.units,
    fixedCountries: state.cmsCiqDeclare.ciqParams.fixedCountries,
  }),
  {
    hideGoodsModal,
    updateCiqGood,
    loadCiqDeclGoods,
    searchCountries,
    setFixedCountry,
    extendCountryParam,
    toggleGoodsLicenceModal,
    toggleGoodsContModal,
    getCiqCodeByHscode,
  }
)
@Form.create()
export default class GoodsModal extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    ioType: PropTypes.oneOf(['in', 'out']),
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  state = {
    ciqcode: [],
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.visible !== this.props.visible && nextProps.visible) {
      const { countries } = this.props;
      if (!countries.find(coun => coun.country_code === nextProps.data.orig_country)) {
        this.props.extendCountryParam(nextProps.data.orig_country);
      }
      this.props.getCiqCodeByHscode(nextProps.data.hscode).then((result) => {
        if (!result.error) {
          this.setState({
            ciqcode: result.data,
          });
        }
      });
    }
    if (!nextProps.visible) {
      this.props.form.resetFields();
    }
  }
  msg = (descriptor, values) => formatMsg(this.props.intl, descriptor, values)
  handleCancel = () => {
    this.props.hideGoodsModal();
  }
  handleOk = () => {
    const { form } = this.props;
    const values = form.getFieldsValue();
    if (values.goods_attr.length !== 0) {
      const goodsAttr = values.goods_attr.join(',');
      values.goods_attr = goodsAttr;
    } else {
      values.goods_attr = '';
    }
    this.props.updateCiqGood(this.props.data.id, values).then((result) => {
      if (!result.error) {
        this.props.loadCiqDeclGoods(this.context.router.params.declNo);
      }
    });
    this.props.hideGoodsModal();
  }
  handleSearchCountries = (field, value) => {
    if (value) {
      this.props.searchCountries(value);
    }
  }
  handleCountrySelect = (value) => {
    const { fixedCountries, countries } = this.props;
    const country = countries.find(coun => coun.country_code === value);
    if (!(fixedCountries.find(coun => coun.country_code === country.country_code))) {
      fixedCountries.push(country);
    }
    this.props.setFixedCountry(fixedCountries);
  }
  showGoodsLicenceModal = () => {
    const { data } = this.props;
    this.props.toggleGoodsLicenceModal(true, {
      hscode: data.hscode,
      gName: data.g_name,
      ciqCode: data.ciq_code,
      gNo: data.g_no,
      id: data.id,
      preEntrySeqNo: data.pre_entry_seq_no,
    });
  }
  showGoodsContModal = () => {
    const { data } = this.props;
    this.props.toggleGoodsContModal(true, {
      hscode: data.hscode,
      gName: data.g_name,
      ciqCode: data.ciq_code,
      gNo: data.g_no,
      id: data.id,
      preEntrySeqNo: data.pre_entry_seq_no,
    });
  }
  render() {
    const {
      visible, ioType, data, units, countries, currencies, form, form: { getFieldDecorator },
    } = this.props;
    const uniqueCoun = unique(countries);
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
    return (
      <Modal title={this.msg('goodsInfo')} visible={visible} okText={this.msg('save')} onOk={this.handleOk} onCancel={this.handleCancel} width={1200}>
        <Form layout="horizontal" hideRequiredMark className="form-layout-multi-col">
          <Row>
            <Col span={6}>
              <FormItem {...formItemLayout} colon={false} label={this.msg('hscode')} required >
                {getFieldDecorator('hscode', {
                    initialValue: data.hscode,
                  })(<Input />)}
              </FormItem>
            </Col>
            <Col span={6}>
              <FormItem {...formItemLayout} colon={false} label={this.msg('ciqCode')} required >
                {getFieldDecorator('ciq_code', {
                    initialValue: data.ciq_code,
                  })(<Select>
                    {this.state.ciqcode.map(item =>
                      (<Option key={item.ciqcode} value={item.ciqcode}>
                        {item.ciqcode}
                      </Option>))}
                  </Select>)}
              </FormItem>
            </Col>
            <Col span={6}>
              <FormItem {...formItemLayout} colon={false} label={this.msg('inspType')} >
                {getFieldDecorator('insp_type', {
                    initialValue: data.insp_type,
                  })(<Input disabled />)}
              </FormItem>
            </Col>
            <Col span={6}>
              <FormItem {...formItemLayout} colon={false} label={this.msg('goodsAttr')} required >
                {getFieldDecorator('goods_attr', {
                    initialValue: data.goods_attr ? data.goods_attr.split(',') : [],
                  })(<Select mode="multiple">
                    {CIQ_GOODS_ATTR.map(type =>
                      <Option key={type.value} value={type.value}>{type.text}</Option>)}
                  </Select>)}
              </FormItem>
            </Col>
            <Col span="12">
              <FormItem {...formItemSpan2Layout} colon={false} label={this.msg('gName')} required >
                {getFieldDecorator('g_name', {
                    initialValue: data.g_name,
                  })(<Input />)}
              </FormItem>
            </Col>
            <Col span={6}>
              <FormItem {...formItemLayout} colon={false} label={this.msg('eName')} >
                {getFieldDecorator('en_name', {
                    initialValue: data.en_name,
                  })(<Input />)}
              </FormItem>
            </Col>
            <Col span={6}>
              <FormItem {...formItemLayout} colon={false} label={this.msg('goodsBrand')} >
                {getFieldDecorator('goods_brand', {
                    initialValue: data.goods_brand,
                  })(<Input />)}
              </FormItem>
            </Col>
            <Col span={6}>
              <FormItem {...formItemLayout} colon={false} label={this.msg('goodsSpec')} >
                {getFieldDecorator('goods_spec', {
                    initialValue: data.goods_spec,
                  })(<Input />)}
              </FormItem>
            </Col>
            <Col span={6}>
              <FormItem {...formItemLayout} colon={false} label={this.msg('gModel')} >
                {getFieldDecorator('g_model', {
                    initialValue: data.g_model,
                  })(<Input />)}
              </FormItem>
            </Col>
            <Col span={6}>
              <FormItem {...formItemLayout} colon={false} label={this.msg('useTo')} required >
                {getFieldDecorator('use_to', {
                    initialValue: data.use_to,
                  })(<Select>
                    {CIQ_GOODS_USE_TO.map(item =>
                      <Option key={item.value} value={item.value}>{`${item.value} | ${item.text}`}</Option>)}
                  </Select>)}
              </FormItem>
            </Col>
            <Col span={6}>
              <FormItem {...formItemLayout} colon={false} label={this.msg('stuff')} >
                {getFieldDecorator('stuff', {
                    initialValue: data.stuff,
                  })(<Input />)}
              </FormItem>
            </Col>
            <Col span={6}>
              <FormItem {...formItemLayout} colon={false} label={this.msg('declQty')} required >
                <InputGroup compact>
                  {getFieldDecorator('g_qty', {
                      initialValue: data.g_qty,
                    })(<Input style={{ width: '50%' }} />)}
                  {getFieldDecorator('g_unit', {
                      initialValue: data.g_unit,
                    })(<Select showSearch optionFilterProp="children" style={{ width: '50%' }}>
                      {units.map(unit =>
                        (<Option key={unit.unit_code} value={unit.unit_code}>
                          {unit.unit_name}
                        </Option>))}
                    </Select>)}
                </InputGroup>
              </FormItem>
            </Col>
            <Col span={6}>
              <FormItem {...formItemLayout} colon={false} label={this.msg('declWt')} >
                <InputGroup compact>
                  {getFieldDecorator('weight', {
                      initialValue: data.weight,
                    })(<Input style={{ width: '50%' }} />)}
                  {getFieldDecorator('wt_meas_unit', {
                      initialValue: data.wt_meas_unit,
                    })(<Select showSearch optionFilterProp="children" style={{ width: '50%' }}>
                      {units.map(unit =>
                        (<Option key={unit.unit_code} value={unit.unit_code}>
                          {unit.unit_name}
                        </Option>))}
                    </Select>)}
                </InputGroup>
              </FormItem>
            </Col>
            <Col span={6}>
              <FormItem {...formItemLayout} colon={false} label={this.msg('stdQty')} required >
                <InputGroup compact>
                  {getFieldDecorator('std_qty', {
                      initialValue: data.std_qty,
                    })(<Input style={{ width: '50%' }} />)}
                  {getFieldDecorator('std_unit', {
                      initialValue: data.std_unit,
                    })(<Select showSearch optionFilterProp="children" style={{ width: '50%' }}>
                      {units.map(unit =>
                        (<Option key={unit.unit_code} value={unit.unit_code}>
                          {unit.unit_name}
                        </Option>))}
                    </Select>)}
                </InputGroup>
              </FormItem>
            </Col>
            <Col span={6}>
              <FormItem {...formItemLayout} colon={false} label={this.msg('packCount')} >
                <InputGroup compact>
                  {getFieldDecorator('std_pack_count', {
                      initialValue: data.std_pack_count,
                    })(<Input style={{ width: '40%' }} />)}
                  {getFieldDecorator('std_pack_type', {
                      initialValue: data.std_pack_type,
                    })(<Select showSearch optionFilterProp="children" style={{ width: '60%' }}>
                      {CIQ_PACK_TYPE.map(type =>
                        <Option key={type.value} value={type.value}>{type.text}</Option>)}
                    </Select>)}
                </InputGroup>
              </FormItem>
            </Col>
            <Col span={6}>
              <FormItem {...formItemLayout} colon={false} label={this.msg('decPrice')} >
                {getFieldDecorator('dec_price', {
                    initialValue: data.dec_price,
                  })(<Input />)}
              </FormItem>
            </Col>
            <Col span={6}>
              <FormItem {...formItemLayout} colon={false} label={this.msg('totalVal')} required >
                <InputGroup compact>
                  {getFieldDecorator('trade_total', {
                      initialValue: data.trade_total,
                    })(<Input style={{ width: '50%' }} />)}
                  {getFieldDecorator('trade_curr', {
                      initialValue: data.trade_curr,
                    })(<Select showSearch optionFilterProp="children" style={{ width: '50%' }}>
                      {currencies.map(currency =>
                        (<Option key={currency.curr_code} value={currency.curr_code}>
                          {currency.curr_name}
                        </Option>))}
                    </Select>)}
                </InputGroup>
              </FormItem>
            </Col>
            {ioType === 'in' &&
            <FormRemoteSearchSelect
              outercol={6}
              label={this.msg('origCountry')}
              col={8}
              field="orig_country"
              getFieldDecorator={form.getFieldDecorator}
              formData={data}
              options={uniqueCoun.map(coun => ({
                    value: coun.country_code,
                    text: `${coun.country_code} | ${coun.country_cn_name}`,
                    search: `${coun.country_code}${coun.country_cn_name}`,
                  }))}
              onSearch={this.handleSearchCountries}
              onSelect={this.handleCountrySelect}
            />}
            {ioType === 'in' && <Col span={6}>
              <FormItem {...formItemLayout} colon={false} label={this.msg('origPlace')} >
                {getFieldDecorator('orig_place_code', {
                    initialValue: data.orig_place_code,
                  })(<Input />)}
              </FormItem>
              </Col>}
            {ioType === 'in' && <Col span={6}>
              <FormItem {...formItemLayout} colon={false} label={this.msg('engManEntCnm')} >
                {getFieldDecorator('eng_man_ent_cnm', {
                    initialValue: data.eng_man_ent_cnm,
                  })(<Input />)}
              </FormItem>
              </Col>}
            {ioType === 'out' && <Col span={6}>
              <FormItem {...formItemLayout} colon={false} label={this.msg('origPlace')} >
                {getFieldDecorator('orig_place_code', {
                    initialValue: data.orig_place_code,
                  })(<Input />)}
              </FormItem>
              </Col>}
            {ioType === 'out' && <Col span={6}>
              <FormItem {...formItemLayout} colon={false} label={this.msg('engManEntCnm')} required >
                {getFieldDecorator('eng_man_ent_cnm', {
                    initialValue: data.eng_man_ent_cnm,
                  })(<Input />)}
              </FormItem>
              </Col>}
            {ioType === 'out' && <Col span={6}>
              <FormItem {...formItemLayout} colon={false} label={this.msg('mnufctrRegNo')} required >
                {getFieldDecorator('mnufctr_reg_no', {
                    initialValue: data.mnufctr_reg_no,
                  })(<Input />)}
              </FormItem>
              </Col>}
            <Col span={6}>
              <FormItem {...formItemLayout} colon={false} label={this.msg('prodBatchNo')} >
                {getFieldDecorator('prod_batch_no', {
                    initialValue: data.prod_batch_no,
                  })(<Input />)}
              </FormItem>
            </Col>
            <Col span={6}>
              <FormItem {...formItemLayout} colon={false} label={this.msg('produceDate')} >
                {getFieldDecorator('produce_date', {
                    initialValue: data.produce_date && moment(data.produce_date, 'YYYY/MM/DD'),
                  })(<DatePicker style={{ width: '100%' }} />)}
              </FormItem>
            </Col>
            {ioType === 'in' && <Col span={6}>
              <FormItem {...formItemLayout} colon={false} label={this.msg('prodValidDt')} >
                {getFieldDecorator('prod_valid_dt', {
                    initialValue: data.prod_valid_dt && moment(data.prod_valid_dt, 'YYYY/MM/DD'),
                  })(<DatePicker style={{ width: '100%' }} />)}
              </FormItem>
              </Col>}
            {ioType === 'in' && <Col span={6}>
              <FormItem {...formItemLayout} colon={false} label={this.msg('prodQgp')} >
                {getFieldDecorator('prod_qgp', {
                    initialValue: data.prod_qgp,
                  })(<Input addonAfter="天" />)}
              </FormItem>
            </Col>}
          </Row>
          <Row>
            <Col span={12}>
              <FormItem {...formItemSpan2Layout} colon={false} label={this.msg('goodsLicence')} >
                <Input addonAfter={
                  <Button
                    type="primary"
                    size="small"
                    ghost
                    onClick={this.showGoodsLicenceModal}
                  ><Icon type="ellipsis" /></Button>}
                />
              </FormItem>
            </Col>
            <Col span={12}>
              <FormItem {...formItemSpan2Layout} colon={false} label={this.msg('goodsContainer')} >
                <Input addonAfter={
                  <Button
                    type="primary"
                    size="small"
                    ghost
                    onClick={this.showGoodsContModal}
                  ><Icon type="ellipsis" /></Button>}
                />
              </FormItem>
            </Col>
            <Col span={12}>
              <FormItem {...formItemSpan2Layout} colon={false} label={this.msg('dangerInfo')} >
                <Input addonAfter={<DangerGoodsPopover goodsId={data.id} />} />
              </FormItem>
            </Col>
            <Col span={12}>
              <FormItem {...formItemSpan2Layout} colon={false} label={this.msg('standbyInfo')} >
                <Input addonAfter={<StandbyPopover goodsId={data.id} />} />
              </FormItem>
            </Col>
          </Row>
        </Form>
        <GoodsLicenceModal />
        <GoodsContModal />
      </Modal>
    );
  }
}
