import React, { Component, PropTypes } from 'react';
import update from 'react/lib/update';
import { connect } from 'react-redux';
import { Form, Select, Icon, Input, InputNumber, Card, Col, Row, Button } from 'antd';
import { DECL_I_TYPE, DECL_E_TYPE } from 'common/constants';
import { intlShape, injectIntl } from 'react-intl';
import messages from '../message.i18n';
import { format } from 'client/common/i18n/helpers';

const formatMsg = format(messages);
const FormItem = Form.Item;
const Option = Select.Option;
const formItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 18 },
};
let idx = 0;

@injectIntl
@connect(
  state => ({
    delgBills: state.cmsDelegation.delgBills,
  }),
)
export default class SubForm extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    form: PropTypes.object.isRequired,
    delgBills: PropTypes.array.isRequired,
    ietype: PropTypes.string.isRequired,
  }
  state = {
    bills: [],
    keys: [],
  }
  componentWillMount() {
    const keys = [];
    for (let i = 0; i < this.props.delgBills.length; i++) {
      keys.push(i);
    }
    this.setState({ bills: this.props.delgBills, keys });
    idx = this.props.delgBills.length - 1;
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.delgBills !== this.props.delgBills) {
      const keys = [];
      for (let i = 0; i < nextProps.delgBills.length; i++) {
        keys.push(i);
      }
      this.setState({ bills: nextProps.delgBills, keys });
      idx = nextProps.delgBills.length - 1;
    }
  }
  msg = key => formatMsg(this.props.intl, key);
  handleAddRow = () => {
    const bill = {
      decl_way_code: '',
      manual_no: '',
      pack_count: null,
      gross_wt: null,
    };
    idx++;
    const keys = this.state.keys.concat(idx);
    const state = update(this.state, { bills: { $push: [bill] } });
    this.setState(state);
    this.setState({ keys });
  }

  remove(k) {
    if (k !== 0) {
      const keys = this.state.keys.filter((key) => {
        return key !== k;
      });
      const bills = [...this.state.bills];
      bills[k] = {};
      this.setState({ bills, keys });
    }
  }

  render() {
    const { form: { getFieldDecorator }, ietype } = this.props;
    const bills = this.state.bills;
    const DECL_TYPE = ietype === 'import' ? DECL_I_TYPE : DECL_E_TYPE;
    getFieldDecorator('keys', {
      initialValue: this.state.keys,
    });
    const formItems = this.state.keys.map((k) => {
      return (
        <Row key={k} style={{ marginBottom: 8 }}>
          <Col sm={8}>
            <FormItem label={this.msg('declareWay')} {...formItemLayout}>
              {getFieldDecorator(`decl_way_code_${k}`, {
                rules: [{ required: true, message: '报关类型必选' }],
                initialValue: bills[k].decl_way_code,
              })(<Select>
                {
                DECL_TYPE.map(dw =>
                  <Option value={dw.key} key={dw.key}>{dw.value}</Option>
                )
              }
              </Select>)}
            </FormItem>
          </Col>
          <Col sm={7}>
            <FormItem label={this.msg('packageNum')} {...formItemLayout}>
              {getFieldDecorator(`pack_count_${k}`, {
                initialValue: bills[k].pack_count || 1 })(
                  <InputNumber min={1} max={100000} style={{ width: '100%' }} />
              )}
            </FormItem>
          </Col>
          <Col sm={7}>
            <FormItem label={this.msg('delgGrossWt')} {...formItemLayout}>
              {getFieldDecorator(`gross_wt_${k}`, {
                initialValue: bills[k].gross_wt,
              })(<Input addonAfter="千克" type="number" />)}
            </FormItem>
          </Col>
          <Col span={1} offset={1}>
            <Icon
              className="dynamic-delete-button"
              type="minus-circle-o"
              disabled={this.state.keys.length === 1}
              onClick={() => this.remove(k)}
            />
          </Col>
        </Row>
      );
    });
    return (
      <Card title={this.msg('delgClearance')} bodyStyle={{ padding: 16 }}>
        {formItems}
        <div style={{ marginTop: 8 }}>
          <Button type="dashed" size="large" onClick={this.handleAddRow} icon="plus" style={{ width: '100%' }}>
            {this.msg('addMore')}
          </Button>
        </div>
      </Card>
    );
  }
}
