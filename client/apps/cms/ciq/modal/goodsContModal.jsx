import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Col, Form, Row, Input, Select, Modal, Table, Button } from 'antd';
import { toggleGoodsContModal, addGoodsCont, loadGoodsCont, deleteGoodsCont } from 'common/reducers/cmsCiqDeclare';
import { CIQ_TRANS_MEANS_TYPE, CIQ_CNTNR_MODE_CODE, CIQ_QTY_MEAS_UNIT, CIQ_WT_UNIT_CODE } from 'common/constants';
import RowAction from 'client/components/RowAction';
import { intlShape, injectIntl } from 'react-intl';
import { format } from 'client/common/i18n/helpers';
import messages from '../message.i18n';

const formatMsg = format(messages);
const FormItem = Form.Item;
const { Option } = Select;

@connect(
  state => ({
    visible: state.cmsCiqDeclare.goodsContModal.visible,
    goodsData: state.cmsCiqDeclare.goodsContModal.goodsData,
  }),
  {
    toggleGoodsContModal,
    addGoodsCont,
    loadGoodsCont,
    deleteGoodsCont,
  }
)
@injectIntl
@Form.create()
export default class GoodsLicenceModal extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
  }
  state = {
    dataSource: [],
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.goodsData.id && nextProps.goodsData.id !== this.props.goodsData.id) {
      this.loadDataSource(nextProps.goodsData.id);
    }
  }
  msg = (descriptor, values) => formatMsg(this.props.intl, descriptor, values)
  handleCancel = () => {
    this.props.toggleGoodsContModal(false);
  }
  loadDataSource = (id) => {
    this.props.loadGoodsCont(id).then((result) => {
      if (!result.error) {
        this.setState({
          dataSource: result.data,
        });
      }
    });
  }
  handleSave = () => {
    const { preEntrySeqNo, id } = this.props.goodsData;
    this.props.form.validateFields((err, values) => {
      if (!err) {
        this.props.addGoodsCont(preEntrySeqNo, id, values).then((result) => {
          this.props.form.resetFields();
          if (!result.error) {
            this.loadDataSource(id);
          }
        });
      }
    });
  }
  handleDelete = (row) => {
    const { id } = this.props.goodsData;
    this.props.deleteGoodsCont([row.id]).then((result) => {
      if (!result.error) {
        this.loadDataSource(id);
      }
    });
  }
  render() {
    const { visible, form: { getFieldDecorator }, goodsData } = this.props;
    const { dataSource } = this.state;
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
    const columns = [{
      title: this.msg('contCode'),
      dataIndex: 'cont_code',
    }, {
      title: this.msg('contModeCode'),
      dataIndex: 'cntnr_mode_code',
    }, {
      title: this.msg('qty'),
      dataIndex: 'qty',
    }, {
      title: this.msg('qtyMeasUnit'),
      dataIndex: 'qty_meas_unit',
    }, {
      title: this.msg('stdMeasUnitQty'),
      dataIndex: 'std_meas_unit_qty',
    }, {
      title: this.msg('stdMeasUnit'),
      dataIndex: 'std_meas_unit',
    }, {
      title: this.msg('weight'),
      dataIndex: 'weight',
    }, {
      title: this.msg('wtUnitCode'),
      dataIndex: 'wt_unit_code',
    }, {
      dataIndex: 'OPS_COL',
      width: 45,
      render: (o, record) => <RowAction danger confirm={this.msg('ensureDelete')} onConfirm={this.handleDelete} icon="delete" tooltip={this.msg('delete')} row={record} />,
    }];
    return (
      <Modal width={1000} title={this.msg('goodsContainer')} visible={visible} onCancel={this.handleCancel} onOk={this.handleCancel}>
        <Form layout="horizontal" hideRequiredMark className="form-layout-multi-col">
          <Row>
            <Col span={8}>
              <FormItem {...formItemLayout} colon={false} label={this.msg('hscode')} >
                <Input value={goodsData.hscode} disabled />
              </FormItem>
            </Col>
            <Col span={8}>
              <FormItem {...formItemLayout} colon={false} label={this.msg('gName')} >
                <Input value={goodsData.gName} disabled />
              </FormItem>
            </Col>
            <Col span={8}>
              <FormItem {...formItemLayout} colon={false} label={this.msg('ciqCode')} >
                <Input value={goodsData.ciqCode} disabled />
              </FormItem>
            </Col>
            <Col span={8}>
              <FormItem {...formItemLayout} colon={false} label={this.msg('transMeansType')} >
                {getFieldDecorator('trans_means_type', {
              })(<Select showSearch style={{ width: '100%' }}>
                {CIQ_TRANS_MEANS_TYPE.map(type =>
                  <Option key={type.value} value={type.value}>{`${type.value}|${type.text}`}</Option>)}
              </Select>)}
              </FormItem>
            </Col>
            <Col span={8}>
              <FormItem {...formItemLayout} colon={false} label={this.msg('contCode')} >
                {getFieldDecorator('cont_code', {
                required: true,
              })(<Input />)}
              </FormItem>
            </Col>
            <Col span={8}>
              <FormItem {...formItemLayout} colon={false} label={this.msg('contModeCode')} >
                {getFieldDecorator('cntnr_mode_code', {
              })(<Select showSearch style={{ width: '100%' }}>
                {CIQ_CNTNR_MODE_CODE.map(code =>
                  <Option key={code.value} value={code.value}>{`${code.value}|${code.text}`}</Option>)}
              </Select>)}
              </FormItem>
            </Col>
            <Col span={8}>
              <FormItem {...formItemLayout} colon={false} label={this.msg('qty')} >
                {getFieldDecorator('qty', {
              })(<Input />)}
              </FormItem>
            </Col>
            <Col span={8}>
              <FormItem {...formItemLayout} colon={false} label={this.msg('qtyMeasUnit')} >
                {getFieldDecorator('qty_meas_unit', {
              })(<Select showSearch style={{ width: '100%' }}>
                {CIQ_QTY_MEAS_UNIT.map(unit =>
                  <Option value={unit.value} key={unit.value}>{`${unit.value}|${unit.text}`}</Option>)}
              </Select>)}
              </FormItem>
            </Col>
            <Col span={8}>
              <FormItem {...formItemLayout} colon={false} label={this.msg('stdMeasUnitQty')} >
                {getFieldDecorator('std_meas_unit_qty', {
              })(<Input />)}
              </FormItem>
            </Col>
            <Col span={8}>
              <FormItem {...formItemLayout} colon={false} label={this.msg('stdMeasUnit')} >
                {getFieldDecorator('std_meas_unit', {
              })(<Select showSearch style={{ width: '100%' }}>
                {CIQ_QTY_MEAS_UNIT.map(unit =>
                  <Option value={unit.value} key={unit.value}>{`${unit.value}|${unit.text}`}</Option>)}
              </Select>)}
              </FormItem>
            </Col>
            <Col span={8}>
              <FormItem {...formItemLayout} colon={false} label={this.msg('weight')} >
                {getFieldDecorator('weight', {
              })(<Input />)}
              </FormItem>
            </Col>
            <Col span={8}>
              <FormItem {...formItemLayout} colon={false} label={this.msg('wtUnitCode')} >
                {getFieldDecorator('wt_unit_code', {
              })(<Select showSearch style={{ width: '100%' }}>
                {CIQ_WT_UNIT_CODE.map(code =>
                  <Option key={code.value} value={code.value}>{`${code.value}|${code.text}`}</Option>)}
              </Select>)}
              </FormItem>
            </Col>
          </Row>
          <Row style={{ marginBottom: 8, textAlign: 'right' }}>
            <Button type="primary" icon="plus-circle-o" onClick={this.handleSave}>{this.msg('save')}</Button>
          </Row>
        </Form>
        <Table size="small" columns={columns} dataSource={dataSource} pagination={null} rowKey="id" />
      </Modal>
    );
  }
}

