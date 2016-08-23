/* eslint react/no-multi-comp: 0 */
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { Form, Select, Input, InputNumber, Card, Col, Row, Button } from 'antd';
import { setClientForm, searchParams } from 'common/reducers/cmsDelegation';
import { DECL_I_TYPE } from 'common/constants';

const FormItem = Form.Item;
const Option = Select.Option;
const formItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 18 },
};
let idx = 0;

function getFieldInits(aspect, subdelgs) {
  const init = {};
  if (subdelgs) {
    // [
    //   'decl_way_code', 'manual_no', 'gross_wt', 'pack_count',
    // ].forEach(fd => {
    //   init[fd] = subdelgs[fd] || '';
    // });
  }
  return init;
}

@connect(
  state => ({
    fieldInits: getFieldInits(state.account.aspect, state.cmsDelegation.subdelgs),
  }),
  { setClientForm, searchParams }
)

export default class SubForm extends Component {
  static propTypes = {
    form: PropTypes.object.isRequired,
    fieldInits: PropTypes.object.isRequired,
  }

  handleAddRow = () => {
    idx++;
    const { form } = this.props;
    let keys = form.getFieldValue('keys');
    keys = keys.concat(idx);
    form.setFieldsValue({
      keys,
    });
  }

  remove(k) {
    const { form } = this.props;
    let keys = form.getFieldValue('keys');
    keys = keys.filter((key) => {
      return key !== k;
    });
    form.setFieldsValue({
      keys,
    });
  }

  render() {
    const { form: { getFieldProps, getFieldValue }, fieldInits } = this.props;
    getFieldProps('keys', {
      initialValue: [0],
    });
    const formItems = getFieldValue('keys').map((k) => {
      return (
        <Row style={{ marginBottom: 8 }}>
          <Col sm={6}>
            <FormItem label="报关类型" {...formItemLayout}>
              <Select
                {...getFieldProps(`decl_way_code_${k}`, {
                  rules: [{ required: true, message: '报关类型必选' }],
                })}
              >
              {
                DECL_I_TYPE.map(dw =>
                  <Option value={dw.key} key={dw.key}>{dw.value}</Option>
                )
              }
              </Select>
            </FormItem>
          </Col>
          <Col sm={6}>
            <FormItem label="备案号" {...formItemLayout}>
              <Input {...getFieldProps(`manual_no_${k}`, {
                initialValue: fieldInits.manual_no,
              })} />
            </FormItem>
          </Col>
          <Col sm={5}>
            <FormItem label="件数" {...formItemLayout}>
              <InputNumber min={1} max={100000} defaultValue={1} style={{ width: '100%' }}
                {...getFieldProps(`pack_count_${k}`, { initialValue: fieldInits.pack_count })}
              />
            </FormItem>
          </Col>
          <Col sm={5}>
            <FormItem label="毛重" {...formItemLayout}>
              <Input addonAfter="公斤" type="number" {...getFieldProps(`gross_wt_${k}`, {
                initialValue: fieldInits.gross_wt,
              })} />
            </FormItem>
          </Col>
          <Col span={1} offset={1}>
            <Button type="ghost" shape="circle" onClick={() => this.remove(k)} icon="delete"></Button>
          </Col>
        </Row>
      );
    });
    return (
      <Card bodyStyle={{ padding: 16 }}>
        {formItems}
        <div style={{ marginTop: 8 }}>
          <Button type="dashed" size="large" onClick={this.handleAddRow} icon="plus" style={{ width: '100%' }}>
            添加清关业务
          </Button>
        </div>
      </Card>
    );
  }
}
