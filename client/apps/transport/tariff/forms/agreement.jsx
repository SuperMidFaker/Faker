import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Card, Row, Col, Form, Input, Select, DatePicker, Button, message } from 'antd';
import PricingLTL from './pricingLTL';
import PricingFTL from './pricingFTL';
import PricingCTN from './pricingCTN';
import { loadPartners, submitAgreement,
  updateAgreement } from 'common/reducers/transportTariff';
import { TARIFF_KINDS, GOODS_TYPES, PARTNERSHIP_TYPE_INFO,
  PRESET_TRANSMODES } from 'common/constants';

const FormItem = Form.Item;
const Option = Select.Option;
const formItemLayout = {
  labelCol: { span: 4 },
  wrapperCol: { span: 24 - 4 },
};

@connect(
  state => ({
    tenantId: state.account.tenantId,
    loginId: state.account.loginId,
    loginName: state.account.username,
    tariffId: state.transportTariff.tariffId,
    formData: state.transportTariff.agreement,
    partners: state.transportTariff.partners,
    formParams: state.transportTariff.formParams,
  }),
  { loadPartners, submitAgreement, updateAgreement }
)
@Form.create()
export default class AgreementForm extends React.Component {
  static propTypes = {
    readonly: PropTypes.bool,
    tenantId: PropTypes.number.isRequired,
    loginId: PropTypes.number.isRequired,
    loginName: PropTypes.string.isRequired,
    form: PropTypes.object.isRequired,
    tariffId: PropTypes.string,
    formData: PropTypes.object.isRequired,
    formParams: PropTypes.object.isRequired,
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
      if (nextProps.formData.kind) {
        const kind = TARIFF_KINDS[nextProps.formData.kind];
        if (kind.isBase) {
          this.setState({ partnerVisible: false });
        }
      }
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
  handlePriceChange = (intervals, vehicleTypes) => {
    this.price.intervals = intervals;
    this.price.vehicleTypes = vehicleTypes;
    // console.log(this.price);
  }
  handleSubmit = () => {
    this.props.form.validateFields(errors => {
      if (errors) {
        message.error('表单信息错误');
      } else {
        const editForm = this.props.form.getFieldsValue();
        let partnerName;
        if (editForm.partnerId) {
          const selpartners = this.props.partners.filter(
            pt => pt.partner_id === editForm.partnerId);
          partnerName = selpartners[0].name;
        }
        const effDate = editForm.effectiveDate;
        const expDate = new Date(editForm.expiryDate);
        const forms = {
          ...this.props.formData, ...editForm, ...this.price, partnerName,
          effectiveDate: effDate.setHours(0, 0, 0, 0),
          // 取下一天0点
          expiryDate: new Date(expDate.setDate(expDate.getDate() + 1)).setHours(0, 0, 0, 0),
        };
        let promise;
        if (this.props.tariffId) {
          forms.loginName = this.props.loginName;
          promise = this.props.updateAgreement(forms);
        } else {
          const { tariffId, tenantId, loginId } = this.props;
          forms.id = tariffId;
          forms.tenantId = tenantId;
          forms.loginId = loginId;
          promise = this.props.submitAgreement(forms);
        }
        promise.then(result => {
          if (result.error) {
            message.error(result.error.message);
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
      this.props.loadPartners(this.props.tenantId, PARTNERSHIP_TYPE_INFO.customer)
        .then(result => {
          if (result.error) {
            message.error(result.error.message);
          } else {
            this.setState({ partnerVisible: true });
          }
        });
    } else if (kind.value === 'cost') {
      this.props.loadPartners(this.props.tenantId, PARTNERSHIP_TYPE_INFO.transportation)
        .then(result => {
          if (result.error) {
            message.error(result.error.message);
          } else {
            this.setState({ partnerVisible: true });
          }
        });
    }
  }
  handleModeSelect = (value) => {
    if (value === PRESET_TRANSMODES.ftl) {
      this.setState({ transMode: 'ftl' });
    } else if (value === PRESET_TRANSMODES.ctn) {
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
    return effDate.getTime() >= expiryDate.getTime();
  }
  isExpiryDateDisabled = (expiryDate) => {
    if (!expiryDate) {
      return false;
    }
    const effDate = this.props.form.getFieldValue('effectiveDate');
    if (!effDate) {
      return false;
    }
    return effDate.getTime() >= expiryDate.getTime();
  }
  render() {
    const { form, formData, formParams, submitting, partners,
      form: { getFieldProps } } = this.props;
    const { partnerVisible, readonly, transMode } = this.state;
    return (
      <Form horizontal>
        <div className="panel-body">
          <Card style={{ margin: '0 16px' }}>
            <Row>
              <Col sm={12}>
                <FormItem label="价格类型" {...formItemLayout}>
                  <Select disabled={readonly} {...getFieldProps('kind', {
                    initialValue: formData.kind,
                    rules: [{ required: true, message: '价格类型必选', type: 'number' }],
                  })} onSelect={this.handleTariffKindSelect}
                  >
                  {
                    TARIFF_KINDS.map(
                      (tk, idx) =>
                      <Option value={idx} key={tk.value}>{TARIFF_KINDS[idx].text}</Option>
                    )
                  }
                  </Select>
                </FormItem>
              </Col>
              <Col sm={12} style={{ paddingLeft: '8px' }}>
                <FormItem label="协议名称" {...formItemLayout}>
                  <Input placeholder="合作伙伴-运输模式-货物类型-价格类型-计价单位" {
                    ...getFieldProps('name', {
                      initialValue: formData.name,
                      rules: [{ required: true, message: '名称必填' }],
                    })} />
                </FormItem>
              </Col>
            </Row>
            <Row>
              <Col sm={12}>
              {
                partnerVisible &&
                <FormItem label="合作伙伴" {...formItemLayout}>
                  <Select showSearch optionFilterProp="searched" disabled={readonly}
                    {...getFieldProps('partnerId', {
                      initialValue: formData.partnerId,
                      rules: [{ required: true, message: '合作伙伴必选', type: 'number' }],
                    })} allowClear
                  >
                  {
                    partners.map(pt => (
                      <Option searched={`${pt.partner_code}${pt.name}`}
                        value={pt.partner_id} key={pt.partner_id}
                      >
                      {pt.name}
                      </Option>)
                    )
                  }
                  </Select>
                </FormItem>
              }
              </Col>
              <Col sm={6} style={{ paddingLeft: '8px' }}>
                <FormItem label="有效期起始" labelCol={{ span: 8 }} wrapperCol={{ span: 16 }}>
                  <DatePicker style={{ width: '100%' }} {...getFieldProps('effectiveDate', {
                    initialValue: formData.effectiveDate,
                    rules: [{ required: true, message: '起始时间必填', type: 'date' }],
                  })} disabledDate={this.isEffectiveDateDisabled}
                  />
                </FormItem>
              </Col>
              <Col sm={6} style={{ paddingLeft: '8px' }}>
                <FormItem label="有效期截止" labelCol={{ span: 8 }} wrapperCol={{ span: 16 }}>
                  <DatePicker style={{ width: '100%' }} {...getFieldProps('expiryDate', {
                    initialValue: formData.expiryDate,
                    rules: [{ required: true, message: '截止时间必填', type: 'date' }],
                  })} disabledDate={this.isExpiryDateDisabled}
                  />
                </FormItem>
              </Col>
            </Row>
            <Row>
              <Col sm={6}>
                <FormItem label="运输模式" labelCol={{ span: 8 }} wrapperCol={{ span: 16 }}>
                  <Select onSelect={this.handleModeSelect} {...getFieldProps('transModeCode', {
                    initialValue: formData.transModeCode,
                    rules: [{ required: true, message: '运输模式必选' }],
                  })} disabled={readonly}
                  >
                  {
                    formParams.transModes.map(tm =>
                      <Option value={tm.mode_code} key={tm.mode_code}>{tm.mode_name}</Option>
                    )
                  }
                  </Select>
                </FormItem>
              </Col>
              <Col sm={6} style={{ paddingLeft: '8px' }}>
                <FormItem label="货物类型" labelCol={{ span: 8 }} wrapperCol={{ span: 16 }}>
                  <Select {...getFieldProps('goodsType', {
                    initialValue: formData.goodsType,
                    rules: [{ required: true, message: '货物类型必选', type: 'number' }],
                  })} disabled={readonly}
                  >
                  {
                    GOODS_TYPES.map(gt =>
                      <Option value={gt.value} key={gt.value}>{gt.text}</Option>
                    )
                  }
                  </Select>
                </FormItem>
              </Col>
            </Row>
            {transMode === 'ltl' &&
              <PricingLTL form={form} formItemLayout={formItemLayout} onChange={this.handlePriceChange}
                readonly={readonly}
              />
            }
            {transMode === 'ftl' &&
              <PricingFTL formItemLayout={formItemLayout} onChange={this.handlePriceChange}
                readonly={readonly}
              />
            }
            {transMode === 'ctn' &&
              <PricingCTN formItemLayout={formItemLayout} onChange={this.handlePriceChange}
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
        </div>
      </Form>);
  }
}
