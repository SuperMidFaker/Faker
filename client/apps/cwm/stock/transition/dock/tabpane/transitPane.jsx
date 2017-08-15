import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import moment from 'moment';
import { Button, Card, Form, Row, Input, InputNumber, Col, DatePicker, message, Select, Switch } from 'antd';
import LocationSelect from 'client/apps/cwm/common/locationSelect';
import { hideTransitionDock, splitTransit } from 'common/reducers/cwmTransition';
import { loadOwnerUndoneMovements } from 'common/reducers/cwmMovement';

const FormItem = Form.Item;
const Option = Select.Option;

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    loginName: state.account.username,
    detail: state.cwmTransition.transitionDock.detail,
  }),
  { hideTransitionDock, splitTransit, loadOwnerUndoneMovements }
)
@Form.create()
export default class TransitPane extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
  }
  state = {
    target_location: null,
  }
  componentWillMount() {
    const { detail, tenantId } = this.props;
    this.props.loadOwnerUndoneMovements(detail.owner_partner_id, detail.whse_code, tenantId);
  }
  handleLocationSelect = (value) => { this.setState({ target_location: value }); }
  handleTransit = () => {
    const transitValues = this.props.form.getFieldsValue();
    const transit = {};
    let valueChanged = false;
    Object.keys(transitValues).forEach((transitKey) => {
      if (transitValues[transitKey] !== this.props.detail[transitKey]) {
        valueChanged = true;
        transit[transitKey] = transitValues[transitKey];
      }
    });
    if (this.state.target_location && this.state.movement_no) {
    } else if (valueChanged) {
      const { loginName, tenantId } = this.props;
      this.props.splitTransit([this.props.detail.trace_id], transit, loginName, tenantId).then((result) => {
        if (!result.error) {
          this.props.hideTransitionDock(true);
        } else {
          message.error(result.error.message);
        }
      });
    }
  }
  render() {
    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 18 },
    };
    const { detail, form: { getFieldDecorator } } = this.props;
    return (
      <div className="pane-content tab-pane">
        <Form>
          <Card noHovering bodyStyle={{ paddingBottom: 0 }} >
            <Row gutter={16} className="form-row">
              <Col span={8}>
                <FormItem {...formItemLayout} label="所属货主">
                  <Input value={detail.owner_name} disabled />
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem {...formItemLayout} label="SKU">
                  <span>{detail.product_sku}</span>
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem {...formItemLayout} label="商品货号">
                  <span>{detail.product_no}</span>
                </FormItem>
              </Col>
            </Row>
            <Row gutter={16} className="form-row">
              <Col span={8}>
                <FormItem {...formItemLayout} label="库位">
                  <Input value={detail.location} disabled />
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem {...formItemLayout} label="货物属性">
                  <Switch disabled checkedChildren="保税" unCheckedChildren="非保" checked={!!detail.bonded} />
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem {...formItemLayout} label="是否分拨">
                  <Switch disabled checked={!!detail.portion} />
                </FormItem>
              </Col>
            </Row>
            <Row gutter={16} className="form-row">
              <Col span={8}>
                <FormItem {...formItemLayout} label="品名">
                  {getFieldDecorator('name', {
                    initialValue: detail.name,
                  })(<Input />)}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem {...formItemLayout} label="批次号">
                  {getFieldDecorator('external_lot_no', {
                    initialValue: detail.external_lot_no,
                  })(<Input />)}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem {...formItemLayout} label="序列号">
                  {getFieldDecorator('serial_no', {
                    initialValue: detail.serial_no,
                  })(<Input />)}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem {...formItemLayout} label="库别">
                  {getFieldDecorator('virtual_whse', {
                    initialValue: detail.virtual_whse,
                  })(<Input />)}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem {...formItemLayout} label="包装情况">
                  {getFieldDecorator('damage_level', {
                    initialValue: detail.damage_level,
                  })(<Select style={{ width: '100%' }}>
                    <Option value={0}>完好</Option>
                    <Option value={1}>轻微擦痕</Option>
                    <Option value={2}>中度</Option>
                    <Option value={3}>重度</Option>
                    <Option value={4}>严重磨损</Option>
                  </Select>)}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem {...formItemLayout} label="失效日期">
                  {getFieldDecorator('expiry_date', {
                    initialValue: detail.expiry_date && moment(detail.expiry_date),
                  })(<DatePicker style={{ width: '100%' }} />)}
                </FormItem>
              </Col>
            </Row>
            <Row gutter={16} className="form-row">
              <Col span={8}>
                <FormItem {...formItemLayout} label="扩展属性1">
                  {getFieldDecorator('attrib_1_string', {
                    initialValue: detail.attrib_1_string,
                  })(<Input />)}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem {...formItemLayout} label="扩展属性2">
                  {getFieldDecorator('attrib_2_string', {
                    initialValue: detail.attrib_2_string,
                  })(<Input />)}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem {...formItemLayout} label="扩展属性3">
                  {getFieldDecorator('attrib_3_string', {
                    initialValue: detail.attrib_3_string,
                  })(<Input />)}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem {...formItemLayout} label="扩展属性4">
                  {getFieldDecorator('attrib_4_string', {
                    initialValue: detail.attrib_4_string,
                  })(<Input />)}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem {...formItemLayout} label="扩展属性5">
                  {getFieldDecorator('attrib_5_string', {
                    initialValue: detail.attrib_5_string,
                  })(<Input />)}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem {...formItemLayout} label="扩展属性6">
                  {getFieldDecorator('attrib_6_string', {
                    initialValue: detail.attrib_6_string,
                  })(<Input />)}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem {...formItemLayout} label="扩展属性7">
                  {getFieldDecorator('attrib_7_date', {
                    initialValue: detail.attrib_7_date && moment(detail.attrib_7_date),
                  })(<DatePicker style={{ width: '100%' }} />)}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem {...formItemLayout} label="扩展属性8">
                  {getFieldDecorator('attrib_8_date', {
                    initialValue: detail.attrib_8_date && moment(detail.attrib_8_date),
                  })(<DatePicker style={{ width: '100%' }} />)}
                </FormItem>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={8}>
                <FormItem {...formItemLayout} label="转移数量">
                  {getFieldDecorator('split', {
                    initialValue: undefined,
                  })(<InputNumber min={1} max={detail.avail_qty - 1} style={{ width: '100%' }} />)}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem {...formItemLayout} label="转移原因">
                  {getFieldDecorator('reason', {
                    initialValue: '',
                  })(<Input />)}
                </FormItem>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={8}>
                <FormItem {...formItemLayout} label="目标库位">
                  <LocationSelect onChange={this.handleLocationSelect}
                    onSelect={this.handleLocationSelect} value={this.state.target_location}
                  />
                </FormItem>
              </Col>
              {this.state.target_location && <Col span={8}>
                <FormItem {...formItemLayout} label="移库单">
                  <Select />
                </FormItem>
              </Col>}
            </Row>
          </Card>
          <Button type="primary" onClick={this.handleTransit}>执行转移</Button>
        </Form>
      </div>
    );
  }
}
