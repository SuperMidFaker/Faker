import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { intlShape, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { Modal, Row, Col, Form, Tooltip, Icon, Select, Input, Switch, message } from 'antd';
import { showPickPrintModal } from 'common/reducers/cwmWarehouse';
import { PICK_PRINT_FIELDS } from 'common/constants';
import { formatMsg } from '../message.i18n';

const FormItem = Form.Item;
const { Option } = Select;

@injectIntl
@connect(
  state => ({
    pickPrintControlModal: state.cwmWarehouse.ownerPickPrintModal,
  }),
  { showPickPrintModal }
)
export default class OwnerPickPrintControlModal extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    pickPrintControlModal: PropTypes.shape({
      visible: PropTypes.bool.isRequired,
      printRule: PropTypes.shape({
        columns: PropTypes.arrayOf(PropTypes.shape({ key: PropTypes.string })),
        pick_order: PropTypes.string,
        print_remain: PropTypes.bool,
      }),
    }),
    setPickPrint: PropTypes.func.isRequired,
  }
  state = {
    pickColumnRule: {},
    pickOrder: null,
    printRemain: false,
  }
  componentDidMount() {
    if (this.props.pickPrintControlModal.visible) {
      this.handlePrintSetting(this.props.pickPrintControlModal.printRule);
    }
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.pickPrintControlModal.visible && !this.props.pickPrintControlModal.visible) {
      this.handlePrintSetting(nextProps.pickPrintControlModal.printRule);
    }
  }
  msg = formatMsg(this.props.intl)
  handlePrintSetting = (printRule) => {
    const columnRule = {};
    const columns = (printRule.columns || []);
    columns.forEach((rule) => {
      columnRule[rule.key] = { enabled: true, text: rule.text, column: rule.column };
    });
    let disableFieldColumn = columns.length + 1;
    PICK_PRINT_FIELDS.forEach((amf) => {
      if (!columnRule[amf.field]) {
        columnRule[amf.field] = { enabled: false, text: amf.text, column: disableFieldColumn };
        disableFieldColumn += 1;
      }
    });
    this.setState({
      pickColumnRule: columnRule,
      pickOrder: printRule.pick_order,
      printRemain: printRule.print_remain,
    });
  }
  handleSettingChange = (field, key, newValue) => {
    const columnRule = { ...this.state.pickColumnRule };
    columnRule[field][key] = newValue;
    this.setState({ pickColumnRule: columnRule });
  }
  handlePrintColumnChange = (field, newColumn) => {
    const columnValue = parseInt(newColumn, 10);
    if (!Number.isNaN(columnValue)) {
      const columnRule = { ...this.state.pickColumnRule };
      let switchField;
      Object.keys(columnRule).forEach((rulekey) => {
        if (Number(columnRule[rulekey].column) === columnValue) {
          switchField = columnRule[rulekey];
        }
      });
      if (switchField) {
        switchField.column = Number(columnRule[field].column);
        columnRule[field].column = columnValue;
      }
      this.setState({ pickColumnRule: columnRule });
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
      printRule: {},
    });
    this.setState({ pickColumnRule: {}, printRemain: false, pickOrder: null });
  }

  handleSubmit = () => {
    const { pickColumnRule, pickOrder, printRemain } = this.state;
    const columns = [];
    Object.keys(pickColumnRule).forEach((rulekey) => {
      const rule = pickColumnRule[rulekey];
      if (rule.enabled) {
        columns.push({ key: rulekey, text: rule.text, column: rule.column });
      }
    });
    columns.sort((ra, rb) => ra.column - rb.column);
    for (let i = 0; i < columns.length; i++) {
      const rule = columns[i];
      if (rule.column < 1 || rule.column > columns.length) {
        message.error(`列序号必须在1与${columns.length}之间`);
        return;
      }
    }
    if (!pickOrder || pickOrder.length === 0) {
      message.error('排序字段至少选一个');
      return;
    }
    this.props.setPickPrint({
      columns,
      pick_order: pickOrder,
      print_remain: printRemain,
    });
    this.handleCancel();
  }
  render() {
    const { pickColumnRule, pickOrder, printRemain } = this.state;
    const { pickPrintControlModal } = this.props;
    if (!pickPrintControlModal.visible) {
      return null;
    }
    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 18 },
    };
    return (
      <Modal maskClosable={false} title="拣货单打印属性" width={840} onCancel={this.handleCancel} visible={pickPrintControlModal.visible} onOk={this.handleSubmit}>
        <Form>
          <FormItem {...formItemLayout} label="打印显示列">
            {PICK_PRINT_FIELDS.map((amf) => {
              const setting = pickColumnRule[amf.field];
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

