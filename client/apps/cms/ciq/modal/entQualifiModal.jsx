import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Modal, Form, Select, Row, Col, Input, Button, Table } from 'antd';
import { toggleEntQualifiModal, saveEntQualif, loadEntQualif, deleteEntQualif } from 'common/reducers/cmsCiqDeclare';
import { CIQ_ENT_QUALIFY_TYPE } from 'common/constants';

const FormItem = Form.Item;
const Option = Select.Option;

@connect(
  state => ({
    visible: state.cmsCiqDeclare.entQualifictaionModal.visible,
    entQualifs: state.cmsCiqDeclare.entQualifs,
  }),
  { toggleEntQualifiModal, saveEntQualif, loadEntQualif, deleteEntQualif }
)
@Form.create()
export default class EntQualifiModal extends Component {
  static propTypes = {
    customerPartnerId: PropTypes.string.isRequired,
    ciqCode: PropTypes.string,
  }
  state = {
    selectedRowKeys: [],
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
  handleDelete = () => {
    const { customerPartnerId, ciqCode } = this.props;
    const { selectedRowKeys } = this.state;
    if (selectedRowKeys.length > 0) {
      this.props.deleteEntQualif(selectedRowKeys).then((result) => {
        if (!result.error) {
          this.props.loadEntQualif(customerPartnerId, ciqCode);
          this.setState({
            selectedRowKeys: [],
          });
        }
      });
    }
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
    const rowSelection = {
      onChange: (selectedRowKeys) => {
        this.setState({
          selectedRowKeys,
        });
      },
    };
    const columns = [{
      title: '序号',
      render: (o, record, index) => index + 1,
    }, {
      title: '企业资质类别编号',
      dataIndex: 'ent_qualif_type_code',
    }, {
      title: '资质名称',
      render: (o, record) => CIQ_ENT_QUALIFY_TYPE.find(type => type.value === Number(record.ent_qualif_type_code)) &&
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
    }];
    return (
      <Modal width={960} title="企业资质" visible={visible} onCancel={this.handleCancel} onOk={this.handleCancel}>
        <Form>
          <Row>
            <Col span={12}>
              <FormItem {...formItemLayout} label="企业资质类别编号">
                {getFieldDecorator('ent_qualif_type_code', {
                  required: true,
                })(
                  <Select>
                    {CIQ_ENT_QUALIFY_TYPE.map(type => <Option key={type.value} value={type.value}>{type.value} | {type.text}</Option>)}
                  </Select>
                )}
              </FormItem>
            </Col>
            <Col span={12}>
              <FormItem {...formItemLayout} label="企业资质编号">
                {getFieldDecorator('ent_qualif_no')(
                  <Input />
                )}
              </FormItem>
            </Col>
          </Row>
          <Row>
            <Col span={12}>
              <FormItem {...formItemLayout} label="企业名称">
                {getFieldDecorator('ent_name')(
                  <Input />
                )}
              </FormItem>
            </Col>
            <Col span={12}>
              <FormItem {...formItemLayout} label="企业组织机构代码">
                {getFieldDecorator('ent_org_code')(
                  <Input />
                )}
              </FormItem>
            </Col>
          </Row>
          <Row style={{ marginBottom: 8 }}>
            <Col span={24} style={{ textAlign: 'right' }}>
              <Button type="primary" icon="save" onClick={this.handleSave}>保存</Button>
              <Button style={{ marginLeft: 8 }} icon="delete" onClick={this.handleDelete}>删除</Button>
            </Col>
          </Row>
        </Form>
        <Table size="middle" rowSelection={rowSelection} columns={columns} dataSource={entQualifs} pagination={null} rowKey="id" />
      </Modal>
    );
  }
}
