import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { injectIntl } from 'react-intl';
import { Card, Row, Col, Form, Button, Input, Radio, Switch, Icon, message } from 'antd';
import { TAX_MODE, TAX_STATUS } from 'common/constants';
import { submitSurcharges } from 'common/reducers/transportTariff';

const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;
const FormItem = Form.Item;

@injectIntl
@connect(
  state => ({
    formdata: state.transportTariff.surcharge,
    tariffId: state.transportTariff.tariffId,
  }),
  { submitSurcharges }
)

@Form.create({
  formPropName: 'formhoc',
})

export default class SurchargeForm extends React.Component {
  static propTypes = {
    formhoc: PropTypes.object.isRequired,
    formdata: PropTypes.object.isRequired,
    submitSurcharges: PropTypes.func.isRequired,
    tariffId: PropTypes.string.isRequired,
  }
  state = {
    disabled1: true,
    disabled2: true,
  }
  componentWillMount() {
    this.setState({
      disabled1: !this.props.formdata.other1.enabled,
      disabled2: !this.props.formdata.other2.enabled,
    });
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.formdata.other1.enabled !== this.props.formdata.other1.enabled) {
      this.setState({ disabled1: !nextProps.formdata.other1.enabled });
    }
    if (nextProps.formdata.other2.enabled !== this.props.formdata.other2.enabled) {
      this.setState({ disabled2: !nextProps.formdata.other2.enabled });
    }
  }
  handleCheck = (checked) => {
    this.setState({
      disabled1: !checked,
    });
  }
  handleCheck2 = (checked) => {
    this.setState({
      disabled2: !checked,
    });
  }

  handleSave = () => {
      const formdata = {
        ...this.props.formdata,
        ...this.props.formhoc.getFieldsValue(),
      };
     const prom = this.props.submitSurcharges(this.props.tariffId, formdata);
     prom.then(result => {
        if (result.error) {
          message.error(result.error.message, 10);
        } else {
          message.info('保存成功', 5);
        }
      });
  }

  renderInput(selected, field, initialMode, initialValue) {
    const { getFieldProps } = this.props.formhoc;
    return (
      <Form horizontal>
       <Row>
         <Col span={12}>
            <FormItem hasFeedback>
              <RadioGroup {...getFieldProps(selected, initialMode)}>
                <RadioButton value={TAX_MODE.eachwaybill.key}>{TAX_MODE.eachwaybill.value}</RadioButton>
                <RadioButton value={TAX_MODE.chargeunit.key}>{TAX_MODE.chargeunit.value}</RadioButton>
              </RadioGroup>
            </FormItem>
          </Col>
          <Col span={12}>
            <FormItem>
            <Input addonAfter="元" placeholder="请输入金额" {
                ...getFieldProps(field, initialValue)
              } />
            </FormItem>
          </Col>
        </Row>
      </Form>
    );
  }

  render() {
    const { formhoc: { getFieldProps }, formdata } = this.props;
    const { disabled1, disabled2 } = this.state;
    return (
        <div style={{ padding: '24px' }}>
          <Row>
            <Col span={7}>
              <Card title="提货费">
                {this.renderInput('pickup.mode', 'pickup.value', { initialValue: formdata.pickup.mode }, { initialValue: formdata.pickup.value })}
              </Card>
            </Col>

            <Col span={7} offset={1}>
              <Card title="配送费">
                {this.renderInput('delivery.mode', 'delivery.value', { initialValue: formdata.delivery.mode }, { initialValue: formdata.delivery.value })}
              </Card>
            </Col>

            <Col span={7} offset={1}>
              <Card title="其他费用一"
                extra={
                  <Switch checkedChildren={<Icon type="check" />} unCheckedChildren={<Icon type="cross" />}
                    {...getFieldProps('other1.enabled', {
                      initialValue: formdata.other1.enabled,
                      onChange: this.handleCheck,
                      valuePropName: 'checked',
                    })}
                  />}
              >
                <Form horizontal>
                  <Row>
                    <Col span={12}>
                      <FormItem hasFeedback>
                        <RadioGroup disabled={disabled1} {...getFieldProps('other1.mode', { initialValue: formdata.other1.mode })}>
                          <RadioButton value={TAX_MODE.eachwaybill.key}>{TAX_MODE.eachwaybill.value}</RadioButton>
                          <RadioButton value={TAX_MODE.chargeunit.key}>{TAX_MODE.chargeunit.value}</RadioButton>
                        </RadioGroup>
                      </FormItem>
                    </Col>
                    <Col span={12}>
                      <FormItem>
                      <Input disabled={disabled1} type="number" addonAfter="元" placeholder="请输入金额" {
                          ...getFieldProps('other1.value', { initialValue: formdata.other1.value })
                        } />
                      </FormItem>
                    </Col>
                  </Row>
                </Form>
              </Card>
            </Col>
          </Row>
          <Row>
            <Col span={7}>
              <Card title="装货费">
                {this.renderInput('load.mode', 'load.value', { initialValue: formdata.load.mode }, { initialValue: formdata.load.value })}
              </Card>
            </Col>
            <Col span={7} offset={1}>
              <Card title="卸货费">
                {this.renderInput('unload.mode', 'unload.value', { initialValue: formdata.unload.mode }, { initialValue: formdata.unload.value })}
              </Card>
            </Col>
            <Col span={7} offset={1}>
              <Card title="其他费用二"
                extra={
                  <Switch checkedChildren={<Icon type="check" />} unCheckedChildren={<Icon type="cross" />}
                    {...getFieldProps('other2.enabled', {
                      initialValue: formdata.other2.enabled,
                      onChange: this.handleCheck2,
                      valuePropName: 'checked',
                    })}
                  />}
              >
                <Form>
                  <Row>
                    <Col span={12}>
                      <FormItem hasFeedback>
                        <RadioGroup disabled={disabled2} {...getFieldProps('other2.mode', { initialValue: formdata.other2.mode })}>
                          <RadioButton value={TAX_MODE.eachwaybill.key}>{TAX_MODE.eachwaybill.value}</RadioButton>
                          <RadioButton value={TAX_MODE.chargeunit.key}>{TAX_MODE.chargeunit.value}</RadioButton>
                        </RadioGroup>
                      </FormItem>
                    </Col>
                    <Col span={12}>
                      <FormItem>
                      <Input disabled={disabled2} type="number" addonAfter="元" placeholder="请输入金额" {
                          ...getFieldProps('other2.value', { initialValue: formdata.other2.value })
                        } />
                      </FormItem>
                    </Col>
                  </Row>
                </Form>
              </Card>
            </Col>
          </Row>
          <Row>
            <Col span={7}>
              <Card title="价格调整系数">
                <Form>
                  <FormItem>
                    <Input placeholder="不输入默认为1" {
                      ...getFieldProps('adjustCoefficient', {
                        rules: [{ required: false, type: 'number', transform: v => Number(v) }],
                        initialValue: formdata.adjustCoefficient,
                      })} />
                  </FormItem>
                </Form>
              </Card>
            </Col>
            <Col span={7} offset={1}>
              <Card title="税率">
                <Form>
                  <Row>
                    <Col span={12}>
                      <FormItem>
                        <RadioGroup {...getFieldProps('taxrate.mode', { initialValue: formdata.taxrate.mode })} >
                          <RadioButton value={TAX_STATUS.exctax.key}>{TAX_STATUS.exctax.value}</RadioButton>
                          <RadioButton value={TAX_STATUS.inctax.key}>{TAX_STATUS.inctax.value}</RadioButton>
                        </RadioGroup>
                      </FormItem>
                    </Col>
                    <Col span={12}>
                      <FormItem>
                        <Input type="number" addonAfter="％" placeholder="请输入税率" {
                          ...getFieldProps('taxrate.value', { initialValue: formdata.taxrate.value })
                          } />
                      </FormItem>
                    </Col>
                  </Row>
                </Form>
              </Card>
            </Col>
          </Row>
          <Row>
            <FormItem style={{ marginTop: 24 }}>
              <Button type="primary" htmlType="submit" onClick={this.handleSave}>保存</Button>
            </FormItem>
          </Row>
        </div>
    );
  }
}
