import React from 'react';
import PropTypes from 'prop-types';
import update from 'immutability-helper';
import { connect } from 'react-redux';
import { Row, Col, Form, Select, Button } from 'antd';

const FormItem = Form.Item;
const Option = Select.Option;

function IntervalSelect(props) {
  const {
    readonly, index, vt, vl, VEHICLE_LENGTH_TYPES, VEHICLE_TYPES,
    onRemove, onVtChange, onVlChange,
  } = props;
  function handleRemove() {
    onRemove(index);
  }
  function handleVlChange(value) {
    onVlChange(index, value);
  }
  function handleVtChange(value) {
    onVtChange(index, value);
  }
  return (
    <Row>
      <Col sm={11} style={{ paddingBottom: 8 }}>
        <Select disabled={readonly} value={vl} onChange={handleVlChange}>
          {
            VEHICLE_LENGTH_TYPES.map(vlt =>
              <Option key={vlt.value} value={vlt.value}>{vlt.text}</Option>)
          }
        </Select>
      </Col>
      <Col sm={11} style={{ paddingLeft: 8, paddingBottom: 8 }}>
        <Select disabled={readonly} value={vt} onChange={handleVtChange}>
          {
            VEHICLE_TYPES.map(ovt =>
              <Option key={ovt.value} value={ovt.value}>{ovt.text}</Option>)
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
  vt: PropTypes.number,
  vl: PropTypes.number,
  VEHICLE_LENGTH_TYPES: PropTypes.arrayOf(PropTypes.shape({
    value: PropTypes.number.isRequired,
    text: PropTypes.string.isRequired,
  })),
  VEHICLE_TYPES: PropTypes.arrayOf(PropTypes.shape({
    value: PropTypes.number.isRequired,
    text: PropTypes.string.isRequired,
  })),
  index: PropTypes.number.isRequired,
  onRemove: PropTypes.func.isRequired,
  onVtChange: PropTypes.func.isRequired,
  onVlChange: PropTypes.func.isRequired,
};

@connect(state => ({
  vehicleTypes: state.transportTariff.agreement.vehicleTypes,
  vehicleLengths: state.transportTariff.agreement.intervals,
  vehicleTypeParams: state.transportTariff.formParams.vehicleTypeParams,
  vehicleLengthParams: state.transportTariff.formParams.vehicleLengthParams,
}))
export default class PricingLTL extends React.Component {
  static propTypes = {
    readonly: PropTypes.bool,
    vehicleTypes: PropTypes.arrayOf(PropTypes.number),
    vehicleLengths: PropTypes.arrayOf(PropTypes.number),
    formItemLayout: PropTypes.object.isRequired,
    vehicleTypeParams: PropTypes.arrayOf(PropTypes.shape({
      value: PropTypes.number.isRequired,
      text: PropTypes.string.isRequired,
    })),
    vehicleLengthParams: PropTypes.arrayOf(PropTypes.shape({
      value: PropTypes.number.isRequired,
      text: PropTypes.string.isRequired,
    })),
  }
  state = {
    vehicleTypes: [null],
    vehicleLengths: [null],
  }
  componentWillMount() {
    if (this.props.vehicleLengths.length !== 0) {
      this.setState({
        vehicleTypes: this.props.vehicleTypes,
        vehicleLengths: this.props.vehicleLengths,
      });
    }
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.vehicleLengths.length !== this.props.vehicleLengths.length
    && nextProps.vehicleTypes) {
      this.setState({
        vehicleTypes: nextProps.vehicleTypes,
        vehicleLengths: nextProps.vehicleLengths,
      });
    }
  }
  handleLimitAdd = () => {
    const state = update(this.state, {
      vehicleTypes: { $push: [null] },
      vehicleLengths: { $push: [null] },
    });
    this.setState(state);
  }
  handleLimitRemove = (index) => {
    const state = update(this.state, {
      vehicleTypes: { $splice: [[index, 1]] },
      vehicleLengths: { $splice: [[index, 1]] },
    });
    this.setState(state);
    this.props.onChange(state.vehicleLengths, state.vehicleTypes);
  }
  handleVtChange = (index, value) => {
    const state = update(this.state, {
      vehicleTypes: { [index]: { $set: value } },
    });
    this.setState(state);
    this.props.onChange(state.vehicleLengths, state.vehicleTypes);
  }
  handleVlChange = (index, value) => {
    const state = update(this.state, {
      vehicleLengths: { [index]: { $set: value } },
    });
    this.setState(state);
    this.props.onChange(state.vehicleLengths, state.vehicleTypes);
  }
  render() {
    const items = [];
    const { vehicleTypes, vehicleLengths } = this.state;
    const {
      readonly, formItemLayout, vehicleTypeParams, vehicleLengthParams,
    } = this.props;
    for (let i = 0; i < vehicleTypes.length; i++) {
      items.push(<IntervalSelect index={i} vt={vehicleTypes[i]} vl={vehicleLengths[i]}
        readonly={readonly}
        onRemove={this.handleLimitRemove}
        onVtChange={this.handleVtChange}
        onVlChange={this.handleVlChange}
        VEHICLE_TYPES={vehicleTypeParams}
        VEHICLE_LENGTH_TYPES={vehicleLengthParams}
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
