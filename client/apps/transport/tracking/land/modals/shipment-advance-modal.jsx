import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Form, Input, Modal, Cascader, Upload, Button } from 'antd';
import { showShipmentAdvanceModal } from 'common/reducers/trackingLandStatus';
import { format } from 'client/common/i18n/helpers';
import messages from '../message.i18n';

const formatMsg = format(messages);
const FormItem = Form.Item;

@injectIntl
@connect(
  state => ({
    loginId: state.account.loginId,
    tenantId: state.account.tenantId,
    loginName: state.account.username,
    visible: state.trackingLandStatus.shipmentAdvanceModal.visible,
    dispId: state.trackingLandStatus.shipmentAdvanceModal.dispId,
    shipmtNo: state.trackingLandStatus.shipmentAdvanceModal.shipmtNo,
  }),
  { showShipmentAdvanceModal }
)
@Form.create()
export default class ShipmentAdvanceModal extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    loginId: PropTypes.number.isRequired,
    tenantId: PropTypes.number.isRequired,
    loginName: PropTypes.string.isRequired,
    dispId: PropTypes.number.isRequired,
    shipmtNo: PropTypes.string.isRequired,
    visible: PropTypes.bool.isRequired,
    showShipmentAdvanceModal: PropTypes.func.isRequired,
  }
  state = {
    photoList: [],
  }
  msg = descriptor => formatMsg(this.props.intl, descriptor)
  handleOk = () => {
    // const { form, dispId, loginId, tenantId, loginName } = this.props;
    // const fieldsValue = form.getFieldsValue();
    // fieldsValue.photos = this.state.photoList.map(ph => ph.url).join(',');
    // console.log(fieldsValue);
    // if (fieldsValue.type === '') {
    //   message.error('请选择垫付类型');
    // } else if (fieldsValue.amount === '') {
    //   message.error('请输入垫付金额');
    // } else {

    // }
  }
  handleCancel = () => {
    this.props.showShipmentAdvanceModal({ visible: false, shipmtNo: '', dispId: -1 });
  }
  handlePhotoRemove = (file) => {
    const photoList = [...this.state.photoList];
    const index = photoList.findIndex(item => item.uid === file.uid);
    photoList.splice(index, 1);
    this.setState({ photoList });
  }
  handlePhotoUpload = (info) => {
    const fileList = [...info.fileList];
    const index = fileList.findIndex(item => item.uid === info.file.uid);
    fileList[index].url = info.file.response ? info.file.response.data : '';
    this.setState({ photoList: fileList });
  }
  render() {
    const { form: { getFieldProps } } = this.props;
    const { photoList } = this.state;
    const colSpan = 6;
    const options = [];
    return (
      <Modal title="添加垫付费用" onCancel={this.handleCancel} onOk={this.handleOk}
        visible={this.props.visible} maskClosable={false}
      >
        <Form className="row" style={{ width: '400px' }}>
          <FormItem label="垫付类型" labelCol={{ span: colSpan }} wrapperCol={{ span: 24 - colSpan }} required >
            <Cascader options={options} placeholder="请选择垫付类型" {...getFieldProps('type', {
            })} />
          </FormItem>
          <FormItem label="垫付费用" labelCol={{ span: colSpan }} wrapperCol={{ span: 24 - colSpan }} required >
            <Input type="number" placeholder="请输入金额" addonAfter="元" {...getFieldProps('amount', {
              initialValue: '',
            })} />
          </FormItem>
          <FormItem label="垫付照片" labelCol={{ span: colSpan }}
            wrapperCol={{ span: 24 - colSpan }}
          >
            <Upload action={`${API_ROOTS.default}v1/upload/img/`} listType="picture"
              onChange={this.handlePhotoUpload} onRemove={this.handlePhotoRemove} fileList={photoList} withCredentials
            >
              <Button icon="upload" type="ghost" />
              {this.msg('photoSubmit')}
            </Upload>
          </FormItem>
          <FormItem label="垫付备注" labelCol={{ span: colSpan }} wrapperCol={{ span: 24 - colSpan }} required >
            <Input type="textarea" id="control-textarea" rows="5" placeholder="请输入对异常的描述" {...getFieldProps('remark', {
              initialValue: '',
            })} />
          </FormItem>
        </Form>
      </Modal>
    );
  }
}
