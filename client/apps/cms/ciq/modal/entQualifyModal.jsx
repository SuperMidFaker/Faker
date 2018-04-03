import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Modal, Form, Select, Row, Col, Input, Button, Table } from 'antd';
import { toggleEntQualifiModal, saveEntQualif, loadEntQualif, deleteEntQualif } from 'common/reducers/cmsCiqDeclare';
import { CIQ_ENT_QUALIFY_TYPE } from 'common/constants';
import RowAction from 'client/components/RowAction';
import { intlShape, injectIntl } from 'react-intl';
import { formatMsg } from '../message.i18n';

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
@injectIntl
@Form.create()
export default class EntQualifyModal extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    customerPartnerId: PropTypes.number,
    ciqCode: PropTypes.string,
  }
  msg = formatMsg(this.props.intl)
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
      title: this.msg('entQualifTypeCode'),
      dataIndex: 'ent_qualif_type_code',
    }, {
      title: this.msg('entQualifName'),
      render: (o, record) => CIQ_ENT_QUALIFY_TYPE.find(type =>
        type.value === Number(record.ent_qualif_type_code)) &&
       CIQ_ENT_QUALIFY_TYPE.find(type => type.value === Number(record.ent_qualif_type_code)).text,
    }, {
      title: this.msg('entQualifNo'),
      dataIndex: 'ent_qualif_no',
    }, {
      title: this.msg('entOrgCode'),
      dataIndex: 'ent_org_code',
    }, {
      title: this.msg('entName'),
      dataIndex: 'ent_name',
    }, {
      dataIndex: 'OPS_COL',
      className: 'table-col-ops',
      width: 45,
      render: (o, record) => <RowAction danger confirm={this.msg('ensureDelete')} onConfirm={this.handleDelete} icon="delete" tooltip={this.msg('delete')} row={record} />,
    }];
    return (
      <Modal width={1200} title={this.msg('entQualif')} visible={visible} onCancel={this.handleCancel} onOk={this.handleCancel}>
        <Form layout="horizontal" hideRequiredMark className="form-layout-multi-col">
          <Row>
            <Col span={12}>
              <FormItem {...formItemLayout} label={this.msg('entQualifTypeCode')}>
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
              <FormItem {...formItemLayout} label={this.msg('entQualifNo')}>
                {getFieldDecorator('ent_qualif_no')(<Input />)}
              </FormItem>
            </Col>
            <Col span={12}>
              <FormItem {...formItemLayout} label={this.msg('entName')}>
                {getFieldDecorator('ent_name')(<Input />)}
              </FormItem>
            </Col>
            <Col span={12}>
              <FormItem {...formItemLayout} label={this.msg('entOrgCode')}>
                {getFieldDecorator('ent_org_code')(<Input />)}
              </FormItem>
            </Col>
          </Row>
          <Row style={{ marginBottom: 8, textAlign: 'right' }}>
            <Button type="primary" icon="plus-circle-o" onClick={this.handleSave}>{this.msg('save')}</Button>
          </Row>
        </Form>
        <Table size="small" columns={columns} dataSource={entQualifs} pagination={null} rowKey="id" />
      </Modal>
    );
  }
}
