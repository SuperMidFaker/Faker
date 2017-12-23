import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Col, Form, Row, Input, Select, Modal, Table, Button } from 'antd';
import { toggleGoodsContModal, addGoodsCont, loadGoodsCont, deleteGoodsCont } from 'common/reducers/cmsCiqDeclare';
import { CIQ_TRANS_MEANS_TYPE, CIQ_CNTNR_MODE_CODE, CIQ_QTY_MEAS_UNIT, CIQ_WT_UNIT_CODE } from 'common/constants';

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
@Form.create()
export default class GoodsLicenceModal extends Component {
  state = {
    dataSource: [],
    selectedRowKeys: [],
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.goodsData.id && nextProps.goodsData.id !== this.props.goodsData.id) {
      this.loadDataSource(nextProps.goodsData.id);
    }
  }
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
  handleDelete = () => {
    const { selectedRowKeys } = this.state;
    const { id } = this.props.goodsData;
    this.props.deleteGoodsCont(selectedRowKeys).then((result) => {
      if (!result.error) {
        this.loadDataSource(id);
      }
    });
  }
  render() {
    const { visible, form: { getFieldDecorator }, goodsData } = this.props;
    const { dataSource } = this.state;
    const rowSelection = {
      selectedRowKeys: this.state.selectedRowKeys,
      onChange: (selectedRowKeys) => {
        this.setState({
          selectedRowKeys,
        });
      },
    };
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
      title: '序号',
      render: (o, record, index) => index + 1,
    }, {
      title: '集装箱号',
      dataIndex: 'cont_code',
    }, {
      title: '集装箱规格',
      dataIndex: 'cntnr_mode_code',
    }, {
      title: '数量',
      dataIndex: 'qty',
    }, {
      title: '数量计量单位',
      dataIndex: 'qty_meas_unit',
    }, {
      title: '标准数量',
      dataIndex: 'std_meas_unit_qty',
    }, {
      title: '标准数量计量单位',
      dataIndex: 'std_meas_unit',
    }, {
      title: '重量',
      dataIndex: 'weight',
    }, {
      title: '重量单位代码',
      dataIndex: 'wt_unit_code',
    }];
    return (
      <Modal width={1000} title="产品资质" visible={visible} onCancel={this.handleCancel} onOk={this.handleCancel}>
        <Form layout="horizontal" hideRequiredMark className="form-layout-multi-col">
          <Row>
            <Col span={8}>
              <FormItem {...formItemLayout} colon={false} label="商品编码" >
                <Input value={goodsData.hscode} disabled />
              </FormItem>
            </Col>
            <Col span={8}>
              <FormItem {...formItemLayout} colon={false} label="商品名称" >
                <Input value={goodsData.gName} disabled />
              </FormItem>
            </Col>
            <Col span={8}>
              <FormItem {...formItemLayout} colon={false} label="CIQ代码" >
                <Input value={goodsData.ciqCode} disabled />
              </FormItem>
            </Col>
            <Col span={8}>
              <FormItem {...formItemLayout} colon={false} label="运输工具类型" >
                {getFieldDecorator('trans_means_type', {
              })(<Select showSearch style={{ width: '100%' }}>
                {CIQ_TRANS_MEANS_TYPE.map(type =>
                  <Option key={type.value} value={type.value}>{`${type.value}|${type.text}`}</Option>)}
              </Select>)}
              </FormItem>
            </Col>
            <Col span={8}>
              <FormItem {...formItemLayout} colon={false} label="集装箱号" >
                {getFieldDecorator('cont_code', {
                required: true,
              })(<Input />)}
              </FormItem>
            </Col>
            <Col span={8}>
              <FormItem {...formItemLayout} colon={false} label="集装箱规格" >
                {getFieldDecorator('cntnr_mode_code', {
              })(<Select showSearch style={{ width: '100%' }}>
                {CIQ_CNTNR_MODE_CODE.map(code =>
                  <Option key={code.value} value={code.value}>{`${code.value}|${code.text}`}</Option>)}
              </Select>)}
              </FormItem>
            </Col>
            <Col span={8}>
              <FormItem {...formItemLayout} colon={false} label="数量" >
                {getFieldDecorator('qty', {
              })(<Input />)}
              </FormItem>
            </Col>
            <Col span={8}>
              <FormItem {...formItemLayout} colon={false} label="计量单位" >
                {getFieldDecorator('qty_meas_unit', {
              })(<Select showSearch style={{ width: '100%' }}>
                {CIQ_QTY_MEAS_UNIT.map(unit =>
                  <Option value={unit.value} key={unit.value}>{`${unit.value}|${unit.text}`}</Option>)}
              </Select>)}
              </FormItem>
            </Col>
            <Col span={8}>
              <FormItem {...formItemLayout} colon={false} label="标准数量" >
                {getFieldDecorator('std_meas_unit_qty', {
              })(<Input />)}
              </FormItem>
            </Col>
            <Col span={8}>
              <FormItem {...formItemLayout} colon={false} label="标准数量单位" >
                {getFieldDecorator('std_meas_unit', {
              })(<Select showSearch style={{ width: '100%' }}>
                {CIQ_QTY_MEAS_UNIT.map(unit =>
                  <Option value={unit.value} key={unit.value}>{`${unit.value}|${unit.text}`}</Option>)}
              </Select>)}
              </FormItem>
            </Col>
            <Col span={8}>
              <FormItem {...formItemLayout} colon={false} label="重量" >
                {getFieldDecorator('weight', {
              })(<Input />)}
              </FormItem>
            </Col>
            <Col span={8}>
              <FormItem {...formItemLayout} colon={false} label="重量单位" >
                {getFieldDecorator('wt_unit_code', {
              })(<Select showSearch style={{ width: '100%' }}>
                {CIQ_WT_UNIT_CODE.map(code =>
                  <Option key={code.value} value={code.value}>{`${code.value}|${code.text}`}</Option>)}
              </Select>)}
              </FormItem>
            </Col>
          </Row>
          <Row style={{ marginBottom: 8 }}>
            <Col span={24} style={{ textAlign: 'right' }}>
              <Button type="primary" icon="plus-circle-o" onClick={this.handleSave}>添加</Button>
              <Button type="danger" style={{ marginLeft: 8 }} icon="delete" onClick={this.handleDelete}>删除</Button>
            </Col>
          </Row>
        </Form>
        <Table size="small" columns={columns} dataSource={dataSource} rowSelection={rowSelection} rowKey="id" />
      </Modal>
    );
  }
}

