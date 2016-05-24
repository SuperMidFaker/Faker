import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { intlShape } from 'react-intl';
import { Row, Col, Form, Input, Select, Table } from 'ant-ui';
import InputItem from './input-item';
import { saveLocalGoods, editLocalGoods, removeLocalGoods, setConsignFields }
  from 'common/reducers/shipment';
import PureRenderMixin from 'react/lib/ReactComponentWithPureRenderMixin';
import { format } from 'client/common/i18n/helpers';
import messages from '../message.i18n';
import globalMessages from 'client/root.i18n';
const formatMsg = format(messages);
const formatGlobalMsg = format(globalMessages);

const FormItem = Form.Item;
const Option = Select.Option;

function asNumber(str) {
  const num = Number(str);
  return !isNaN(num) ? num : 0;
}
function ColumnInput(props) {
  const { record, field, index, state, onChange } = props;
  function handleInputChange(ev) {
    onChange(field, ev.target.value);
  }
  const selectedIndex = state.editGoodsIndex;
  return selectedIndex === index ?
    <Input value={state.editGoods[field] || ''} onChange={handleInputChange} />
    : <span>{record[field] || ''}</span>;
}
ColumnInput.propTypes = {
  index: PropTypes.number.isRequired,
  state: PropTypes.object.isRequired,
  record: PropTypes.object.isRequired,
  field: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired
};

function ColumnSelect(props) {
  const { record, field, index, state, options, onChange } = props;
  function handleChange(val) {
    onChange(field, val);
  }
  const selectedIndex = state.editGoodsIndex;
  let value = '';
  if (selectedIndex !== index && record[field]) {
    options.forEach(opt => {
      if (opt.value === record[field]) {
        value = opt.name;
        return;
      }
    });
  }
  return selectedIndex === index ? (
    <Select value={state.editGoods[field] || ''} onChange={handleChange}>
      {options.map(
        op => <Option value={op.value} key={op.key}>{op.name}</Option>
      )}
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
    goodsTypes: state.shipment.formRequire.goodsTypes,
    packagings: state.shipment.formRequire.packagings,
  }),
  { saveLocalGoods, editLocalGoods, removeLocalGoods, setConsignFields }
)
export default class GoodsInfo extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    goods: PropTypes.array.isRequired,
    labelColSpan: PropTypes.number.isRequired,
    goodsTypes: PropTypes.array.isRequired,
    packagings: PropTypes.array.isRequired,
    formhoc: PropTypes.object.isRequired,
    saveLocalGoods: PropTypes.func.isRequired,
    editLocalGoods: PropTypes.func.isRequired,
    removeLocalGoods: PropTypes.func.isRequired,
    setConsignFields: PropTypes.func.isRequired,
  }
  constructor(...args) {
    super(...args);
    this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
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
    editGoodsIndex: -1
  }
  handleGoodsAdd = (ev) => {
    ev.preventDefault();
    this.setState({
      editGoodsIndex: this.props.goods.length // 取最后一个自动添加元素
    });
  }
  handleGoodsListCompute = (ev) => {
    ev.preventDefault();
    let totalCount = 0;
    let totalWeight = 0;
    let totalVolume = 0;
    this.props.goods.forEach(gd => {
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
      editGoods: { ...this.state.editGoods, [field]: value }
    });
  }
  handleGoodsSave = () => {
    if (this.state.editGoodsIndex === this.props.goods.length) {
      // 新增
      this.props.saveLocalGoods({
        ...this.state.editGoods,
        key: `goodsinfinity${this.props.goods.length}`
      });
    } else {
      // 更新
      this.props.editLocalGoods(
        this.state.editGoods,
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
      editGoodsIndex: -1
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
      labelColSpan, formhoc, goods, goodsTypes, packagings, formhoc: { getFieldProps }
    } = this.props;
    const outerColSpan = 8;
    const columns = [{
      title: this.msg('goodsCode'),
      dataIndex: 'goods_no',
      render: (text, record, index) =>
        <ColumnInput record={record} field="goods_no" index={index}
          state={this.state} onChange={this.handleGoodsColumnEdit}
        />
    }, {
      title: this.msg('goodsName'),
      dataIndex: 'name',
      render: (text, record, index) =>
        <ColumnInput record={record} field="name" index={index}
          state={this.state} onChange={this.handleGoodsColumnEdit}
        />
    }, {
      title: this.msg('goodsPackage'),
      dataIndex: 'package',
      width: 90,
      render: (text, record, index) =>
        <ColumnSelect record={record} field="package" index={index}
          state={this.state} onChange={this.handleGoodsColumnEdit}
          options={this.props.packagings.map(pk => ({
            key: pk.package_code,
            value: pk.package_code,
            name: pk.package_name,
          }))}
        />
    }, {
      title: this.msg('goodsCount'),
      dataIndex: 'count',
      width: 60,
      render: (text, record, index) =>
        <ColumnInput record={record} field="count" index={index}
          state={this.state} onChange={this.handleGoodsColumnEdit}
        />
    }, {
      title: this.msg('goodsWeight'),
      dataIndex: 'weight',
      width: 80,
      render: (text, record, index) =>
        <ColumnInput record={record} field="weight" index={index}
          state={this.state} onChange={this.handleGoodsColumnEdit}
        />
    }, {
      title: this.msg('goodsVolume'),
      dataIndex: 'volume',
      width: 90,
      render: (text, record, index) =>
        <ColumnInput record={record} field="volume" index={index}
          state={this.state} onChange={this.handleGoodsColumnEdit}
        />
    }, {
      title: this.msg('goodsLength'),
      dataIndex: 'length',
      width: 60,
      render: (text, record, index) =>
        <ColumnInput record={record} field="length" index={index}
          state={this.state} onChange={this.handleGoodsColumnEdit}
        />
    }, {
      title: this.msg('goodsWidth'),
      dataIndex: 'width',
      width: 60,
      render: (text, record, index) =>
        <ColumnInput record={record} field="width" index={index}
          state={this.state} onChange={this.handleGoodsColumnEdit}
        />
    }, {
      title: this.msg('goodsHeight'),
      dataIndex: 'height',
      width: 60,
      render: (text, record, index) =>
        <ColumnInput record={record} field="height" index={index}
          state={this.state} onChange={this.handleGoodsColumnEdit}
        />
    }, {
      title: this.msg('goodsRemark'),
      dataIndex: 'remark',
      render: (text, record, index) =>
        <ColumnInput record={record} field="remark" index={index}
          state={this.state} onChange={this.handleGoodsColumnEdit}
        />
    }, {
      title: this.msg('goodsOp'),
      width: 80,
      render: (text, record, index) => {
        let rendered;
        if (this.state.editGoodsIndex === index) {
          rendered = (
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
          record.__ops.forEach(
            (op, idx) => {
              if (idx !== record.__ops.length - 1) {
                opRendered.push(
                  <a key={`__ops0${idx}`} onClick={op.handler}>{op.name}</a>
                );
                opRendered.push(
                  <span key={`__ops1${idx}`} className="ant-divider" />
                );
              } else {
                opRendered.push(
                  <a key={`__ops2${idx}`} onClick={op.handler}>{op.name}</a>
                );
              }
            }
          );
          rendered = (<span>{opRendered}</span>);
        } else {
          rendered = (
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
        }
        return rendered;
      }
    }];
    return (
      <Row>
        <div className="subform-heading">
          <div className="subform-title">{this.msg('goodsInfo')}</div>
        </div>
        <div className="subform-body">
          <Col span={`${outerColSpan}`}>
            <FormItem label={this.msg('goodsType')} labelCol={{span: labelColSpan}}
              wrapperCol={{span: 24 - labelColSpan}} required
            >
              <Select {...getFieldProps('goods_type', {
                rules: [{
                  required: true, type: 'number', message: this.msg('goodsTypeMust')
                }]
              })}
              >
              {goodsTypes.map(
                gt => <Option value={parseInt(gt.id, 10)} key={`${gt.name}${gt.id}`}>{gt.name}</Option>
              )}
              </Select>
            </FormItem>
            <InputItem formhoc={formhoc} labelName={this.msg('totalCount')}
              field="total_count" colSpan={labelColSpan} hasFeedback={false}
            />
          </Col>
          <Col span={`${outerColSpan}`}>
            <FormItem label={this.msg('goodsPackage')} labelCol={{span: labelColSpan}}
              wrapperCol={{span: 24 - labelColSpan}}
            >
              <Select {...getFieldProps('package')}>
              {packagings.map(
                pk => <Option value={pk.package_code} key={pk.package_code}>{pk.package_name}</Option>
              )}
              </Select>
            </FormItem>
            <InputItem formhoc={formhoc} labelName={this.msg('totalWeight')} hasFeedback={false}
              field="total_weight" colSpan={labelColSpan} addonAfter={this.msg('kilogram')}
            />
          </Col>
          <Col span={`${outerColSpan}`}>
            <InputItem formhoc={formhoc} labelName={this.msg('insuranceValue')}
              field="insure_value" colSpan={labelColSpan} addonAfter={this.msg('CNY')}
            />
            <InputItem formhoc={formhoc} labelName={this.msg('totalVolume')} hasFeedback={false}
              field="total_volume" colSpan={labelColSpan} addonAfter={this.msg('cubicMeter')}
            />
          </Col>
          <Col span="24" className="subform-body">
            <Table size="middle" bordered columns={columns} dataSource={[...goods, {
              key: 'goodsinfinity', __ops: [{
                name: formatGlobalMsg(this.props.intl, 'add'),
                handler: this.handleGoodsAdd
              }, {
                name: formatMsg(this.props.intl, 'compute'),
                handler: this.handleGoodsListCompute
              }]
            }]} pagination={false}
            />
          </Col>
        </div>
      </Row>
    );
  }
}
