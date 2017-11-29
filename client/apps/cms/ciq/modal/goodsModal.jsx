import React, { Component } from 'react';
import moment from 'moment';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Card, Col, DatePicker, Form, Row, Input, Select, Modal } from 'antd';
import { hideGoodsModal } from 'common/reducers/cmsCiqDeclare';

const FormItem = Form.Item;
const InputGroup = Input.Group;


@connect(
  state => ({
    visible: state.cmsCiqDeclare.goodsModal.visible,
    data: state.cmsCiqDeclare.goodsModal.data,
    countries: state.cmsCiqDeclare.ciqParams.countries,
    units: state.cmsCiqDeclare.ciqParams.units,
  }),
  { hideGoodsModal }
)
export default class GoodsModal extends Component {
  static propTypes = {
    ioType: PropTypes.oneOf(['in', 'out']),
  }
  handleCancel = () => {
    this.props.hideGoodsModal();
  }
  render() {
    const { visible, ioType, data, units, countries } = this.props;
    const formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 8 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 16 },
      },
    };
    const formItemSpan2Layout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 4 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 20 },
      },
    };
    return (
      <Modal title="Goods" visible={visible} onOk={this.handleCancel} onCancel={this.handleCancel} width="1200">
        <Form layout="horizontal" hideRequiredMark className="form-layout-multi-col">
          <Card bodyStyle={{ padding: 16, paddingBottom: 0 }} style={{ marginBottom: 0 }} hoverable={false}>
            <Row>
              <Col span="6">
                <FormItem {...formItemLayout} colon={false} label={'HS编码'} required >
                  <Input value={data.hscode} />
                </FormItem>
              </Col>
              <Col span="6">
                <FormItem {...formItemLayout} colon={false} label={'CIQ代码'} required >
                  <Input value={data.ciq_code} />
                </FormItem>
              </Col>
              <Col span="6">
                <FormItem {...formItemLayout} colon={false} label={'监管条件'} >
                  <Input disabled />
                </FormItem>
              </Col>
              <Col span="6">
                <FormItem {...formItemLayout} colon={false} label={'货物属性'} required >
                  <Input value={data.goods_attr} />
                </FormItem>
              </Col>
              <Col span="12">
                <FormItem {...formItemSpan2Layout} colon={false} label={'货物名称'} required >
                  <Input value={data.g_name} />
                </FormItem>
              </Col>
              <Col span="6">
                <FormItem {...formItemLayout} colon={false} label={'英文名称'} >
                  <Input value={data.en_name} />
                </FormItem>
              </Col>
              <Col span="6">
                <FormItem {...formItemLayout} colon={false} label={'货物品牌'} >
                  <Input value={data.goods_brand} />
                </FormItem>
              </Col>
              <Col span="6">
                <FormItem {...formItemLayout} colon={false} label={'货物规格'} >
                  <Input value={data.goods_spec} />
                </FormItem>
              </Col>
              <Col span="6">
                <FormItem {...formItemLayout} colon={false} label={'货物型号'} >
                  <Input value={data.g_model} />
                </FormItem>
              </Col>
              <Col span="6">
                <FormItem {...formItemLayout} colon={false} label={'用途'} required >
                  <Input value={data.use_to} />
                </FormItem>
              </Col>
              <Col span="6">
                <FormItem {...formItemLayout} colon={false} label={'成分/原料'} >
                  <Input value={data.stuff} />
                </FormItem>
              </Col>
              <Col span="6">
                <FormItem {...formItemLayout} colon={false} label={'报检数量'} required >
                  <InputGroup compact>
                    <Input style={{ width: '40%' }} value={data.g_qty} />
                    <Input style={{ width: '60%' }} value={units.find(unit => unit.unit_code === data.g_unit) && units.find(unit => unit.unit_code === data.g_unit).unit_name} />
                  </InputGroup>
                </FormItem>
              </Col>
              <Col span="6">
                <FormItem {...formItemLayout} colon={false} label={'报检重量'} >
                  <InputGroup compact>
                    <Input style={{ width: '40%' }} value={data.weight} />
                    <Input style={{ width: '60%' }} value={units.find(unit => unit.unit_code === data.wt_meas_unit) && units.find(unit => unit.unit_code === data.wt_meas_unit).unit_name} />
                  </InputGroup>
                </FormItem>
              </Col>
              <Col span="6">
                <FormItem {...formItemLayout} colon={false} label={'HS标准量'} required >
                  <InputGroup compact>
                    <Input style={{ width: '40%' }} value={data.std_qty} />
                    <Input style={{ width: '60%' }} value={units.find(unit => unit.unit_code === data.std_unit) && units.find(unit => unit.unit_code === data.std_unit).unit_name} />
                  </InputGroup>
                </FormItem>
              </Col>
              <Col span="6">
                <FormItem {...formItemLayout} colon={false} label={'包装数量'} >
                  <InputGroup compact>
                    <Input style={{ width: '40%' }} value={data.std_pack_count} />
                    <Input style={{ width: '60%' }} value={data.std_pack_type} />
                  </InputGroup>
                </FormItem>
              </Col>
              <Col span="6">
                <FormItem {...formItemLayout} colon={false} label={'货物单价'} >
                  <Input value={data.dec_price} />
                </FormItem>
              </Col>
              <Col span="6">
                <FormItem {...formItemLayout} colon={false} label={'货物总值'} required >
                  <Input value={data.trade_total} />
                </FormItem>
              </Col>
              {ioType === 'in' && <Col span="6">
                <FormItem {...formItemLayout} colon={false} label={'原产国'} required >
                  <Input value={countries.find(coun => coun.country_code === data.orig_country) && countries.find(coun => coun.country_code === data.orig_country).country_cn_name} />
                </FormItem>
                </Col>}
              {ioType === 'in' && <Col span="6">
                <FormItem {...formItemLayout} colon={false} label={'原产地区'} >
                  <Input value={data.orig_place_code} />
                </FormItem>
                </Col>}
              {ioType === 'in' && <Col span="6">
                <FormItem {...formItemLayout} colon={false} label={'境外生产企业'} >
                  <Input value={data.eng_man_ent_cnm} />
                </FormItem>
                </Col>}
              {ioType === 'out' && <Col span="6">
                <FormItem {...formItemLayout} colon={false} label={'产地'} >
                  <Select mode="combobox" />
                </FormItem>
                </Col>}
              {ioType === 'out' && <Col span="6">
                <FormItem {...formItemLayout} colon={false} label={'生产单位'} required >
                  <Select mode="combobox" />
                </FormItem>
                </Col>}
              {ioType === 'out' && <Col span="6">
                <FormItem {...formItemLayout} colon={false} label={'生产单位注册号'} required >
                  <Select mode="combobox" />
                </FormItem>
                </Col>}
              <Col span="6">
                <FormItem {...formItemLayout} colon={false} label={'生产批号'} >
                  <Input value={data.prod_batch_no} />
                </FormItem>
              </Col>
              <Col span="6">
                <FormItem {...formItemLayout} colon={false} label={'生产日期'} >
                  <DatePicker style={{ width: '100%' }} value={data.produce_date && moment(data.produce_date, 'YYYY/MM/DD')} />
                </FormItem>
              </Col>
              {ioType === 'in' && <Col span="6">
                <FormItem {...formItemLayout} colon={false} label={'产品有效期'} >
                  <DatePicker style={{ width: '100%' }} value={data.prod_valid_dt && moment(data.prod_valid_dt, 'YYYY/MM/DD')} />
                </FormItem>
                </Col>}
              {ioType === 'in' && <Col span="6">
                <FormItem {...formItemLayout} colon={false} label={'产品保质期'} >
                  <Input addonAfter="天" value={data.prod_qgp} />
                </FormItem>
                </Col>}
            </Row>
          </Card>
        </Form>
      </Modal>
    );
  }
}
