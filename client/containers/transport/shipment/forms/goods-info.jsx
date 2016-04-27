import React, { PropTypes } from 'react';
import { intlShape } from 'react-intl';
import { Row, Col, Form, Select, Table } from 'ant-ui';
import InputItem from './input-item';
import { format } from 'universal/i18n/helpers';
import messages from '../message.i18n';
const formatMsg = format(messages);

const FormItem = Form.Item;
const Option = Select.Option;
export default class GoodsInfo extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    goods: PropTypes.array.isRequired,
    labelColSpan: PropTypes.number.isRequired,
    formhoc: PropTypes.object.isRequired
  }
  static defaultProps = {
    goods: [{ op: '添加'}]
  }
  state = {
    editGoodsIndex: -1
  }
  getComboFilter = (input, option) =>
    option.props.datalink.name.toLowerCase().indexOf(input.toLowerCase()) !== -1
  msg = (key, values) => formatMsg(this.props.intl, key, values)
  columns = [{
    title: this.msg('goodsCode'),
    dataIndex: 'goods_no'
  }, {
    title: this.msg('goodsName'),
    dataIndex: 'name'
  }, {
    title: this.msg('goodsPackage'),
    dataIndex: 'package'
  }, {
    title: this.msg('goodsCount'),
    dataIndex: 'count'
  }, {
    title: this.msg('goodsWeight'),
    dataIndex: 'weight'
  }, {
    title: this.msg('goodsVolume'),
    dataIndex: 'volume'
  }, {
    title: this.msg('goodsLength'),
    dataIndex: 'length'
  }, {
    title: this.msg('goodsWidth'),
    dataIndex: 'width'
  }, {
    title: this.msg('goodsHeight'),
    dataIndex: 'height'
  }, {
    title: this.msg('goodsRemark'),
    dataIndex: 'remark'
  }, {
    title: this.msg('goodsOp'),
    render: (text, record, index) => {
      let rendered;
      if (record.op) {
        rendered = <a>{record.op}</a>;
      } else {
        if (this.state.editGoodsIndex === index) {
          rendered = (<span>
            <a>{this.msg('edit')}</a>
            <a>{this.msg('delete')}</a>
            </span>);
        } else {
          rendered = (<span>
            <a>{this.msg('save')}</a>
            <a>{this.msg('cancel')}</a>
            </span>);
        }
      }
      return rendered;
    }
  }]
  render() {
    const {
      labelColSpan, formhoc, goods,
      formhoc: { getFieldProps }
    } = this.props;
    const outerColSpan = 8;
    return (
      <Row>
        <div className="subform-heading">
          <div className="subform-title">{this.msg('goodsInfo')}</div>
        </div>
        <Col span={`${outerColSpan}`} className="subform-body">
          <FormItem label={this.msg('goodsType')} labelCol={{span: labelColSpan}}
            wrapperCol={{span: 24 - labelColSpan}} required
          >
            <Select defaultValue="aa" {...getFieldProps('goods_type', {
              rules: [{
                required: true, message: this.msg('goodsTypeMust')
              }]
            })}
            >
              <Option value="aa">aa</Option>
            </Select>
          </FormItem>
          <InputItem formhoc={formhoc} labelName={this.msg('totalCount')}
            field="total_count" colSpan={labelColSpan}
          />
        </Col>
        <Col span={`${outerColSpan}`} className="subform-body">
          <FormItem label={this.msg('goodsPackage')} labelCol={{span: labelColSpan}}
            wrapperCol={{span: 24 - labelColSpan}}
          >
            <Select defaultValue="aa" {...getFieldProps('package')}>
              <Option value="aa">aa</Option>
            </Select>
          </FormItem>
          <InputItem formhoc={formhoc} labelName={this.msg('totalWeight')}
            field="total_weight" colSpan={labelColSpan} addonAfter={this.msg('kilogram')}
          />
        </Col>
        <Col span={`${outerColSpan}`} className="subform-body">
          <InputItem formhoc={formhoc} labelName={this.msg('insuranceValue')}
            field="insure_value" colSpan={labelColSpan} addonAfter={this.msg('CNY')}
          />
          <InputItem formhoc={formhoc} labelName={this.msg('totalVolume')}
            field="total_volume" colSpan={labelColSpan} addonAfter={this.msg('cubicMeter')}
          />
        </Col>
        <Table columns={this.columns} dataSource={goods} pagination={false} />
      </Row>);
  }
}
