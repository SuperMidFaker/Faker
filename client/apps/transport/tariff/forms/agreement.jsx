import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Card, Row, Col, Form, Input, Select, Radio } from 'antd';
import PricingLTL from './pricingLTL';
import PricingFTL from './pricingFTL';
import PricingCTN from './pricingCTN';
import { changeTariff } from 'common/reducers/transportTariff';
import { TARIFF_KINDS, GOODS_TYPES,
  PRESET_TRANSMODES, TARIFF_PARTNER_PERMISSION, TAX_STATUS } from 'common/constants';

const FormItem = Form.Item;
const Option = Select.Option;
const RadioGroup = Radio.Group;
const RadioButton = Radio.Button;

const formItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 24 - 6 },
};

const subFormLayout = {
  labelCol: { span: 4 },
  wrapperCol: { span: 24 - 4 },
};

@connect(
  state => ({
    tenantId: state.account.tenantId,
    tenantName: state.account.tenantName,
    loginId: state.account.loginId,
    loginName: state.account.username,
    tariffId: state.transportTariff.tariffId,
    formData: state.transportTariff.agreement,
    formParams: state.transportTariff.formParams,
  }),
  { changeTariff }
)

export default class AgreementForm extends React.Component {
  static propTypes = {
    type: PropTypes.oneOf(['create', 'edit', 'view']),
    form: PropTypes.object.isRequired,
    readonly: PropTypes.bool,
    tenantId: PropTypes.number.isRequired,
    tenantName: PropTypes.string.isRequired,
    loginId: PropTypes.number.isRequired,
    loginName: PropTypes.string.isRequired,
    tariffId: PropTypes.string,
    formData: PropTypes.object.isRequired,
    formParams: PropTypes.object.isRequired,
    changeTariff: PropTypes.func.isRequired,
  }
  state = {
    partnerVisible: true,
    transMode: '',
    readonly: false,
  }
  componentWillMount() {
    this.modeSelect(this.props.formData.transModeCode);
    this.handleKindChange(this.props.formData.kind);
    if (this.props.readonly) {
      this.setState({ readonly: true });
    }
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.formData !== this.props.formData) {
      this.handleKindChange(nextProps.formData.kind);
    }
    if (nextProps.formData.transModeCode !== this.props.formData.transModeCode) {
      this.modeSelect(nextProps.formData.transModeCode);
    }
    if (nextProps.readonly && !this.props.readonly) {
      this.setState({ readonly: true });
    }
  }
  handleKindChange = (kindIdx) => {
    if (kindIdx >= 0) {
      const kind = TARIFF_KINDS[kindIdx];
      if (kind.isBase) {
        this.setState({ partnerVisible: false });
      }
    }
  }
  handlePriceChange = (intervals, vehicleTypes) => {
    this.props.changeTariff({ intervals: intervals || [], vehicleTypes: vehicleTypes || [], priceChanged: true });
  }
  modeSelect = (value) => {
    const tms = this.props.formParams.transModes.filter(tm => tm.mode_code === value);
    if (tms.length !== 1) {
      return;
    }
    const code = tms[0].mode_code;
    if (code === PRESET_TRANSMODES.ftl) {
      this.setState({ transMode: 'ftl' });
    } else if (code === PRESET_TRANSMODES.ctn) {
      this.setState({ transMode: 'ctn' });
    } else {
      this.setState({ transMode: 'ltl' });
    }
  }
  handleModeSelect = (value) => {
    this.modeSelect(value);
    this.props.changeTariff({ priceChanged: true });
  }
  render() {
    const {
      form, formData, formParams,
      form: { getFieldDecorator },
    } = this.props;
    const { partnerVisible, readonly, transMode } = this.state;
    return (
      <div style={{ padding: 10 }}>
        <Form layout="horizontal">
          <Card>
            <Row>
              <Col sm={8}>
                <FormItem label="价格类型" {...formItemLayout}>
                  <Input disabled value={TARIFF_KINDS[formData.kind] ? TARIFF_KINDS[formData.kind].text : ''} />
                </FormItem>
              </Col>
              <Col sm={8}>
                {
                  partnerVisible &&
                  <FormItem label="合作伙伴" {...formItemLayout}>
                    <Input disabled value={formData.partnerName} />
                  </FormItem>
                }
              </Col>
              <Col sm={8}>
                <FormItem label="对方权限" {...formItemLayout}>
                  {getFieldDecorator('partnerPermission', {
                    initialValue: formData.partnerPermission || TARIFF_PARTNER_PERMISSION.viewable,
                    rules: [{ required: true, type: 'number' }],
                  })(<RadioGroup disabled={readonly}>
                    <Radio value={TARIFF_PARTNER_PERMISSION.viewable}>查看</Radio>
                    <Radio value={TARIFF_PARTNER_PERMISSION.editable}>修改</Radio>
                  </RadioGroup>)}
                </FormItem>
              </Col>
            </Row>
            <Row>
              <Col sm={8}>
                <FormItem label="货物类型" {...formItemLayout}>
                  {getFieldDecorator('goodsType', {
                    initialValue: formData.goodsType,
                    rules: [{ required: true, message: '货物类型必选', type: 'number' }],
                  })(<Select disabled={readonly}>
                    {
                      GOODS_TYPES.map(gt =>
                        <Option value={gt.value} key={gt.value}>{gt.text}</Option>)
                    }
                  </Select>)}
                </FormItem>
              </Col>
              <Col sm={8}>
                <FormItem label="价格调整系数" {...formItemLayout}>
                  {getFieldDecorator('adjustCoefficient', {
                    rules: [{ required: false, type: 'number', transform: v => Number(v) }],
                    initialValue: formData.adjustCoefficient,
                  })(<Input disabled={readonly} placeholder="不输入默认为1" />)}
                </FormItem>
              </Col>
              <Col sm={5}>
                <FormItem label="税率" {...formItemLayout}>
                  {getFieldDecorator('taxrate.mode', { initialValue: formData.taxrate.mode })(<RadioGroup>
                    <RadioButton value={TAX_STATUS.exctax.key}>{TAX_STATUS.exctax.value}</RadioButton>
                    <RadioButton value={TAX_STATUS.inctax.key}>{TAX_STATUS.inctax.value}</RadioButton>
                  </RadioGroup>)}
                </FormItem>
              </Col>
              <Col sm={3}>
                <FormItem label="税率值" labelCol={{ span: 9 }} wrapperCol={{ span: 15 }}>
                  {getFieldDecorator('taxrate.value', { initialValue: formData.taxrate.value })(<Input type="number" addonAfter="％" placeholder="请输入税率" />)}
                </FormItem>
              </Col>
            </Row>
            <Row>
              <Col sm={8}>
                <FormItem label="运输模式" {...formItemLayout}>
                  {getFieldDecorator('transModeCode', {
                    initialValue: formData.transModeCode,
                    rules: [{ required: true, type: 'string', message: '运输模式必选' }],
                  })(<Select onSelect={this.handleModeSelect} disabled={readonly}>
                    {
                      formParams.transModes.map(tm =>
                        <Option value={tm.mode_code} key={tm.mode_code}>{tm.mode_name}</Option>)
                    }
                  </Select>)}
                </FormItem>
              </Col>
            </Row>
            {transMode === 'ltl' &&
            <PricingLTL form={form} formItemLayout={subFormLayout} onChange={this.handlePriceChange}
              readonly={readonly}
            />
              }
            {transMode === 'ftl' &&
            <PricingFTL formItemLayout={subFormLayout} onChange={this.handlePriceChange}
              readonly={readonly}
            />
              }
            {transMode === 'ctn' &&
            <PricingCTN formItemLayout={subFormLayout} onChange={this.handlePriceChange}
              readonly={readonly}
            />
              }
          </Card>
        </Form>
      </div>
    );
  }
}
