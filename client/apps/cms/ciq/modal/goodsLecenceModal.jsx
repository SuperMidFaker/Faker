import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Col, Form, Row, Input, Select, Modal, Table, Button } from 'antd';
import { toggleGoodsLicenceModal, addGoodsLicence, loadGoodsLicences, deleteGoodsLicences } from 'common/reducers/cmsCiqDeclare';
import { CIQ_LICENCE_TYPE } from 'common/constants';

const FormItem = Form.Item;
const { Option } = Select;

@connect(
  state => ({
    visible: state.cmsCiqDeclare.goodsLicenceModal.visible,
    goodsData: state.cmsCiqDeclare.goodsLicenceModal.goodsData,
  }),
  {
    toggleGoodsLicenceModal, addGoodsLicence, loadGoodsLicences, deleteGoodsLicences,
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
    this.props.form.validateFields((err, values) => {
      if (!err) {
        this.props.addGoodsLicence(preEntrySeqNo, id, values).then((result) => {
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
    this.props.deleteGoodsLicences(selectedRowKeys).then((result) => {
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
    }, {
      title: '核销明细余量',
      dataIndex: 'lic_detail_left',
    }, {
      title: '核销后余量',
      dataIndex: 'lic_wrtof_left',
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
              <FormItem {...formItemLayout} colon={false} label="许可证类别" >
                {getFieldDecorator('lic_type_code', {
                required: true,
              })(<Select showSearch optionFilterProp="children" style={{ width: '100%' }}>
                {CIQ_LICENCE_TYPE.map(type =>
                  (<Option key={type.value} value={type.value}>
                    {type.text}
                  </Option>))}
              </Select>)}
              </FormItem>
            </Col>
            <Col span={8}>
              <FormItem {...formItemLayout} colon={false} label="许可证编号" >
                {getFieldDecorator('licence_no', {
                required: true,
              })(<Input />)}
              </FormItem>
            </Col>
            <Col span={8}>
              <FormItem {...formItemLayout} colon={false} label="核销货物序号" >
                {getFieldDecorator('lic_wrtof_detail_no', {
              })(<Input />)}
              </FormItem>
            </Col>
            <Col span={8}>
              <FormItem {...formItemLayout} colon={false} label="核销数量" >
                {getFieldDecorator('lic_wrtof_qty', {
              })(<Input />)}
              </FormItem>
            </Col>
            <Col span={8}>
              <FormItem {...formItemLayout} colon={false} label="核销明细余量" >
                {getFieldDecorator('lic_detail_left', {
              })(<Input />)}
              </FormItem>
            </Col>
            <Col span={8}>
              <FormItem {...formItemLayout} colon={false} label="核销后余量" >
                {getFieldDecorator('lic_wrtof_left', {
              })(<Input />)}
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

