import React from 'react';
import PropTypes from 'prop-types';
import update from 'immutability-helper';
import { connect } from 'react-redux';
import { Row, Col, Form, Select, Button } from 'antd';
import { CONTAINER_PACKAGE_TYPE } from 'common/constants';

const FormItem = Form.Item;
const Option = Select.Option;

function IntervalSelect(props) {
  const {
    index, ctn, readonly, onChange, onRemove,
  } = props;
  function handleRemove() {
    onRemove(index);
  }
  function handleChange(value) {
    onChange(index, value);
  }
  return (
    <Row>
      <Col sm={22} style={{ paddingBottom: 8 }}>
        <Select disabled={readonly} value={ctn} onChange={handleChange}>
          {
            CONTAINER_PACKAGE_TYPE.map(cpt =>
              <Option key={cpt.key} value={cpt.id}>{cpt.value}</Option>)
          }
        </Select>
      </Col>
      <Col sm={1} style={{ paddingLeft: 8, paddingBottom: 8 }}>
        {
          !readonly &&
          <Button onClick={handleRemove}>删除</Button>
        }
      </Col>
    </Row>
  );
}

IntervalSelect.propTypes = {
  readonly: PropTypes.bool,
  ctn: PropTypes.number,
  index: PropTypes.number.isRequired,
  onRemove: PropTypes.func.isRequired,
  onChange: PropTypes.func.isRequired,
};

@connect(state => ({
  intervals: state.transportTariff.agreement.intervals,
}))
export default class PricingLTL extends React.Component {
  static propTypes = {
    readonly: PropTypes.bool,
    intervals: PropTypes.array,
    formItemLayout: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired,
  }
  state = {
    intervals: [null],
  }
  componentWillMount() {
    if (this.props.intervals.length !== 0) {
      this.setState({ intervals: this.props.intervals });
    }
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.intervals !== this.props.intervals) {
      this.setState({ intervals: nextProps.intervals });
    }
  }
  handleLimitAdd = () => {
    const state = update(this.state, { intervals: { $push: [null] } });
    this.setState(state);
  }
  handleLimitChange = (index, value) => {
    const state = update(this.state, { intervals: { [index]: { $set: value } } });
    this.setState(state);
    this.props.onChange(state.intervals);
  }
  handleLimitRemove = (index) => {
    const state = update(this.state, { intervals: { $splice: [[index, 1]] } });
    this.setState(state);
    this.props.onChange(state.intervals);
  }
  render() {
    const items = [];
    const { intervals } = this.state;
    const { formItemLayout, readonly } = this.props;
    for (let i = 0; i < intervals.length; i++) {
      items.push(<IntervalSelect index={i} ctn={intervals[i]}
        readonly={readonly}
        onRemove={this.handleLimitRemove}
        onChange={this.handleLimitChange}
        key={`vehicle-length-type-${i}`}
      />);
    }
    return (
      <Col sm={12}>
        <FormItem label="价格区间" {...formItemLayout}>
          {items}
          {
            !readonly &&
            <Button type="dashed" icon="plus" style={{ width: '100%' }} onClick={this.handleLimitAdd} />
          }
        </FormItem>
      </Col>
    );
  }
}
