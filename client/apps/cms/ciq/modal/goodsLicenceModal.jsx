import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Col, Form, Row, Input, Select, Modal, Table, Button } from 'antd';
import { toggleGoodsLicenceModal, addGoodsLicence, loadGoodsLicences, deleteGoodsLicences, loadLicenceNo } from 'common/reducers/cmsCiqDeclare';
import { CIQ_LICENCE_TYPE } from 'common/constants';
import RowAction from 'client/components/RowAction';
import { intlShape, injectIntl } from 'react-intl';
import { format } from 'client/common/i18n/helpers';
import messages from '../message.i18n';

const formatMsg = format(messages);
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

@injectIntl
@Form.create()
export default class GoodsLicenceModal extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
  }
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
  msg = (descriptor, values) => formatMsg(this.props.intl, descriptor, values)
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
      title: this.msg('licenceType'),
      dataIndex: 'lic_type_code',
      render: o => CIQ_LICENCE_TYPE.find(type => type.value === o) &&
                   CIQ_LICENCE_TYPE.find(type => type.value === o).text,
    }, {
      title: this.msg('licenceNo'),
      dataIndex: 'licence_no',
    }, {
      title: this.msg('wrtofDetailNo'),
      dataIndex: 'lic_wrtof_detail_no',
    }, {
      title: this.msg('wrtofQty'),
      dataIndex: 'lic_wrtof_qty',
      align: 'right',
    }, {
      title: this.msg('detailLeft'),
      dataIndex: 'lic_detail_left',
      align: 'right',
    }, {
      title: this.msg('wrtofLeft'),
      dataIndex: 'lic_wrtof_left',
      align: 'right',
    }, {
      dataIndex: 'OPS_COL',
      width: 45,
      render: (o, record) => <RowAction danger confirm={this.msg('ensureDelete')} onConfirm={this.handleDelete} icon="delete" tooltip={this.msg('delete')} row={record} />,
    }];
    return (
      <Modal width={1000} title={this.msg('goodsLicence')} visible={visible} onCancel={this.handleCancel} onOk={this.handleCancel} destroyOnClose>
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
              <FormItem {...formItemLayout} colon={false} label={this.msg('licenceType')} >
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
              <FormItem {...formItemLayout} colon={false} label={this.msg('licenceNo')} >
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
              <FormItem {...formItemLayout} colon={false} label={this.msg('wrtofDetailNo')} >
                {getFieldDecorator('lic_wrtof_detail_no', {
              })(<Input />)}
              </FormItem>
            </Col>
            <Col span={8}>
              <FormItem {...formItemLayout} colon={false} label={this.msg('detailLeft')} >
                {getFieldDecorator('lic_detail_left', {
              })(<Input disabled />)}
              </FormItem>
            </Col>
            <Col span={8}>
              <FormItem {...formItemLayout} colon={false} label={this.msg('wrtofQty')} >
                {getFieldDecorator('lic_wrtof_qty', {
              })(<Input onChange={this.handleQtyChange} />)}
              </FormItem>
            </Col>
            <Col span={8}>
              <FormItem {...formItemLayout} colon={false} label={this.msg('wrtofLeft')} >
                {getFieldDecorator('lic_wrtof_left', {
              })(<Input disabled />)}
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

