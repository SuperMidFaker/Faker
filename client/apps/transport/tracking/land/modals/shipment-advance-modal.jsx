import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Form, Input, Modal, Select, Upload, Button, message } from 'antd';
import { showShipmentAdvanceModal, createAdvance } from 'common/reducers/trackingLandStatus';
import { getTariffByTransportInfo } from 'common/reducers/transportTariff';
import { format } from 'client/common/i18n/helpers';
import messages from '../message.i18n';

const formatMsg = format(messages);
const FormItem = Form.Item;
const Option = Select.Option;
@injectIntl
@connect(
  state => ({
    loginId: state.account.loginId,
    tenantId: state.account.tenantId,
    loginName: state.account.username,
    visible: state.trackingLandStatus.shipmentAdvanceModal.visible,
    dispId: state.trackingLandStatus.shipmentAdvanceModal.dispId,
    shipmtNo: state.trackingLandStatus.shipmentAdvanceModal.shipmtNo,
    transportModeId: state.trackingLandStatus.shipmentAdvanceModal.transportModeId,
    customerPartnerId: state.trackingLandStatus.shipmentAdvanceModal.customerPartnerId,
    goodsType: state.trackingLandStatus.shipmentAdvanceModal.goodsType,
    quotes: state.transportTariff.quotes,
  }),
  { showShipmentAdvanceModal, createAdvance, getTariffByTransportInfo }
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
    createAdvance: PropTypes.func.isRequired,
    transportModeId: PropTypes.number.isRequired,
    customerPartnerId: PropTypes.number.isRequired,
    goodsType: PropTypes.number.isRequired,
    quotes: PropTypes.object.isRequired,
    getTariffByTransportInfo: PropTypes.func.isRequired,
  }
  state = {
    photoList: [],
  }
  componentWillReceiveProps(nextProps) {
    if (this.props.shipmtNo !== nextProps.shipmtNo) {
      const { transportModeId, customerPartnerId, goodsType } = nextProps;
      this.props.getTariffByTransportInfo({ transModeCode: transportModeId, partnerId: customerPartnerId, goodsType });
    }
  }
  msg = descriptor => formatMsg(this.props.intl, descriptor)
  handleOk = () => {
    const { form, shipmtNo, dispId, loginId, tenantId, loginName } = this.props;
    const fieldsValue = form.getFieldsValue();
    fieldsValue.photos = this.state.photoList.map(ph => ph.url).join(',');
    if (!fieldsValue.type) {
      message.error('请选择垫付类型');
    } else if (fieldsValue.amount === '') {
      message.error('请输入垫付金额');
    } else {
      const { type, amount, remark, photos } = fieldsValue;
      const advance = this.props.quotes.fees.find(item => item.fee_code === type);
      const uploadData = {
        shipmtNo, dispId, name: advance.fee_name, code: type, amount: Number(amount),
        remark, photos, submitter: loginName, loginId, tenantId,
      };
      this.props.createAdvance(uploadData).then((result) => {
        if (result.error) {
          message.error(result.error.message);
        } else {
          message.info('添加成功');
          this.handleCancel();
        }
      });
    }
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

    return (
      <Modal title="添加垫付费用" onCancel={this.handleCancel} onOk={this.handleOk}
        visible={this.props.visible} maskClosable={false}
      >
        <Form className="row" style={{ width: '400px' }}>
          <FormItem label="垫付类型" labelCol={{ span: colSpan }} wrapperCol={{ span: 24 - colSpan }} required >
            <Select placeholder="请选择垫付类型" {...getFieldProps('type', {
            })} >
            {
              this.props.quotes.fees.map(item => (<Option value={item.fee_code}>{item.fee_name}</Option>))
            }
            </Select>
          </FormItem>
          <FormItem label="费用金额" labelCol={{ span: colSpan }} wrapperCol={{ span: 24 - colSpan }} required >
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
