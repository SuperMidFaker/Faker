import React from 'react';
import PropTypes from 'prop-types';
import update from 'immutability-helper';
import { connect } from 'react-redux';
import { Row, Col, Form, Input, Select, Button } from 'antd';
import { TARIFF_METER_METHODS } from 'common/constants';

const FormItem = Form.Item;
const Option = Select.Option;

function IntervalInput(props) {
  const {
    readonly, unit, index, intervals, onRemove, onChange,
  } = props;
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
          <Input addonBefore="≥" addonAfter={unit} value={intervals[index]}
            onChange={handleOddChange} readOnly={readonly}
          />
        </Col>
        <Col sm={11} style={{ paddingLeft: '8px', paddingBottom: '8px' }}>
          <Input addonBefore="<" addonAfter={unit} value={intervals[index + 1]}
            onChange={handleEvenChange} readOnly={readonly}
          />
        </Col>
      </Row>
    );
  } else if (index < intervals.length - 1) {
    return (
      <Row>
        <Col sm={11} style={{ paddingBottom: '8px' }}>
          <Input addonBefore="≥" addonAfter={unit} value={intervals[index]}
            onChange={handleOddChange} readOnly={readonly}
          />
        </Col>
        <Col sm={11} style={{ paddingLeft: '8px', paddingBottom: '8px' }}>
          <Input addonBefore="<" addonAfter={unit} value={intervals[index + 1]}
            onChange={handleEvenChange} readOnly={readonly}
          />
        </Col>
        <Col sm={1} style={{ paddingLeft: 8, paddingBottom: 8 }}>
          {
            !readonly &&
            <Button onClick={handleRemove}>删除</Button>
          }
        </Col>
      </Row>
    );
  } else {
    return null;
  }
}

IntervalInput.propTypes = {
  readonly: PropTypes.bool,
  unit: PropTypes.string.isRequired,
  index: PropTypes.number.isRequired,
  intervals: PropTypes.array.isRequired,
  onRemove: PropTypes.func.isRequired,
  onChange: PropTypes.func.isRequired,
};

@connect(state => ({
  meter: state.transportTariff.agreement.meter,
  intervals: state.transportTariff.agreement.intervals,
}))
export default class PricingLTL extends React.Component {
  static propTypes = {
    readonly: PropTypes.bool,
    meter: PropTypes.string,
    intervals: PropTypes.array,
    formItemLayout: PropTypes.object.isRequired,
    form: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired,
  }
  state = {
    unit: '公斤',
    intervals: [0, 0],
  }
  componentWillMount() {
    this.handleMeterSelect(this.props.meter);
    if (this.props.intervals.length > 0) {
      this.setState({ intervals: [0, ...this.props.intervals] });
    }
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.meter !== this.props.meter) {
      this.handleMeterSelect(nextProps.meter);
    }
    if (nextProps.intervals !== this.props.intervals) {
      if (nextProps.intervals.length > 0) {
        this.setState({ intervals: [0, ...nextProps.intervals] });
      } else {
        this.setState({ intervals: [0, 0] });
      }
    }
  }
  handleMeterSelect = (value) => {
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
    const {
      meter, readonly, formItemLayout, form: { getFieldDecorator },
    } = this.props;
    const { unit, intervals } = this.state;
    return (
      <div>
        <Row>
          <Col sm={12}>
            <FormItem label="计价方式" {...formItemLayout}>
              {getFieldDecorator('meter', {
                initialValue: meter || 'kg',
              })(<Select onSelect={this.handleMeterSelect} disabled={readonly}>
                {
                TARIFF_METER_METHODS.map(tmm =>
                  <Option value={tmm.value} key={tmm.value}>{tmm.text}</Option>)
              }
              </Select>)}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col sm={12}>
            <FormItem label="价格区间" {...formItemLayout}>
              {
                intervals.map((limit, index) =>
                  (<IntervalInput index={index} intervals={intervals}
                    readonly={readonly}
                    onRemove={this.handleLimitRemove}
                    onChange={this.handleLimitChange}
                    unit={unit}
                    key={limit}
                  />))
              }
              {
                !readonly &&
                <Button type="dashed" icon="plus" style={{ width: '100%' }} onClick={this.handleLimitAdd} />
              }
            </FormItem>
          </Col>
        </Row>
      </div>
    );
  }
}
