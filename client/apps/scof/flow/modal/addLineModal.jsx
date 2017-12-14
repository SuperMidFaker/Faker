/* eslint react/no-multi-comp: 0 */
import React from 'react';
import PropTypes from 'prop-types';
import { intlShape, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { Modal, Form, Card, Input, InputNumber, Row, message } from 'antd';
import { TARIFF_METER_METHODS, GOODS_TYPES } from 'common/constants';
import { toggleAddLineModal, addLineAndPublish, setNeedLoadTariff } from 'common/reducers/scofFlow';
import { getEndTableVarColumns } from 'client/apps/transport/tariff/forms/commodity';
import * as Location from 'client/util/location';
import { formatMsg } from '../message.i18n';

const FormItem = Form.Item;

@injectIntl
@connect(
  state => ({
    visible: state.scofFlow.addLineModal.visible,
    line: state.scofFlow.addLineModal.line,
    tariff: state.scofFlow.addLineModal.tariff,
    tenantId: state.account.tenantId,
    loginName: state.account.username,
    formRequires: state.crmOrders.formRequires,
  }),
  {
    toggleAddLineModal,
    addLineAndPublish,
    setNeedLoadTariff,
  }
)

export default class AddLineModal extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    visible: PropTypes.bool.isRequired,
    tenantId: PropTypes.number.isRequired,
    loginName: PropTypes.string.isRequired,
    toggleAddLineModal: PropTypes.func.isRequired,
    line: PropTypes.object.isRequired,
    tariff: PropTypes.object.isRequired,
    addLineAndPublish: PropTypes.func.isRequired,
    setNeedLoadTariff: PropTypes.func.isRequired,
    formRequires: PropTypes.object.isRequired,
  }
  state = {
    line: {
      source: {},
      end: {},
    },
  }
  componentWillMount() {
    if (this.props.visible) {
      this.setState({ line: this.props.line });
    }
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.visible) {
      this.setState({ line: nextProps.line });
    }
  }

  validateEnds = () => {
    const { tariff } = this.props;
    const { line } = this.state;
    if (tariff.meter === 't*km' && !line.km) {
      message.error('公里数未填写');
    }
    if (tariff.meter && !line.flare) {
      message.error('起步价未填写');
    }
    if (tariff && tariff.intervals) {
      for (let j = 0; j < tariff.intervals.length; j++) {
        if (!line[`gradients${j}`]) {
          message.error('费率不完整');
          return false;
        }
      }
    }
    return true;
  }

  handleOk = () => {
    const { line } = this.state;
    const { loginName, tariff } = this.props;
    if (this.validateEnds()) {
      const gradients = [];
      for (let i = 0; i < tariff.intervals.length + 1; i++) {
        gradients.push(line[`gradients${i}`]);
      }
      this.props.addLineAndPublish({
        quoteNo: tariff.quoteNo,
        line: { ...line, gradients },
        loginName,
      }).then(() => {
        this.handleCancel();
        this.props.setNeedLoadTariff(true);
        message.info('保存成功');
      });
    }
  }

  handleCancel = () => {
    this.props.toggleAddLineModal({ visible: false });
  }
  handleChange = (key, value) => {
    this.handleLineChange({ [key]: value });
  }
  handleLineChange = (data) => {
    const line = { ...this.state.line, ...data };
    this.setState({ line });
  }
  msg = formatMsg(this.props.intl)
  renderTmsTariff = (row) => {
    let text = row.quoteNo;
    const tms = this.props.formRequires.transitModes.find(tm => tm.id === Number(row.transModeCode));
    const meter = TARIFF_METER_METHODS.find(m => m.value === row.meter);
    const goodType = GOODS_TYPES.find(m => m.value === row.goodsType);
    if (tms) text = `${text}-${tms.mode_name}`;
    if (meter) text = `${text}/${meter.text}`;
    if (goodType) text = `${text}/${goodType.text}`;
    return text;
  }
  render() {
    const { visible, tariff, formRequires: { transitModes, vehicleTypes, vehicleLengths } } = this.props;
    const { line } = this.state;
    const style = {
      width: '33.33%', display: 'inline-block', paddingLeft: 5, paddingRight: 5,
    };
    let varColumns = [];
    if (tariff.intervals) varColumns = getEndTableVarColumns(tariff, transitModes, vehicleTypes, vehicleLengths);

    return (
      <Modal maskClosable={false} visible={visible} width={700} title="添加线路"
        onCancel={this.handleCancel} onOk={this.handleOk}
      >
        <Row>
          <FormItem label={this.msg('quoteNo')}>
            <Input disabled value={this.renderTmsTariff(tariff)} />
          </FormItem>
        </Row>
        <Card>
          <FormItem label="起始地" style={style}>
            <Input disabled value={Location.renderLocation(line.source)} />
          </FormItem>
          <FormItem label="目的地" style={style}>
            <Input disabled value={Location.renderLocation(line.end)} />
          </FormItem>
          <FormItem label="目的地别名" style={style}>
            <Input disabled value={line.end.name} />
          </FormItem>
          <FormItem label="运输时间" style={style}>
            <InputNumber value={line.time} style={{ width: '100%' }} onChange={value => this.handleChange('time', value)} />
          </FormItem>
          {tariff.meter === 't*km' &&
          <FormItem label="公里数" style={style}>
            <InputNumber value={line.km} style={{ width: '100%' }} onChange={value => this.handleChange('km', value)} />
          </FormItem>}
          {tariff.meter &&
          <FormItem label="起步价" style={style}>
            <InputNumber value={line.flare} style={{ width: '100%' }} onChange={value => this.handleChange('flare', value)} />
          </FormItem>}
          {varColumns.map(item =>
            (<FormItem label={item.title} style={style}>
              <InputNumber value={line[`gradients${item.index}`]} style={{ width: '100%' }} onChange={value => this.handleChange(`gradients${item.index}`, value)} />
            </FormItem>))}
        </Card>
      </Modal>
    );
  }
}
