import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Card, Row, Col, Form, Input, Select, Button, Radio, message } from 'antd';
import PricingLTL from './pricingLTL';
import PricingFTL from './pricingFTL';
import PricingCTN from './pricingCTN';
import { loadPartners, submitAgreement,
  updateAgreement } from 'common/reducers/transportTariff';
import { TARIFF_KINDS, GOODS_TYPES, PARTNER_ROLES, PARTNER_BUSINESSE_TYPES,
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
    partners: state.transportTariff.partners,
    formParams: state.transportTariff.formParams,
  }),
  { loadPartners, submitAgreement, updateAgreement }
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
    partners: PropTypes.arrayOf(PropTypes.shape({
      tid: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
      partner_id: PropTypes.number.isRequired,
      partner_code: PropTypes.string.isRequired,
    })),
    loadPartners: PropTypes.func.isRequired,
    submitAgreement: PropTypes.func.isRequired,
    updateAgreement: PropTypes.func.isRequired,
  }
  state = {
    partnerVisible: true,
    transMode: '',
    readonly: false,
  }
  componentWillMount() {
    this.handleModeSelect(this.props.formData.transModeCode);
    this.handleKindChange(this.props.formData.kind);
    if (this.props.readonly) {
      this.setState({ readonly: true });
    }
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.formData !== this.props.formData) {
      this.price = {
        vehicleTypes: nextProps.formData.vehicleTypes,
        intervals: nextProps.formData.intervals,
      };
      this.handleKindChange(nextProps.formData.kind);
    }
    if (nextProps.formData.transModeCode !== this.props.formData.transModeCode) {
      this.handleModeSelect(nextProps.formData.transModeCode);
    }
    if (nextProps.readonly && !this.props.readonly) {
      this.setState({ readonly: true });
    }
  }
  price = {
    vehicleTypes: this.props.formData.vehicleTypes,
    intervals: this.props.formData.intervals,
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
    this.price.intervals = intervals;
    this.price.vehicleTypes = vehicleTypes;
    // console.log(this.price);
  }
  handleSubmit = () => {
    this.props.form.validateFields((errors) => {
      if (errors) {
        message.error('表单信息错误');
      } else {
        const editForm = this.props.form.getFieldsValue();
        let partnerName;
        let partnerTid;
        if (editForm.partnerId) {
          const selpartners = this.props.partners.filter(
            pt => pt.partner_id === editForm.partnerId);
          partnerName = selpartners[0].name;
          partnerTid = selpartners[0].tid;
        }


        const forms = {
          ...this.props.formData, ...editForm, ...this.price,
          transMode: this.state.transMode.toUpperCase(),
        };
        let promise;
        if (this.props.tariffId) {
          forms.loginName = this.props.loginName;
          promise = this.props.updateAgreement(forms);
        } else {
          const { tariffId, tenantId, tenantName, loginId } = this.props;
          forms.id = tariffId;
          forms.tenantId = tenantId;
          forms.tenantName = tenantName;
          forms.loginId = loginId;
          forms.partnerName = partnerName;
          forms.partnerTid = partnerTid;
          promise = this.props.submitAgreement(forms);
        }
        promise.then((result) => {
          if (result.error) {
            if (result.error.message === 'found_tariff') {
              message.error('相同条件报价协议已存在');
            } else {
              message.error(result.error.message);
            }
          } else {
            this.setState({ readonly: true });
            message.success('保存成功');
          }
        });
      }
    });
  }
  handleTariffKindSelect = (value) => {
    const kind = TARIFF_KINDS[value];
    if (kind.isBase) {
      this.setState({ partnerVisible: false });
    } else if (kind.value === 'sales') {
      this.props.loadPartners(this.props.tenantId,
        [PARTNER_ROLES.CUS, PARTNER_ROLES.DCUS],
        [PARTNER_BUSINESSE_TYPES.transport])
        .then((result) => {
          if (result.error) {
            message.error(result.error.message);
          } else {
            this.setState({ partnerVisible: true });
          }
        });
    } else if (kind.value === 'cost') {
      this.props.loadPartners(this.props.tenantId,
        [PARTNER_ROLES.SUP],
        [PARTNER_BUSINESSE_TYPES.transport])
        .then((result) => {
          if (result.error) {
            message.error(result.error.message);
          } else {
            this.setState({ partnerVisible: true });
          }
        });
    }
  }
  handleModeSelect = (value) => {
    if (isNaN(value)) {
      return;
    }
    const tms = this.props.formParams.transModes.filter(tm => tm.id === Number(value));
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
  isEffectiveDateDisabled = (effDate) => {
    if (!effDate) {
      return false;
    }
    const expiryDate = this.props.form.getFieldValue('expiryDate');
    if (!expiryDate) {
      return false;
    }
    return effDate.valueOf() >= expiryDate.valueOf();
  }
  isExpiryDateDisabled = (expiryDate) => {
    if (!expiryDate) {
      return false;
    }
    const effDate = this.props.form.getFieldValue('effectiveDate');
    if (!effDate) {
      return false;
    }
    return effDate.valueOf() >= expiryDate.valueOf();
  }
  render() {
    const { form, formData, formParams, submitting, partners,
      form: { getFieldDecorator } } = this.props;
    const { partnerVisible, readonly, transMode } = this.state;
    return (
      <div style={{ padding: 10 }}>
        <Form horizontal>
          <Card>
            <Row>
              <Col sm={8}>
                <FormItem label="价格类型" {...formItemLayout}>
                  {getFieldDecorator('kind', {
                    initialValue: formData.kind,
                    rules: [{ required: true, message: '价格类型必选', type: 'number' }],
                  })(<Select disabled onSelect={this.handleTariffKindSelect}>
                    {
                      TARIFF_KINDS.map(
                        (tk, idx) =>
                          <Option value={idx} key={tk.value}>{TARIFF_KINDS[idx].text}</Option>
                      )
                    }
                  </Select>)}
                </FormItem>
              </Col>
              <Col sm={8}>
                {
                  partnerVisible &&
                  <FormItem label="合作伙伴" {...formItemLayout}>
                    {getFieldDecorator('partnerId', {
                      initialValue: formData.partnerId,
                      rules: [{ required: true, message: '合作伙伴必选', type: 'number' }],
                    })(
                      <Select showSearch optionFilterProp="searched" disabled allowClear>
                        {
                        partners.map(pt => (
                          <Option searched={`${pt.partner_code}${pt.name}`}
                            value={pt.partner_id} key={pt.partner_id}
                          >
                            {pt.partner_code ? `${pt.partner_code} | ${pt.name}` : pt.name}
                          </Option>)
                        )
                      }
                      </Select>
                    )}
                  </FormItem>
                }
              </Col>
              <Col sm={8}>
                <FormItem label="对方权限" {...formItemLayout}>
                  {getFieldDecorator('partnerPermission', {
                    initialValue: formData.partnerPermission || TARIFF_PARTNER_PERMISSION.viewable,
                    rules: [{ required: true, type: 'number' }],
                  })(
                    <RadioGroup disabled={readonly}>
                      <Radio value={TARIFF_PARTNER_PERMISSION.viewable}>查看</Radio>
                      <Radio value={TARIFF_PARTNER_PERMISSION.editable}>修改</Radio>
                    </RadioGroup>
                  )}
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
                        <Option value={gt.value} key={gt.value}>{gt.text}</Option>
                      )
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
              <Col sm={4}>
                <FormItem label="税率" {...formItemLayout}>
                  {getFieldDecorator('taxrate.mode', {
                    initialValue: formData.taxrate.mode })(
                    <RadioGroup>
                      <RadioButton value={TAX_STATUS.exctax.key}>{TAX_STATUS.exctax.value}</RadioButton>
                      <RadioButton value={TAX_STATUS.inctax.key}>{TAX_STATUS.inctax.value}</RadioButton>
                    </RadioGroup>)}
                </FormItem>
              </Col>
              <Col sm={4}>
                <FormItem label="税率值" {...formItemLayout}>
                  {getFieldDecorator('taxrate.value', {
                    initialValue: formData.taxrate.value })(
                    <Input type="number" addonAfter="％" placeholder="请输入税率" />)}
                </FormItem>
              </Col>
            </Row>
            <Row>
              <Col sm={8}>
                <FormItem label="运输模式" {...formItemLayout}>
                  {getFieldDecorator('transModeCode', {
                    initialValue: isNaN(formData.transModeCode) ? undefined :
                        parseInt(formData.transModeCode, 10),
                    rules: [{ required: true, type: 'number', message: '运输模式必选' }],
                  })(<Select onSelect={this.handleModeSelect} disabled={readonly}>
                    {
                      formParams.transModes.map(tm =>
                        <Option value={tm.id} key={tm.id}>{tm.mode_name}</Option>
                      )
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
          <Col style={{ padding: '16px' }}>
            <Button size="large" type="primary"
              loading={submitting} onClick={this.handleSubmit}
            >
              保存
            </Button>
          </Col>
        </Form>
      </div>
    );
  }
}
