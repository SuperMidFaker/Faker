import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Modal, Form, Select, Row, Col, Input, Button, Table } from 'antd';
import { toggleEntQualifiModal, saveEntQualif, loadEntQualif, deleteEntQualif } from 'common/reducers/cmsCiqDeclare';
import { CIQ_ENT_QUALIFY_TYPE } from 'common/constants';
import RowAction from 'client/components/RowAction';

const FormItem = Form.Item;
const { Option } = Select;

@connect(
  state => ({
    visible: state.cmsCiqDeclare.entQualifictaionModal.visible,
    entQualifs: state.cmsCiqDeclare.entQualifs,
  }),
  {
    toggleEntQualifiModal, saveEntQualif, loadEntQualif, deleteEntQualif,
  }
)
@Form.create()
export default class EntQualifyModal extends Component {
  static propTypes = {
    customerPartnerId: PropTypes.number.isRequired,
    ciqCode: PropTypes.string,
  }
  handleCancel = () => {
    this.props.toggleEntQualifiModal(false);
  }
  handleSave = () => {
    const { form, customerPartnerId, ciqCode } = this.props;
    form.validateFields((err, values) => {
      if (!err) {
        const data = { ...values };
        data.customer_partner_id = customerPartnerId;
        data.ciq_code = ciqCode;
        this.props.saveEntQualif(data).then((result) => {
          if (!result.error) {
            this.props.loadEntQualif(customerPartnerId, ciqCode);
            form.resetFields();
          }
        });
      }
    });
  }
  handleDelete = (row) => {
    const { customerPartnerId, ciqCode } = this.props;
    this.props.deleteEntQualif([row.id]).then((result) => {
      if (!result.error) {
        this.props.loadEntQualif(customerPartnerId, ciqCode);
      }
    });
  }
  render() {
    const { visible, form: { getFieldDecorator }, entQualifs } = this.props;
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
      title: '企业资质类别编号',
      dataIndex: 'ent_qualif_type_code',
    }, {
      title: '资质名称',
      render: (o, record) => CIQ_ENT_QUALIFY_TYPE.find(type =>
        type.value === Number(record.ent_qualif_type_code)) &&
       CIQ_ENT_QUALIFY_TYPE.find(type => type.value === Number(record.ent_qualif_type_code)).text,
    }, {
      title: '企业资质编号',
      dataIndex: 'ent_qualif_no',
    }, {
      title: '企业组织机构代码',
      dataIndex: 'ent_org_code',
    }, {
      title: '企业名称',
      dataIndex: 'ent_name',
    }, {
      dataIndex: 'OPS_COL',
      width: 45,
      render: (o, record) => <RowAction danger confirm="确定删除?" onConfirm={this.handleDelete} icon="delete" tooltip="删除" row={record} />,
    }];
    return (
      <Modal width={1200} title="企业资质" visible={visible} onCancel={this.handleCancel} onOk={this.handleCancel}>
        <Form layout="horizontal" hideRequiredMark className="form-layout-multi-col">
          <Row>
            <Col span={12}>
              <FormItem {...formItemLayout} label="企业资质类别">
                {getFieldDecorator('ent_qualif_type_code', {
                  required: true,
                })(<Select>
                  {CIQ_ENT_QUALIFY_TYPE.map(type =>
                    (<Option key={type.value} value={type.value}>
                      {type.value} | {type.text}</Option>))}
                </Select>)}
              </FormItem>
            </Col>
            <Col span={12}>
              <FormItem {...formItemLayout} label="企业资质编号">
                {getFieldDecorator('ent_qualif_no')(<Input />)}
              </FormItem>
            </Col>
            <Col span={12}>
              <FormItem {...formItemLayout} label="企业名称">
                {getFieldDecorator('ent_name')(<Input />)}
              </FormItem>
            </Col>
            <Col span={12}>
              <FormItem {...formItemLayout} label="企业组织机构代码">
                {getFieldDecorator('ent_org_code')(<Input />)}
              </FormItem>
            </Col>
          </Row>
          <Row style={{ marginBottom: 8, textAlign: 'right' }}>
            <Button type="primary" icon="plus-circle-o" onClick={this.handleSave}>添加</Button>
          </Row>
        </Form>
        <Table size="small" columns={columns} dataSource={entQualifs} pagination={null} rowKey="id" />
      </Modal>
    );
  }
}