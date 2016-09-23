import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Form, Input, Modal, Cascader, Upload, Button, message } from 'antd';
import { showShipmentAdvanceModal, createAdvance } from 'common/reducers/trackingLandStatus';
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
  { showShipmentAdvanceModal, createAdvance }
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
  }
  state = {
    photoList: [],
  }
  DEFAULT_ADVANCECHARGES = [
    {
      category: '散货',
      fee_name: '仓储费',
      fee_code: 'CCF',
    }, {
      category: '集装箱',
      fee_name: '港杂费',
      fee_code: 'GZF',
    }, {
      category: '集装箱',
      fee_name: '港建费',
      fee_code: 'GJF',
    }, {
      category: '集装箱',
      fee_name: '疏港费',
      fee_code: 'SGF',
    }, {
      category: '集装箱',
      fee_name: '超期费',
      fee_code: 'CQF',
    }, {
      category: '集装箱',
      fee_name: '坏污箱',
      fee_code: 'HWX',
    }, {
      category: '运输通用',
      fee_name: '动检场地费-运输环节',
      fee_code: 'DJCDF',
    }, {
      category: '运输通用',
      fee_name: '品质查验场地费-运输环节',
      fee_code: 'PZCYCDF',
    }, {
      category: '运输通用',
      fee_name: '快递费',
      fee_code: 'KDF',
    }, {
      category: '运输通用',
      fee_name: '运输其他费用',
      fee_code: 'QIFY',
    }]
  msg = descriptor => formatMsg(this.props.intl, descriptor)
  handleOk = () => {
    const { form, shipmtNo, dispId, loginId, tenantId, loginName } = this.props;
    const fieldsValue = form.getFieldsValue();
    fieldsValue.photos = this.state.photoList.map(ph => ph.url).join(',');
    if (!fieldsValue.types) {
      message.error('请选择垫付类型');
    } else if (fieldsValue.amount === '') {
      message.error('请输入垫付金额');
    } else {
      const { types, amount, remark, photos } = fieldsValue;
      const advance = this.DEFAULT_ADVANCECHARGES.find(item => item.category === types[0] && item.fee_name === types[1]);
      const uploadData = {
        shipmtNo, dispId, type: types[0], name: types[1], code: advance.fee_code, amount: Number(amount),
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
    const options = [];
    for (let i = 0; i < this.DEFAULT_ADVANCECHARGES.length; i++) {
      if (options.length === 0) {
        options.push({
          value: this.DEFAULT_ADVANCECHARGES[i].category,
          label: this.DEFAULT_ADVANCECHARGES[i].category,
          children: [{
            value: this.DEFAULT_ADVANCECHARGES[i].fee_name,
            label: this.DEFAULT_ADVANCECHARGES[i].fee_name,
          }],
        });
      } else {
        let flag = false;
        for (let j = 0; j < options.length; j++) {
          if (options[j].label === this.DEFAULT_ADVANCECHARGES[i].category) {
            options[j].children.push({
              value: this.DEFAULT_ADVANCECHARGES[i].fee_name,
              label: this.DEFAULT_ADVANCECHARGES[i].fee_name,
            });
            flag = true;
            break;
          }
        }
        if (flag === false) {
          options.push({
            value: this.DEFAULT_ADVANCECHARGES[i].category,
            label: this.DEFAULT_ADVANCECHARGES[i].category,
            children: [{
              value: this.DEFAULT_ADVANCECHARGES[i].fee_name,
              label: this.DEFAULT_ADVANCECHARGES[i].fee_name,
            }],
          });
        }
      }
    }
    return (
      <Modal title="添加垫付费用" onCancel={this.handleCancel} onOk={this.handleOk}
        visible={this.props.visible} maskClosable={false}
      >
        <Form className="row" style={{ width: '400px' }}>
          <FormItem label="垫付类型" labelCol={{ span: colSpan }} wrapperCol={{ span: 24 - colSpan }} required >
            <Cascader options={options} placeholder="请选择垫付类型" {...getFieldProps('types', {
            })} />
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
