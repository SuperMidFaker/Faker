import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { injectIntl } from 'react-intl';
import { Card, Row, Col, Form, Button, Input, Radio, message } from 'antd';
import { TAX_MODE } from 'common/constants';
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
@Form.create()
export default class SurchargeForm extends React.Component {
  static propTypes = {
    form: PropTypes.object.isRequired,
    formdata: PropTypes.object.isRequired,
    submitSurcharges: PropTypes.func.isRequired,
    tariffId: PropTypes.string.isRequired,
  }

  handleSave = () => {
    const formdata = {
      ...this.props.formdata,
      ...this.props.form.getFieldsValue(),
    };
    const prom = this.props.submitSurcharges(this.props.tariffId, formdata);
    prom.then((result) => {
      if (result.error) {
        message.error(result.error.message, 10);
      } else {
        message.info('保存成功', 5);
      }
    });
  }

  renderInput(selected, field, initialMode, initialValue) {
    const { getFieldProps } = this.props.form;
    return (
      <Form horizontal>
       <Row>
         <Col span={16}>
            <FormItem hasFeedback>
              <RadioGroup {...getFieldProps(selected, initialMode)}>
                <RadioButton value={TAX_MODE.eachwaybill.key}>{TAX_MODE.eachwaybill.value}</RadioButton>
                <RadioButton value={TAX_MODE.chargeunit.key}>{TAX_MODE.chargeunit.value}</RadioButton>
              </RadioGroup>
            </FormItem>
          </Col>
          <Col span={8}>
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
    const { formdata } = this.props;
    return (
        <div className="panel-body" style={{ padding: '0 16px' }}>
          <Row>
            <Col span={8} style={{ padding: '0 16px 0 0' }}>
              <Card title="提货费">
                {this.renderInput('pickup.mode', 'pickup.value', { initialValue: formdata.pickup.mode }, { initialValue: formdata.pickup.value })}
              </Card>
            </Col>
            <Col span={8} style={{ padding: '0 16px 0 0' }}>
              <Card title="配送费">
                {this.renderInput('delivery.mode', 'delivery.value', { initialValue: formdata.delivery.mode }, { initialValue: formdata.delivery.value })}
              </Card>
            </Col>
          </Row>
          <Row>
            <Col span={8} style={{ padding: '0 16px 0 0' }}>
              <Card title="装货费">
                {this.renderInput('load.mode', 'load.value', { initialValue: formdata.load.mode }, { initialValue: formdata.load.value })}
              </Card>
            </Col>
            <Col span={8} style={{ padding: '0 16px 0 0' }}>
              <Card title="卸货费">
                {this.renderInput('unload.mode', 'unload.value', { initialValue: formdata.unload.mode }, { initialValue: formdata.unload.value })}
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
