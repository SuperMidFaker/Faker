import React, { Component } from 'react';
import moment from 'moment';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Card, Col, DatePicker, Form, Row, Icon, Input, Select, Modal, Button } from 'antd';
import { CIQ_PACK_TYPE } from 'common/constants';
import { hideGoodsModal,
  updateCiqGood,
  loadCiqDeclGoods,
  searchCountries,
  setFixedCountry,
  extendCountryParam,
  toggleGoodsLicenceModal,
  toggleGoodsContModal,
} from 'common/reducers/cmsCiqDeclare';
import { FormRemoteSearchSelect } from '../../common/form/formSelect';
import GoodsLicenceModal from './goodsLecenceModal';
import StandbyInfo from '../popover/standbyInfo';
import GoodsLicenceInfo from '../popover/goodsLicenceInfo';
import GoodsContModal from './goodsContModal';

const FormItem = Form.Item;
const InputGroup = Input.Group;
const { Option } = Select;

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
  }
)
@Form.create()
export default class GoodsModal extends Component {
  static propTypes = {
    ioType: PropTypes.oneOf(['in', 'out']),
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.visible !== this.props.visible && nextProps.visible) {
      const { countries } = this.props;
      if (!countries.find(coun => coun.country_code === nextProps.data.orig_country)) {
        this.props.extendCountryParam(nextProps.data.orig_country);
      }
    }
  }
  handleCancel = () => {
    this.props.hideGoodsModal();
  }
  handleOk = () => {
    const { form } = this.props;
    const values = form.getFieldsValue();
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
      <Modal title="商品信息" visible={visible} onOk={this.handleOk} onCancel={this.handleCancel} width={1200}>
        <Form layout="horizontal" hideRequiredMark className="form-layout-multi-col">
          <Card
            bodyStyle={{ padding: 16, paddingBottom: 0 }}
            style={{ marginBottom: 0 }}
            hoverable={false}
          >
            <Row>
              <Col span="6">
                <FormItem {...formItemLayout} colon={false} label="HS编码" required >
                  {getFieldDecorator('hscode', {
                    initialValue: data.hscode,
                  })(<Input />)}
                </FormItem>
              </Col>
              <Col span="6">
                <FormItem {...formItemLayout} colon={false} label="CIQ代码" required >
                  {getFieldDecorator('ciq_code', {
                    initialValue: data.ciq_code,
                  })(<Select />)}
                </FormItem>
              </Col>
              <Col span="6">
                <FormItem {...formItemLayout} colon={false} label="监管条件" >
                  {getFieldDecorator('insp_type', {
                    initialValue: data.insp_type,
                  })(<Input disabled />)}
                </FormItem>
              </Col>
              <Col span="6">
                <FormItem {...formItemLayout} colon={false} label="货物属性" required >
                  {getFieldDecorator('goods_attr', {
                    initialValue: data.goods_attr,
                  })(<Input />)}
                </FormItem>
              </Col>
              <Col span="12">
                <FormItem {...formItemSpan2Layout} colon={false} label="货物名称" required >
                  {getFieldDecorator('g_name', {
                    initialValue: data.g_name,
                  })(<Input />)}
                </FormItem>
              </Col>
              <Col span="6">
                <FormItem {...formItemLayout} colon={false} label="英文名称" >
                  {getFieldDecorator('en_name', {
                    initialValue: data.en_name,
                  })(<Input />)}
                </FormItem>
              </Col>
              <Col span="6">
                <FormItem {...formItemLayout} colon={false} label="货物品牌" >
                  {getFieldDecorator('goods_brand', {
                    initialValue: data.goods_brand,
                  })(<Input />)}
                </FormItem>
              </Col>
              <Col span="6">
                <FormItem {...formItemLayout} colon={false} label="货物规格" >
                  {getFieldDecorator('goods_spec', {
                    initialValue: data.goods_spec,
                  })(<Input />)}
                </FormItem>
              </Col>
              <Col span="6">
                <FormItem {...formItemLayout} colon={false} label="货物型号" >
                  {getFieldDecorator('g_model', {
                    initialValue: data.g_model,
                  })(<Input />)}
                </FormItem>
              </Col>
              <Col span="6">
                <FormItem {...formItemLayout} colon={false} label="用途" required >
                  {getFieldDecorator('use_to', {
                    initialValue: data.use_to,
                  })(<Input />)}
                </FormItem>
              </Col>
              <Col span="6">
                <FormItem {...formItemLayout} colon={false} label="成分/原料" >
                  {getFieldDecorator('stuff', {
                    initialValue: data.stuff,
                  })(<Input />)}
                </FormItem>
              </Col>
              <Col span="6">
                <FormItem {...formItemLayout} colon={false} label="报检数量" required >
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
              <Col span="6">
                <FormItem {...formItemLayout} colon={false} label="报检重量" >
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
              <Col span="6">
                <FormItem {...formItemLayout} colon={false} label="HS标准量" required >
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
              <Col span="6">
                <FormItem {...formItemLayout} colon={false} label="包装数量" >
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
              <Col span="6">
                <FormItem {...formItemLayout} colon={false} label="货物单价" >
                  {getFieldDecorator('dec_price', {
                    initialValue: data.dec_price,
                  })(<Input />)}
                </FormItem>
              </Col>
              <Col span="6">
                <FormItem {...formItemLayout} colon={false} label="货物总值" required >
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
                  label="原产国"
                  col={8}
                  field="orig_country"
                  getFieldDecorator={form.getFieldDecorator}
                  formData={data}
                  options={countries.map(coun => ({
                    value: coun.country_code,
                    text: `${coun.country_code} | ${coun.country_cn_name}`,
                    search: `${coun.country_code}${coun.country_cn_name}`,
                  }))}
                  onSearch={this.handleSearchCountries}
                  onSelect={this.handleCountrySelect}
                />}
              {ioType === 'in' && <Col span="6">
                <FormItem {...formItemLayout} colon={false} label="原产地区" >
                  {getFieldDecorator('orig_place_code', {
                    initialValue: data.orig_place_code,
                  })(<Input />)}
                </FormItem>
              </Col>}
              {ioType === 'in' && <Col span="6">
                <FormItem {...formItemLayout} colon={false} label="境外生产企业" >
                  {getFieldDecorator('eng_man_ent_cnm', {
                    initialValue: data.eng_man_ent_cnm,
                  })(<Input />)}
                </FormItem>
              </Col>}
              {ioType === 'out' && <Col span="6">
                <FormItem {...formItemLayout} colon={false} label="产地" >
                  {getFieldDecorator('orig_place_code', {
                    initialValue: data.orig_place_code,
                  })(<Input />)}
                </FormItem>
              </Col>}
              {ioType === 'out' && <Col span="6">
                <FormItem {...formItemLayout} colon={false} label="生产单位" required >
                  {getFieldDecorator('eng_man_ent_cnm', {
                    initialValue: data.eng_man_ent_cnm,
                  })(<Input />)}
                </FormItem>
              </Col>}
              {ioType === 'out' && <Col span="6">
                <FormItem {...formItemLayout} colon={false} label="生产单位注册号" required >
                  {getFieldDecorator('mnufctr_reg_no', {
                    initialValue: data.mnufctr_reg_no,
                  })(<Input />)}
                </FormItem>
              </Col>}
              <Col span="6">
                <FormItem {...formItemLayout} colon={false} label="生产批号" >
                  {getFieldDecorator('prod_batch_no', {
                    initialValue: data.prod_batch_no,
                  })(<Input />)}
                </FormItem>
              </Col>
              <Col span="6">
                <FormItem {...formItemLayout} colon={false} label="生产日期" >
                  {getFieldDecorator('produce_date', {
                    initialValue: data.produce_date && moment(data.produce_date, 'YYYY/MM/DD'),
                  })(<DatePicker style={{ width: '100%' }} />)}
                </FormItem>
              </Col>
              {ioType === 'in' && <Col span="6">
                <FormItem {...formItemLayout} colon={false} label="产品有效期" >
                  {getFieldDecorator('prod_valid_dt', {
                    initialValue: data.prod_valid_dt && moment(data.prod_valid_dt, 'YYYY/MM/DD'),
                  })(<DatePicker style={{ width: '100%' }} />)}
                </FormItem>
              </Col>}
              {ioType === 'in' && <Col span="6">
                <FormItem {...formItemLayout} colon={false} label="产品保质期" >
                  {getFieldDecorator('prod_qgp', {
                    initialValue: data.prod_qgp,
                  })(<Input addonAfter="天" />)}
                </FormItem>
                </Col>}
              <Col span="6">
                <FormItem {...formItemLayout} colon={false} label="产品资质" >
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
              <Col span="6">
                <FormItem {...formItemLayout} colon={false} label="危险货物信息" >
                  <Input addonAfter={<GoodsLicenceInfo goodsId={data.id} />} />
                </FormItem>
              </Col>
              <Col span="6">
                <FormItem {...formItemLayout} colon={false} label="备用信息" >
                  <Input addonAfter={<StandbyInfo goodsId={data.id} />} />
                </FormItem>
              </Col>
              <Col span="6">
                <FormItem {...formItemLayout} colon={false} label="箱货关联信息" >
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
            </Row>
          </Card>
        </Form>
        <GoodsLicenceModal />
        <GoodsContModal />
      </Modal>
    );
  }
}
