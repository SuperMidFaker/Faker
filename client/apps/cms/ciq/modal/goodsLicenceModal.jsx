import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Col, Form, Row, Input, Select, Modal, Table, Button } from 'antd';
import { toggleGoodsLicenceModal, addGoodsLicence, loadGoodsLicences, deleteGoodsLicences, loadLicenceNo } from 'common/reducers/cmsCiqDeclare';
import { CIQ_LICENCE_TYPE } from 'common/constants';
import RowAction from 'client/components/RowAction';

const FormItem = Form.Item;
const { Option } = Select;

@connect(
  state => ({
    visible: state.cmsCiqDeclare.goodsLicenceModal.visible,
    goodsData: state.cmsCiqDeclare.goodsLicenceModal.goodsData,
    ciqDeclHead: state.cmsCiqDeclare.ciqDeclHead.head,
  }),
  {
    toggleGoodsLicenceModal, addGoodsLicence, loadGoodsLicences, deleteGoodsLicences, loadLicenceNo,
  }
)
@Form.create()
export default class GoodsLicenceModal extends Component {
  state = {
    dataSource: [],
    licenceNos: [],
    licence: {},
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.goodsData.id && nextProps.goodsData.id !== this.props.goodsData.id) {
      this.loadDataSource(nextProps.goodsData.id);
    }
  }
  handleCancel = () => {
    this.props.toggleGoodsLicenceModal(false);
  }
  loadDataSource = (id) => {
    this.props.loadGoodsLicences(id).then((result) => {
      if (!result.error) {
        this.setState({
          dataSource: result.data,
        });
      }
    });
  }
  handleSave = () => {
    const { preEntrySeqNo, id } = this.props.goodsData;
    const { licence } = this.state;
    this.props.form.validateFields((err, values) => {
      if (!err) {
        this.props.addGoodsLicence(preEntrySeqNo, id, values, licence.id).then((result) => {
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
    this.props.deleteGoodsLicences(
      row.id, row.lic_wrtof_qty,
      row.lic_wrtof_left, row.permit_id
    ).then((result) => {
      if (!result.error) {
        this.loadDataSource(id);
        this.props.form.setFieldsValue({
          lic_type_code: '',
          licence_no: '',
          lic_detail_left: '',
          lic_wrtof_left: '',
          lic_wrtof_qty: '',
        });
      }
    });
  }
  handleChange = (value) => {
    this.props.loadLicenceNo(value, this.props.ciqDeclHead.owner_cuspartner_id).then((result) => {
      if (!result.error) {
        this.setState({
          licenceNos: result.data,
        });
        this.props.form.setFieldsValue({
          licence_no: '',
          lic_detail_left: '',
          lic_wrtof_left: '',
          lic_wrtof_qty: '',
        });
      }
    });
  }
  handleLicenceNoChange = (value) => {
    const { licenceNos } = this.state;
    const licence = licenceNos.find(lic => lic.permit_no === value);
    this.props.form.setFieldsValue({
      lic_detail_left: licence.ava_usage,
      lic_wrtof_left: '',
      lic_wrtof_qty: '',
    });
    this.setState({
      licence,
    });
  }
  handleQtyChange = (e) => {
    const left = this.props.form.getFieldValue('lic_detail_left');
    this.props.form.setFieldsValue({
      lic_wrtof_left: left - e.target.value,
    });
  }
  render() {
    const { visible, form: { getFieldDecorator }, goodsData } = this.props;
    const { dataSource, licenceNos } = this.state;
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
      title: '许可证类别',
      dataIndex: 'lic_type_code',
      render: o => CIQ_LICENCE_TYPE.find(type => type.value === o) &&
                   CIQ_LICENCE_TYPE.find(type => type.value === o).text,
    }, {
      title: '许可证编号',
      dataIndex: 'licence_no',
    }, {
      title: '核销货物序号',
      dataIndex: 'lic_wrtof_detail_no',
    }, {
      title: '核销数量',
      dataIndex: 'lic_wrtof_qty',
      align: 'right',
    }, {
      title: '核销明细余量',
      dataIndex: 'lic_detail_left',
      align: 'right',
    }, {
      title: '核销后余量',
      dataIndex: 'lic_wrtof_left',
      align: 'right',
    }, {
      dataIndex: 'OPS_COL',
      width: 45,
      render: (o, record) => <RowAction danger confirm="确定删除?" onConfirm={this.handleDelete} icon="delete" tooltip="删除" row={record} />,
    }];
    return (
      <Modal width={1000} title="产品资质" visible={visible} onCancel={this.handleCancel} onOk={this.handleCancel} destroyOnClose>
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
              <FormItem {...formItemLayout} colon={false} label="许可证类别" >
                {getFieldDecorator('lic_type_code', {
                required: true,
              })(<Select showSearch optionFilterProp="children" onChange={this.handleChange}>
                {CIQ_LICENCE_TYPE.map(type =>
                  (<Option key={type.value} value={type.value}>
                    {type.value}|{type.text}
                  </Option>))}
              </Select>)}
              </FormItem>
            </Col>
            <Col span={8}>
              <FormItem {...formItemLayout} colon={false} label="许可证编号" >
                {getFieldDecorator('licence_no', {
                required: true,
              })(<Select showSearch optionFilterProp="children" onChange={this.handleLicenceNoChange}>
                {licenceNos.map(lic =>
                  (<Option key={lic.permit_no} value={lic.permit_no}>
                    {lic.permit_no}
                  </Option>))}
              </Select>)}
              </FormItem>
            </Col>
            <Col span={8}>
              <FormItem {...formItemLayout} colon={false} label="核销货物序号" >
                {getFieldDecorator('lic_wrtof_detail_no', {
              })(<Input />)}
              </FormItem>
            </Col>
            <Col span={8}>
              <FormItem {...formItemLayout} colon={false} label="核销明细余量" >
                {getFieldDecorator('lic_detail_left', {
              })(<Input disabled />)}
              </FormItem>
            </Col>
            <Col span={8}>
              <FormItem {...formItemLayout} colon={false} label="核销数量" >
                {getFieldDecorator('lic_wrtof_qty', {
              })(<Input onChange={this.handleQtyChange} />)}
              </FormItem>
            </Col>
            <Col span={8}>
              <FormItem {...formItemLayout} colon={false} label="核销后余量" >
                {getFieldDecorator('lic_wrtof_left', {
              })(<Input disabled />)}
              </FormItem>
            </Col>
          </Row>
          <Row style={{ marginBottom: 8, textAlign: 'right' }}>
            <Button type="primary" icon="plus-circle-o" onClick={this.handleSave}>添加</Button>
          </Row>
        </Form>
        <Table size="small" columns={columns} dataSource={dataSource} pagination={null} rowKey="id" />
      </Modal>
    );
  }
}

