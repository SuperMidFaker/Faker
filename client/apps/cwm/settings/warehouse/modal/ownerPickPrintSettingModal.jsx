import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { intlShape, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { Modal, Row, Col, Form, Tooltip, Icon, Select, Input, Switch, message } from 'antd';
import { showPickPrintModal } from 'common/reducers/cwmWarehouse';
import { formatMsg } from '../message.i18n';

const FormItem = Form.Item;
const { Option } = Select;

const PICK_PRINT_FIELDS = [{
  field: 'product_no', text: '货号',
}, {
  field: 'name', text: '产品名称',
}, {
  field: 'location', text: '库位',
}, {
  field: 'serial_no', text: '序列号',
}, {
  field: 'virtual_whse', text: '库别',
}, {
  field: 'external_lot_no', text: '批次号',
}, {
  field: 'attrib_1_string', text: '客户属性1',
}, {
  field: 'attrib_2_string', text: '客户属性2',
}, {
  field: 'attrib_3_string', text: '客户属性3',
}, {
  field: 'attrib_4_string', text: '客户属性4',
}];

@injectIntl
@connect(
  state => ({
    printSettingModal: state.cwmWarehouse.ownerPickPrintModal,
  }),
  { showPickPrintModal }
)
export default class OwnerPickPrintModal extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    printSettingModal: PropTypes.shape({
      visible: PropTypes.bool.isRequired,
      printSetting: PropTypes.shape({
        print: PropTypes.arrayOf(PropTypes.shape({ key: PropTypes.string })),
        order: PropTypes.string,
        print_remain: PropTypes.bool,
      }),
    }),
    setPickPrint: PropTypes.func.isRequired,
  }
  state = {
    pickPrint: {},
    pickOrder: null,
    printRemain: false,
  }
  componentDidMount() {
    if (this.props.printSettingModal.visible) {
      this.handlePrintSetting(this.props.printSettingModal.printSetting);
    }
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.printSettingModal.visible && !this.props.printSettingModal.visible) {
      this.handlePrintSetting(nextProps.printSettingModal.printSetting);
    }
  }
  msg = formatMsg(this.props.intl)
  handlePrintSetting = (printRule) => {
    const printRuleState = {};
    printRule.print.forEach((rule) => {
      printRuleState[rule.key] = { enabled: true, text: rule.text, column: rule.column };
    });
    let disableFieldColumn = printRule.print.length + 1;
    PICK_PRINT_FIELDS.forEach((amf) => {
      if (!printRuleState[amf.field]) {
        printRuleState[amf.field] = { enabled: false, text: amf.text, column: disableFieldColumn };
        disableFieldColumn += 1;
      }
    });
    this.setState({
      pickPrint: printRuleState,
      pickOrder: printRule.pick_order,
      printRemain: printRule.print_remain,
    });
  }
  handleSettingChange = (field, key, newValue) => {
    const printRuleState = { ...this.state.pickPrint };
    printRuleState[field][key] = newValue;
    this.setState({ pickPrint: printRuleState });
  }
  handlePrintColumnChange = (field, newColumn) => {
    const columnValue = parseInt(newColumn, 10);
    if (!Number.isNaN(columnValue)) {
      const printRuleState = { ...this.state.pickPrint };
      let switchField;
      Object.keys(printRuleState).forEach((rulekey) => {
        if (printRuleState[rulekey].column === columnValue) {
          switchField = printRuleState[rulekey];
        }
      });
      if (switchField) {
        switchField.column = printRuleState[field].column;
        printRuleState[field].column = newColumn;
      }
      this.setState({ pickPrint: printRuleState });
    }
  }
  handlePrintRemainCheck = (checked) => {
    this.setState({ printRemain: checked });
  }
  handlePickOrderChange = (order) => {
    this.setState({ pickOrder: order });
  }
  handleCancel = () => {
    this.props.showPickPrintModal({
      visible: false,
      printSetting: {},
    });
    this.setState({ pickPrint: {}, printRemain: false, pickOrder: null });
  }

  handleSubmit = () => {
    const { pickPrint, pickOrder, printRemain } = this.state;
    const rules = [];
    Object.keys(pickPrint).forEach((rulekey) => {
      const rule = pickPrint[rulekey];
      if (rule.enabled) {
        rules.push({ key: rulekey, text: rule.text, column: rule.column });
      }
    });
    rules.sort((ra, rb) => ra.column - rb.column);
    for (let i = 0; i < rules.length; i++) {
      const rule = rules[i];
      if (rule.column < 1 || rule.column > rules.length) {
        message.error(`列序号必须在1与${rules.length}之间`);
        return;
      }
    }
    if (!pickOrder || pickOrder.length === 0) {
      message.error('排序字段至少选一个');
      return;
    }
    this.props.setPickPrint({
      print: rules,
      pick_order: pickOrder,
      print_remain: printRemain,
    });
    this.handleCancel();
  }
  render() {
    const { pickPrint, pickOrder, printRemain } = this.state;
    const { printSettingModal } = this.props;
    if (!printSettingModal.visible) {
      return null;
    }
    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 18 },
    };
    return (
      <Modal maskClosable={false} title="拣货单打印属性" width={840} onCancel={this.handleCancel} visible={printSettingModal.visible} onOk={this.handleSubmit}>
        <Form>
          <FormItem {...formItemLayout} label="打印显示列">
            {PICK_PRINT_FIELDS.map((amf) => {
              const setting = pickPrint[amf.field];
              if (!setting) {
                return null;
              }
            return (<Row>
              <Col span={4}>
                <Switch checked={setting.enabled} onChange={checked => this.handleSettingChange(amf.field, 'enabled', checked)} />
              </Col>
              <Col span={11}>
                <Input value={setting.text} readOnly={!setting.enabled} disabled={!setting.enabled} onChange={ev => this.handleSettingChange(amf.field, 'text', ev.target.value)} />
              </Col>
              <Col span={8} offset={1}>
                <Input value={setting.column} readOnly={!setting.enabled} disabled={!setting.enabled} onChange={ev => this.handlePrintColumnChange(amf.field, ev.target.value)} addonBefore="列" />
              </Col>
            </Row>);
            })}
          </FormItem>
          <FormItem {...formItemLayout} label="打印库位余量列">
            <Switch checked={printRemain} onChange={this.handlePrintRemainCheck} />
          </FormItem>
          <FormItem
            {...formItemLayout}
            label={<span>拣货列表排序
              <Tooltip title="以选择字段先后顺序排序">
                <Icon type="question-circle-o" />
              </Tooltip>
            </span>}
          >
            <Select mode="multiple" value={pickOrder} onChange={this.handlePickOrderChange}>
              {PICK_PRINT_FIELDS.filter(ppf => ppf.field !== 'name').map(ppf => <Option value={ppf.field} key={ppf.field}>{ppf.text}</Option>)}
            </Select>
          </FormItem>
        </Form>
      </Modal>);
  }
}

