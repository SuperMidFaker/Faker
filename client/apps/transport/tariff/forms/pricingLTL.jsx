import React, { PropTypes } from 'react';
import update from 'react/lib/update';
import { connect } from 'react-redux';
import { Row, Col, Form, Input, Select, Button } from 'antd';
import { TARIFF_METER_METHODS } from 'common/constants';

const FormItem = Form.Item;
const Option = Select.Option;

function IntervalInput(props) {
  const { unit, index, intervals, onRemove, onChange } = props;
  function handleRemove() {
    onRemove(index);
  }
  function handleOddChange(ev) {
    onChange(index, ev.target.value);
  }
  function handleEvenChange(ev) {
    onChange(index + 1, ev.target.value);
  }
  if (index === 0) {
    return (
      <Row>
        <Col sm={11} style={{ paddingBottom: '8px' }}>
          <Input addonBefore=">" addonAfter={unit} value={intervals[index]}
            onChange={handleOddChange} size="large"
          />
        </Col>
        <Col sm={11} style={{ paddingLeft: '8px', paddingBottom: '8px' }}>
          <Input addonBefore="≤" addonAfter={unit} value={intervals[index + 1]}
            onChange={handleEvenChange} size="large"
          />
        </Col>
      </Row>
    );
  } else if (index < intervals.length - 1) {
    return (
      <Row>
        <Col sm={11} style={{ paddingBottom: '8px' }}>
          <Input addonBefore=">" addonAfter={unit} value={intervals[index]}
            onChange={handleOddChange} size="large"
          />
        </Col>
        <Col sm={11} style={{ paddingLeft: '8px', paddingBottom: '8px' }}>
          <Input addonBefore="≤" addonAfter={unit} value={intervals[index + 1]}
            onChange={handleEvenChange} size="large"
          />
        </Col>
        <Col sm={1} style={{ paddingLeft: 8, paddingBottom: 8 }}>
          <Button onClick={handleRemove}>删除</Button>
        </Col>
      </Row>
    );
  } else {
    return null;
  }
}

IntervalInput.propTypes = {
  unit: PropTypes.string.isRequired,
  index: PropTypes.number.isRequired,
  intervals: PropTypes.array.isRequired,
  onRemove: PropTypes.func.isRequired,
  onChange: PropTypes.func.isRequired,
};

@connect(
  state => ({
    meter: state.transportTariff.agreement.meter,
    limits: state.transportTariff.agreement.limits,
  })
)
export default class PricingLTL extends React.Component {
  static propTypes = {
    meter: PropTypes.number,
    limits: PropTypes.array,
    formItemLayout: PropTypes.object.isRequired,
    form: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired,
  }
  state = {
    unit: '公斤',
    intervals: [0, 0],
  }
  handleMeterSelect = value => {
    if (value === 't') {
      this.setState({ unit: '吨' });
    } else if (value === 'm3') {
      this.setState({ unit: '立方米' });
    } else if (value === 't*km') {
      this.setState({ unit: '吨' });
    } else if (value === 'kg') {
      this.setState({ unit: '公斤' });
    }
  }
  handleLimitAdd = () => {
    const last = this.state.intervals[this.state.intervals.length - 1];
    const state = update(this.state, { intervals: { $push: [last] } });
    this.setState(state);
  }
  handleLimitRemove = (index) => {
    const state = update(this.state, { intervals: { $splice: [[index + 1, 1]] } });
    this.setState(state);
    this.props.onChange(state.intervals.slice(1));
  }
  handleLimitChange = (index, value) => {
    const state = update(this.state, { intervals: { [index]: { $set: Number(value) } } });
    this.setState(state);
    this.props.onChange(state.intervals.slice(1));
  }
  render() {
    const { meter, formItemLayout, form: { getFieldProps } } = this.props;
    const { unit, intervals } = this.state;
    return (
      <div>
        <Row>
          <Col sm={12}>
            <FormItem label="计价方式" {...formItemLayout}>
              <Select onSelect={this.handleMeterSelect} {...getFieldProps('meter', {
                initialValue: meter || 'kg',
              })}>
              {
                TARIFF_METER_METHODS.map(tmm =>
                  <Option value={tmm.value} key={tmm.value}>{tmm.text}</Option>
                )
              }
              </Select>
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col sm={12}>
            <FormItem label="价格区间" {...formItemLayout}>
              {
                intervals.map((limit, index) =>
                  <IntervalInput index={index} intervals={intervals}
                    onRemove={this.handleLimitRemove}
                    onChange={this.handleLimitChange}
                    unit={unit}
                    key={`${limit}${index}`}
                  />)
              }
              <Button type="dashed" icon="plus" style={{ width: '100%' }} onClick={this.handleLimitAdd} />
            </FormItem>
          </Col>
        </Row>
      </div>
    );
  }
}
