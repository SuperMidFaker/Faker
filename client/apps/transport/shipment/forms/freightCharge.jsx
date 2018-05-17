/* eslint camelcase: 0 */
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import moment from 'moment';
import { Button, Card, Checkbox, message, Alert, Table, Collapse, Form, Input } from 'antd';
import { format } from 'client/common/i18n/helpers';
import { computeSaleCharge, setConsignFields } from 'common/reducers/shipment';
import { TARIFF_METER_METHODS, GOODS_TYPES } from 'common/constants';
import AddLineModal from 'client/apps/paas/flow/modal/addLineModal';
import { toggleAddLineModal } from 'common/reducers/scofFlow';
import { getChargeAmountExpression } from '../../common/charge';
import InputItem from './input-item';
import messages from '../message.i18n';

const formatMsg = format(messages);
const { Panel } = Collapse;
const FormItem = Form.Item;
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

@connect(
  state => ({
    tenantId: state.account.tenantId,
    formData: state.shipment.formData,
    formRequire: state.shipment.formRequire,
  }),
  { computeSaleCharge, setConsignFields, toggleAddLineModal }
)
export default class FreightCharge extends React.Component {
  static propTypes = {
    tenantId: PropTypes.number.isRequired,
    formData: PropTypes.object.isRequired,
    formhoc: PropTypes.object.isRequired,
    intl: PropTypes.object.isRequired,
    computeSaleCharge: PropTypes.func.isRequired,
    setConsignFields: PropTypes.func.isRequired,
    formRequire: PropTypes.object.isRequired,
    toggleAddLineModal: PropTypes.func.isRequired,
  }
  state = {
    computed: false,
    alert: {
      visible: false,
      type: 'error',
      message: '',
      description: '',
    },
    tariffType: 'normal', // normal base all
    baseTariffAvailable: false,
    tariff: {},
  }
  msg = (key, values) => formatMsg(this.props.intl, key, values)
  handleCompute = (tariffType) => {
    this.setState({
      alert: {
        visible: false,
        type: 'error',
        message: '',
        description: '',
      },
    });
    const {
      customer_partner_id,
      consigner_region_code,
      consigner_byname,
      consigner_province,
      consigner_city,
      consigner_district,
      consigner_street,
      consignee_region_code,
      consignee_byname,
      consignee_province,
      consignee_city,
      consignee_district,
      consignee_street,
      transport_mode_code,
    } = this.props.formData;
    const {
      goods_type, container: ctn, vehicle_type_id, vehicle_length_id, total_weight, total_volume, pickup_est_date, deliver_est_date,
    } =
      this.props.formhoc.getFieldsValue([
        'goods_type', 'container', 'vehicle_type_id',
        'vehicle_length_id', 'total_weight', 'total_volume',
        'pickup_est_date', 'deliver_est_date',
      ]);
    const created = this.props.formData.created_date || Date.now();
    const data = {
      partner_id: customer_partner_id,
      consigner_region_code,
      consigner_byname,
      consigner_province,
      consigner_city,
      consigner_district,
      consigner_street,
      consignee_region_code,
      consignee_byname,
      consignee_province,
      consignee_city,
      consignee_district,
      consignee_street,
      goods_type,
      transport_mode_code,
      ctn,
      tenant_id: this.props.tenantId,
      created_date: created,
      vehicle_type_id,
      vehicle_length_id,
      total_weight,
      total_volume,
      pickup_est_date,
      deliver_est_date,
      tariffType,
    };
    if (!customer_partner_id) {
      this.handleResult({
        visible: true,
        type: 'error',
        message: '表单填写有误',
        description: '客户未选择',
      });
    } else if (!consigner_region_code) {
      this.handleResult({
        visible: true,
        type: 'error',
        message: '表单填写有误',
        description: '始运地未选择',
      });
    } else if (!consignee_region_code) {
      this.handleResult({
        visible: true,
        type: 'error',
        message: '表单填写有误',
        description: '目的地未选择',
      });
    } else if (!transport_mode_code) {
      this.handleResult({
        visible: true,
        type: 'error',
        message: '表单填写有误',
        description: '运输模式未选择',
      });
    } else if (goods_type === undefined) {
      this.handleResult({
        visible: true,
        type: 'error',
        message: '表单填写有误',
        description: '货物类型未选择',
      });
    } else if (!pickup_est_date) {
      this.handleResult({
        visible: true,
        type: 'error',
        message: '表单填写有误',
        description: '提货日期未选择',
      });
    } else if (!deliver_est_date) {
      this.handleResult({
        visible: true,
        type: 'error',
        message: '表单填写有误',
        description: '送货日期未选择',
      });
    } else {
      this.computeSaleCharge(data);
    }
  }
  computeSaleCharge = (data) => {
    const tariffType = data.tariffType;
    this.props.computeSaleCharge(data).then((result) => {
      if (result.error) {
        message.error(result.error.message, 10);
      } else if (result.data.freight < 0) {
        const alert = this.translateResult(result.data.freight);
        this.handleResult(alert);
        if (result.data.baseChargeResult && result.data.baseChargeResult.freight >= 0) {
          this.setState({ baseTariffAvailable: true });
        }
        this.setState({
          tariffType,
          tariff: result.data.tariff ? result.data.tariff : {},
        });
      } else {
        this.setState({
          computed: true,
          tariff: result.data.tariff,
          tariffType,
        });
        // todo 起步价运费公式? pickup mode=1 x数量?
        const {
          quoteNo, freight, pickup, deliver, meter, quantity,
          unitRatio, gradient, miles, coefficient, transitTime,
        } = result.data;
        this.props.formhoc.setFieldsValue({
          freight_charge: freight,
          pickup_charge: pickup,
          deliver_charge: deliver,
          total_charge: Number(freight) + Number(pickup) + Number(deliver) + (
            this.props.formhoc.getFieldValue('surcharge') || this.props.formData.surcharge || 0
          ),
          distance: miles,
          transit_time: transitTime,
        });
        this.props.setConsignFields({
          quote_no: quoteNo,
          charge_gradient: gradient,
          quantity,
          unit_ratio: unitRatio,
          miles,
          adjust_coefficient: coefficient,
          meter,
          charge_amount: getChargeAmountExpression(
            meter, gradient, miles, quantity,
            unitRatio, coefficient
          ),
          pickup_checked: true,
          deliver_checked: true,
          transit_time: transitTime,

          total_weight: data.total_weight,
          total_volume: data.total_volume,
        });
        this.handleTransitChange(transitTime);
      }
    });
  }
  translateResult = (value) => {
    let data = {};
    if (value === -1) {
      data = {
        visible: true,
        type: 'error',
        message: '价格协议未找到',
        description: '所选客户、货物类型、运输模式 的价格协议不存在或未发布',
      };
    } else if (value === -2) {
      data = {
        visible: true,
        type: 'error',
        message: '价格协议未启用',
        description: '找到了相应的价格协议，但是没有启用',
      };
    } else if (value === -3) {
      data = {
        visible: true,
        type: 'error',
        message: '价格协议尚未生效',
        description: '找到了相应的价格协议，但是其生效时间还未到，（生效基准日期类型为 运单创建时间）',
      };
    } else if (value === -4) {
      data = {
        visible: true,
        type: 'error',
        message: '价格协议尚未生效',
        description: '找到了相应的价格协议，但是其生效时间还未到，（生效基准日期类型为 运单预计提货时间）',
      };
    } else if (value === -5) {
      data = {
        visible: true,
        type: 'error',
        message: '价格协议尚未生效',
        description: '找到了相应的价格协议，但是其生效时间还未到，（生效基准日期类型为 运单预计送货时间）',
      };
    } else if (value === -21) {
      data = {
        visible: true,
        type: 'error',
        message: '价格区间问题',
        description: '集装箱类型未选择或不在范围',
      };
    } else if (value === -22) {
      data = {
        visible: true,
        type: 'error',
        message: '价格区间问题',
        description: '车型车长未选择或不在范围',
      };
    } else if (value === -23) {
      data = {
        visible: true,
        type: 'error',
        message: '价格区间问题',
        description: '总重量未填或不在范围',
      };
    } else if (value === -24) {
      data = {
        visible: true,
        type: 'error',
        message: '价格区间问题',
        description: '总体积未填写或不在范围',
      };
    } else if (value === -25) {
      data = {
        visible: true,
        type: 'error',
        message: '价格区间问题',
        description: '找到了价格协议，但是没有相应的价格区间',
      };
    } else if (value === -26) {
      data = {
        visible: true,
        type: 'error',
        message: '路线不存在',
        description: <div>发货/收货地址不在报价协议的线路里 <a onClick={this.handleShowAddLineModal}>添加到报价协议</a></div>,
      };
    }
    return data;
  }
  handleResult = (data) => {
    this.setState({ alert: data });
  }
  handleTransitChange = (value) => {
    const pickupDt = this.props.formhoc.getFieldValue('pickup_est_date');
    if (pickupDt && typeof value === 'number') {
      const deliverDate = new Date(pickupDt.valueOf() + value * ONE_DAY_MS);
      this.props.formhoc.setFieldsValue({
        deliver_est_date: moment(deliverDate),
      });
    }
  }
  handleShowAddLineModal = () => {
    const { formData } = this.props;
    if (this.state.tariff && this.state.tariff.agreement) {
      const line = {
        source: {
          code: formData.consigner_region_code,
          province: formData.consigner_province,
          city: formData.consigner_city,
          district: formData.consigner_district,
          street: formData.consigner_street,
          name: formData.consigner_byname,
        },
        end: {
          code: formData.consignee_region_code,
          province: formData.consignee_province,
          city: formData.consignee_city,
          district: formData.consignee_district,
          street: formData.consignee_street,
          name: formData.consignee_byname,
        },
      };
      const tariff = {
        ...this.state.tariff,
        transModeCode: this.state.tariff.agreement.transModeCode,
        goodsType: this.state.tariff.agreement.goodsType,
        meter: this.state.tariff.agreement.meter,
        intervals: this.state.tariff.agreement.intervals,
        vehicleTypes: this.state.tariff.agreement.vehicleTypes,
      };
      this.props.toggleAddLineModal({
        visible: true,
        tariff,
        line,
      });
    }
  }
  handlePickupCheck = (ev) => {
    const { formhoc } = this.props;
    if (ev.target.checked) {
      formhoc.setFieldsValue({
        total_charge: formhoc.getFieldValue('total_charge')
          + formhoc.getFieldValue('pickup_charge'),
      });
    } else {
      formhoc.setFieldsValue({
        total_charge: formhoc.getFieldValue('total_charge')
          - formhoc.getFieldValue('pickup_charge'),
      });
    }
    this.props.setConsignFields({
      pickup_checked: ev.target.checked,
    });
  }
  handleDeliverCheck = (ev) => {
    const { formhoc } = this.props;
    if (ev.target.checked) {
      formhoc.setFieldsValue({
        total_charge: formhoc.getFieldValue('total_charge')
          + formhoc.getFieldValue('deliver_charge'),
      });
    } else {
      formhoc.setFieldsValue({
        total_charge: formhoc.getFieldValue('total_charge')
          - formhoc.getFieldValue('deliver_charge'),
      });
    }
    this.props.setConsignFields({
      deliver_checked: ev.target.checked,
    });
  }
  handleSurchargeChange = (ev) => {
    const { formhoc, formData } = this.props;
    let total = formhoc.getFieldValue('freight_charge');
    if (ev.target.value && !isNaN(Number(ev.target.value))) {
      total += Number(ev.target.value);
    }
    if (formData.pickup_checked) {
      total += formhoc.getFieldValue('pickup_charge');
    }
    if (formData.deliver_checked) {
      total += formhoc.getFieldValue('deliver_charge');
    }
    formhoc.setFieldsValue({ total_charge: total });
  }
  handleReset = (ev) => {
    ev.preventDefault();
    this.setState({
      tariffType: 'normal',
      computed: false,
      baseTariffAvailable: false,
      tariff: {},
    });
    this.props.formhoc.setFieldsValue({
      freight_charge: undefined,
      pickup_charge: undefined,
      deliver_charge: undefined,
      surcharge: undefined,
      total_charge: undefined,
      distance: undefined,
    });
    this.props.setConsignFields({
      charge_gradient: null,
      charge_amount: null,
      pickup_checked: false,
      deliver_checked: false,
      quote_no: '',
      unit_ratio: null,
      miles: null,
      adjust_coefficient: null,
      meter: null,
    });
  }
  handleTotalChange = (ev) => {
    ev.preventDefault();
    this.props.setConsignFields({
      freight_charge: ev.target.value,
    });
  }
  renderTmsTariff = (quoteNo, transModeCode, meter, goodsType) => {
    let text = quoteNo;
    const tms = this.props.formRequire.transitModes.find(tm => tm.id === transModeCode);
    const mt = TARIFF_METER_METHODS.find(m => m.value === meter);
    const goodType = GOODS_TYPES.find(m => m.value === goodsType);
    if (tms) text = `${text}-${tms.mode_name}`;
    if (mt) text = `${text}/${mt.text}`;
    if (goodType) text = `${text}/${goodType.text}`;
    return text;
  }
  render() {
    const { formhoc, formData } = this.props;
    const { alert, baseTariffAvailable, tariffType } = this.state;
    const computed = this.state.computed || (formData.charge_gradient && formData.charge_gradient > 0);
    const dataSource = [{
      key: '公斤',
      value: formData.total_weight ? formData.total_weight : '',
    }, {
      key: '立方米',
      value: formData.total_volume ? formData.total_volume : '',
    }, {
      key: '公里数',
      value: formData.miles,
    }, {
      key: '单位转换系数',
      value: formData.unit_ratio,
    }, {
      key: '路线梯度费率',
      value: formData.charge_gradient,
    }, {
      key: '调价系数',
      value: formData.adjust_coefficient,
    }];
    const title = (<span>{this.msg('freightCharge')} - 销售{tariffType === 'base' ? '基准' : ''}价</span>);
    return (
      <Card
        title={title}
        bodyStyle={{ padding: 16 }}
        extra={computed ? <a role="presentation" onClick={this.handleReset}>重置</a> : <Button
          type="primary"
          icon="calculator"
          onClick={() => this.handleCompute('normal')}
        >{this.msg('computeCharge')}
        </Button>}
      >
        {
          alert.visible &&
          <Alert
            message={
              baseTariffAvailable ? (
                <span>{alert.message}
                  <Button
                    type="primary"
                    icon="calculator"
                    onClick={() => this.handleCompute('base')}
                    style={{ marginLeft: 60 }}
                  >用基准价{this.msg('computeCharge')}
                  </Button>
                </span>
              ) : alert.message
            }
            description={alert.description}
            type={alert.type}
            showIcon
          />
        }
        <FormItem label="价格协议">
          <Input
            readOnly
            value={computed ? this.renderTmsTariff(formData.quote_no, formData.transport_mode_code, formData.meter, formData.goods_type) : formData.quote_no}
          />
        </FormItem>
        {
          computed ?
            <InputItem
              formhoc={formhoc}
              labelName={this.msg('basicCharge')}
              addonAfter={this.msg('CNY')}
              field="freight_charge"
              fieldProps={{ initialValue: formData.freight_charge }}
              colSpan={8}
              readOnly
            /> : ''
        }
        {
          computed ?
            <InputItem
              formhoc={formhoc}
              addonAfter={this.msg('CNY')}
              labelName={<span>
                <Checkbox checked={formData.pickup_checked} onChange={this.handlePickupCheck} />
                {this.msg('pickupCharge')}
              </span>}
              field="pickup_charge"
              fieldProps={{ initialValue: formData.pickup_charge }}
              colSpan={8}
              readOnly
              colon={false}
            /> : ''
        }
        {
          computed ?
            <InputItem
              formhoc={formhoc}
              addonAfter={this.msg('CNY')}
              labelName={<span>
                <Checkbox checked={formData.deliver_checked} onChange={this.handleDeliverCheck} />
                {this.msg('deliverCharge')}
              </span>}
              field="deliver_charge"
              fieldProps={{ initialValue: formData.deliver_charge }}
              colSpan={8}
              readOnly
              colon={false}
            /> : ''
        }
        {
          computed ?
            <InputItem
              formhoc={formhoc}
              labelName={this.msg('surcharge')}
              addonAfter={this.msg('CNY')}
              field="surcharge"
              fieldProps={{
 initialValue: formData.surcharge,
                onChange: this.handleSurchargeChange,
}}
              colSpan={8}
            /> : ''
        }
        <InputItem
          formhoc={formhoc}
          labelName={this.msg('totalCharge')}
          addonAfter={this.msg('CNY')}
          field="total_charge"
          fieldProps={{
 initialValue: formData.total_charge,
            onChange: this.handleTotalChange,
          }}
          rules={[{
 type: 'number',
            transform: v => Number(v),
            message: this.msg('totalChargeMustBeNumber'),
}]}
          colSpan={8}
          readOnly={computed}
        />
        <InputItem
          formhoc={formhoc}
          labelName={this.msg('distance')}
          addonAfter={this.msg('kilometer')}
          field="distance"
          fieldProps={{ initialValue: formData.distance }}
          type="number"
          colSpan={8}
          readOnly={computed}
        />
        <Collapse bordered={false}>
          <Panel header="计费参数" key="1">
            <Table size="small" dataSource={dataSource} pagination={false}>
              <Table.Column title="参数" key="key" dataIndex="key" />
              <Table.Column title="数值" key="value" dataIndex="value" />
            </Table>
          </Panel>
        </Collapse>
        <AddLineModal />
      </Card>
    );
  }
}
