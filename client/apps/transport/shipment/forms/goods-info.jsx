import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape } from 'react-intl';
import { Row, Col, Form, Input, Select, Table } from 'antd';
import InputItem from './input-item';
import { saveLocalGoods, editLocalGoods, removeLocalGoods, setConsignFields }
  from 'common/reducers/shipment';
import { PRESET_TRANSMODES } from 'common/constants';
import { format } from 'client/common/i18n/helpers';
import messages from '../message.i18n';
import globalMessages from 'client/common/root.i18n';

const formatMsg = format(messages);
const formatGlobalMsg = format(globalMessages);

const FormItem = Form.Item;
const Option = Select.Option;

function asNumber(str) {
  const num = Number(str);
  return !isNaN(num) ? num : 0;
}

function showValue(val) {
  if (val === null || val === undefined) {
    return '';
  }
  return val;
}
function ColumnInput(props) {
  const {
    record, field, index, state, onChange,
  } = props;
  function handleInputChange(ev) {
    onChange(field, ev.target.value);
  }
  const selectedIndex = state.editGoodsIndex;
  return selectedIndex === index ?
    <Input value={showValue(state.editGoods[field])} onChange={handleInputChange} />
    : <span>{showValue(record[field])}</span>;
}
ColumnInput.propTypes = {
  index: PropTypes.number.isRequired,
  state: PropTypes.object.isRequired,
  record: PropTypes.object.isRequired,
  field: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
};

function ColumnSelect(props) {
  const {
    record, field, index, state, options, onChange,
  } = props;
  function handleChange(val) {
    onChange(field, val);
  }
  const selectedIndex = state.editGoodsIndex;
  let value = '';
  if (selectedIndex !== index && record[field]) {
    options.forEach((opt) => {
      if (opt.value === record[field]) {
        value = opt.name;
      }
    });
  }
  return selectedIndex === index ? (
    <Select value={showValue(state.editGoods[field])} onChange={handleChange}>
      {options.map(op => <Option value={op.value} key={op.key}>{op.name}</Option>)}
    </Select>
  ) : <span>{value}</span>;
}
ColumnSelect.propTypes = {
  index: PropTypes.number.isRequired,
  state: PropTypes.object.isRequired,
  record: PropTypes.object.isRequired,
  field: PropTypes.string.isRequired,
  options: PropTypes.array.isRequired,
  onChange: PropTypes.func.isRequired,
};

@connect(
  state => ({
    goods: state.shipment.formData.goodslist,
    fieldDefaults: {
      goods_type: state.shipment.formData.goods_type,
      total_count: state.shipment.formData.total_count,
      packageform: state.shipment.formData.package,
      total_weight: state.shipment.formData.total_weight,
      insure_value: state.shipment.formData.insure_value,
      total_volume: state.shipment.formData.total_volume,
    },
    modeCode: state.shipment.formData.transport_mode_code,
    goodsTypes: state.shipment.formRequire.goodsTypes,
    packagings: state.shipment.formRequire.packagings,
    totalWeightRequired: state.shipment.totalWeightRequired,
    totalVolumeRequired: state.shipment.totalVolumeRequired,
  }),
  {
    saveLocalGoods, editLocalGoods, removeLocalGoods, setConsignFields,
  }
)
export default class GoodsInfo extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    goods: PropTypes.array.isRequired,
    fieldDefaults: PropTypes.object.isRequired,
    labelColSpan: PropTypes.number.isRequired,
    modeCode: PropTypes.string,
    goodsTypes: PropTypes.array.isRequired,
    packagings: PropTypes.array.isRequired,
    formhoc: PropTypes.object.isRequired,
    saveLocalGoods: PropTypes.func.isRequired,
    editLocalGoods: PropTypes.func.isRequired,
    removeLocalGoods: PropTypes.func.isRequired,
    setConsignFields: PropTypes.func.isRequired,
    vertical: PropTypes.bool,
    totalWeightRequired: PropTypes.bool.isRequired,
    totalVolumeRequired: PropTypes.bool.isRequired,
  }
  constructor(...args) {
    super(...args);
  }
  state = {
    editGoods: {
      goods_no: undefined,
      name: undefined,
      package: undefined,
      count: undefined,
      weight: undefined,
      volume: undefined,
      length: undefined,
      width: undefined,
      height: undefined,
      remark: undefined,
    },
    editGoodsIndex: -1,
  }
  handleGoodsAdd = (ev) => {
    ev.preventDefault();
    this.setState({
      editGoodsIndex: this.props.goods.length, // 取最后一个自动添加元素
    });
  }
  handleGoodsListCompute = (ev) => {
    ev.preventDefault();
    let totalCount = 0;
    let totalWeight = 0;
    let totalVolume = 0;
    this.props.goods.forEach((gd) => {
      totalCount += asNumber(gd.count);
      totalWeight += asNumber(gd.weight);
      totalVolume += asNumber(gd.volume);
    });
    this.props.setConsignFields({
      total_count: totalCount,
      total_weight: totalWeight,
      total_volume: totalVolume,
    });
  }
  handleGoodsColumnEdit = (field, value) => {
    this.setState({
      editGoods: { ...this.state.editGoods, [field]: value },
    });
  }
  handleGoodsSave = () => {
    const { length, width, height } = this.state.editGoods;
    let volume = this.state.editGoods.volume;
    if (volume === undefined || volume === null) {
      volume = asNumber(length) * asNumber(width) * asNumber(height);
    }
    if (this.state.editGoodsIndex === this.props.goods.length) {
      // 新增
      this.props.saveLocalGoods({
        ...this.state.editGoods,
        volume,
        key: `goodsinfinity${this.props.goods.length}`,
      });
    } else {
      // 更新
      this.props.editLocalGoods(
        {
          ...this.state.editGoods,
          volume,
        },
        this.state.editGoodsIndex
      );
    }
    this.setState({
      editGoodsIndex: -1,
      editGoods: {},
    });
  }
  handleGoodsCancel = () => {
    this.setState({
      editGoods: {},
      editGoodsIndex: -1,
    });
  }
  handleGoodsEdit(goods, index) {
    this.setState({
      editGoods: goods,
      editGoodsIndex: index,
    });
  }
  handleGoodsRemove(index) {
    this.props.removeLocalGoods(index);
  }
  msg = (key, values) => formatMsg(this.props.intl, key, values)
  render() {
    const {
      formhoc, goods, goodsTypes, formhoc: { getFieldDecorator },
      packagings,
      fieldDefaults: {
        goods_type, total_count, packageform, total_weight, insure_value, total_volume,
      },
      vertical, modeCode,
      totalWeightRequired, totalVolumeRequired,
    } = this.props;
    const columns = [{
      title: this.msg('goodsCode'),
      dataIndex: 'goods_no',
      render: (text, record, index) =>
        (<ColumnInput record={record}
          field="goods_no"
          index={index}
          state={this.state}
          onChange={this.handleGoodsColumnEdit}
        />),
    }, {
      title: this.msg('goodsName'),
      dataIndex: 'name',
      render: (text, record, index) =>
        (<ColumnInput record={record}
          field="name"
          index={index}
          state={this.state}
          onChange={this.handleGoodsColumnEdit}
        />),
    }, {
      title: this.msg('goodsPackage'),
      dataIndex: 'package',
      width: 90,
      render: (text, record, index) =>
        (<ColumnSelect record={record}
          field="package"
          index={index}
          state={this.state}
          onChange={this.handleGoodsColumnEdit}
          options={packagings.map(pk => ({
            key: pk.package_code,
            value: pk.package_code,
            name: pk.package_name,
          }))}
        />),
    }, {
      title: this.msg('goodsCount'),
      dataIndex: 'count',
      width: 60,
      render: (text, record, index) =>
        (<ColumnInput record={record}
          field="count"
          index={index}
          state={this.state}
          onChange={this.handleGoodsColumnEdit}
        />),
    }, {
      title: this.msg('goodsWeight'),
      dataIndex: 'weight',
      width: 80,
      render: (text, record, index) =>
        (<ColumnInput record={record}
          field="weight"
          index={index}
          state={this.state}
          onChange={this.handleGoodsColumnEdit}
        />),
    }, {
      title: this.msg('goodsVolume'),
      dataIndex: 'volume',
      width: 90,
      render: (text, record, index) =>
        (<ColumnInput record={record}
          field="volume"
          index={index}
          state={this.state}
          onChange={this.handleGoodsColumnEdit}
        />),
    }, {
      title: this.msg('goodsLength'),
      dataIndex: 'length',
      width: 60,
      render: (text, record, index) =>
        (<ColumnInput record={record}
          field="length"
          index={index}
          state={this.state}
          onChange={this.handleGoodsColumnEdit}
        />),
    }, {
      title: this.msg('goodsWidth'),
      dataIndex: 'width',
      width: 60,
      render: (text, record, index) =>
        (<ColumnInput record={record}
          field="width"
          index={index}
          state={this.state}
          onChange={this.handleGoodsColumnEdit}
        />),
    }, {
      title: this.msg('goodsHeight'),
      dataIndex: 'height',
      width: 60,
      render: (text, record, index) =>
        (<ColumnInput record={record}
          field="height"
          index={index}
          state={this.state}
          onChange={this.handleGoodsColumnEdit}
        />),
    }, {
      title: this.msg('goodsRemark'),
      dataIndex: 'remark',
      render: (text, record, index) =>
        (<ColumnInput record={record}
          field="remark"
          index={index}
          state={this.state}
          onChange={this.handleGoodsColumnEdit}
        />),
    }, {
      title: this.msg('goodsOp'),
      width: 80,
      render: (text, record, index) => {
        if (this.state.editGoodsIndex === index) {
          return (
            <span>
              <a onClick={this.handleGoodsSave}>
                {formatGlobalMsg(this.props.intl, 'save')}
              </a>
              <span className="ant-divider" />
              <a onClick={this.handleGoodsCancel}>
                {formatGlobalMsg(this.props.intl, 'cancel')}
              </a>
            </span>
          );
        } else if (record.__ops) {
          const opRendered = [];
          record.__ops.forEach((op, idx) => {
            if (idx !== record.__ops.length - 1) {
              opRendered.push(<a key={`__ops0${op.name}`} onClick={op.handler}>{op.name}</a>);
              opRendered.push(<span key="__ops1divider" className="ant-divider" />);
            } else {
              opRendered.push(<a key={`__ops2${op.name}`} onClick={op.handler}>{op.name}</a>);
            }
          });
          return (<span>{opRendered}</span>);
        }
        return (
          <span>
            <a onClick={() => this.handleGoodsEdit(record, index)}>
              {formatGlobalMsg(this.props.intl, 'edit')}
            </a>
            <span className="ant-divider" />
            <a onClick={() => this.handleGoodsRemove(index)}>
              {formatGlobalMsg(this.props.intl, 'delete')}
            </a>
          </span>
        );
      },
    }];
    let content = '';
    if (vertical) {
      content = (
        <div>
          <FormItem label={this.msg('goodsType')} required>
            {getFieldDecorator('goods_type', {
              rules: [{
                required: true, type: 'number', message: this.msg('goodsTypeMust'),
              }],
              initialValue: goods_type,
            })(<Select>
              {goodsTypes.map(gt => <Option value={parseInt(gt.value, 10)} key={`${gt.text}${gt.value}`}>{gt.text}</Option>)}
            </Select>)}
          </FormItem>
          <InputItem formhoc={formhoc}
            labelName={this.msg('totalCount')}
            field="total_count"
            fieldProps={{ initialValue: total_count }}
          />
          <InputItem formhoc={formhoc}
            labelName={this.msg('totalWeight')}
            field="total_weight"
            addonAfter={this.msg('kilogram')}
            fieldProps={{ initialValue: total_weight }}
          />
          <InputItem formhoc={formhoc}
            labelName={this.msg('totalVolume')}
            field="total_volume"
            addonAfter={this.msg('cubicMeter')}
            fieldProps={{ initialValue: total_volume }}
          />
          <FormItem label={this.msg('goodsPackage')}>
            {getFieldDecorator('package', { initialValue: packageform })(<Select>
              {packagings.map(pk => <Option value={pk.package_code} key={pk.package_code}>{pk.package_name}</Option>)}
            </Select>)}
          </FormItem>
          <InputItem formhoc={formhoc}
            labelName={this.msg('insuranceValue')}
            field="insure_value"
            addonAfter={this.msg('CNY')}
            fieldProps={{ initialValue: insure_value }}
          />
        </div>
      );
    } else {
      content = (
        <div>
          <Row gutter={16}>
            <Col sm={24} md={8}>
              <FormItem label={this.msg('goodsType')} required>
                {getFieldDecorator('goods_type', {
                  rules: [{
                    required: true, type: 'number', message: this.msg('goodsTypeMust'),
                  }],
                  initialValue: goods_type,
                })(<Select>
                  {goodsTypes.map(gt => <Option value={parseInt(gt.value, 10)} key={`${gt.text}${gt.value}`}>{gt.text}</Option>)}
                </Select>)}
              </FormItem>
              <InputItem formhoc={formhoc}
                labelName={this.msg('totalCount')}
                field="total_count"
                fieldProps={{ initialValue: total_count }}
              />
            </Col>
            <Col sm={24} md={8}>
              <FormItem label={this.msg('goodsPackage')} required={modeCode === PRESET_TRANSMODES.ctn}>
                {getFieldDecorator('package', { initialValue: packageform })(<Select>
                  {packagings.map(pk => <Option value={pk.package_code} key={pk.package_code}>{pk.package_name}</Option>)}
                </Select>)}
              </FormItem>
              <InputItem formhoc={formhoc}
                labelName={this.msg('totalWeight')}
                field="total_weight"
                addonAfter={this.msg('kilogram')}
                fieldProps={{ initialValue: total_weight }}
                required={totalWeightRequired}
              />
            </Col>
            <Col sm={24} md={8}>
              <InputItem formhoc={formhoc}
                labelName={this.msg('insuranceValue')}
                field="insure_value"
                addonAfter={this.msg('CNY')}
                fieldProps={{ initialValue: insure_value }}
              />
              <InputItem formhoc={formhoc}
                labelName={this.msg('totalVolume')}
                field="total_volume"
                addonAfter={this.msg('cubicMeter')}
                fieldProps={{ initialValue: total_volume }}
                required={totalVolumeRequired}
              />
            </Col>
          </Row>
          <Row>
            <Col span="24">
              <Table size="small"
                columns={columns}
                dataSource={[...goods, {
                key: 'goodsinfinity',
                __ops: [{
                  name: formatGlobalMsg(this.props.intl, 'add'),
                  handler: this.handleGoodsAdd,
                }, {
                  name: formatMsg(this.props.intl, 'compute'),
                  handler: this.handleGoodsListCompute,
                }],
              }]}
                pagination={false}
              />
            </Col>
          </Row>
        </div>
      );
    }
    return (
      <div>
        {content}
      </div>
    );
  }
}
