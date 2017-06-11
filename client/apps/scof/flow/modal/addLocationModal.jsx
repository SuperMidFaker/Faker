/* eslint react/no-multi-comp: 0 */
import React, { PropTypes } from 'react';
import { intlShape, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { Modal, Form, Input, Row, Col } from 'antd';
import RegionCascade from 'client/components/region-cascade';
import { toggleAddLocationModal, loadTmsBizParams } from 'common/reducers/scofFlow';
import { loadFormRequires } from 'common/reducers/crmOrders';
import { addNode } from 'common/reducers/transportResources';
import { formatMsg } from '../message.i18n';

const FormItem = Form.Item;


@injectIntl
@connect(
  state => ({
    visible: state.scofFlow.addLocationModal.visible,
    partnerId: state.scofFlow.addLocationModal.partnerId,
    partnerName: state.scofFlow.addLocationModal.partnerName,
    tenantId: state.account.tenantId,
    type: state.scofFlow.addLocationModal.type,
  }),
  { toggleAddLocationModal,
    loadTmsBizParams,
    loadFormRequires,
    addNode,
  }
)
@Form.create()
export default class AddLocationModal extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    visible: PropTypes.bool.isRequired,
    tenantId: PropTypes.number.isRequired,
    toggleAddLocationModal: PropTypes.func.isRequired,
    partnerId: PropTypes.number.isRequired,
    partnerName: PropTypes.number.isRequired,
    loadTmsBizParams: PropTypes.func.isRequired,
    loadFormRequires: PropTypes.func.isRequired,
    addNode: PropTypes.func.isRequired,
    type: PropTypes.number.isRequired,
  }
  state = {
    region: {
      province: '',
      city: '',
      district: '',
      street: '',
      region_code: '',
    },
  }
  handleCancel = () => {
    this.props.toggleAddLocationModal({ visible: false });
  }
  handleOk = () => {
    const { form, type, tenantId, partnerId, partnerName } = this.props;
    const { region } = this.state;
    const nodeInfoInForm = form.getFieldsValue();
    const nodeInfo = Object.assign({}, nodeInfoInForm, { ...region, type, tenant_id: tenantId, ref_partner_id: partnerId, ref_partner_name: partnerName });
    this.props.addNode(nodeInfo).then(() => {
      this.props.toggleAddLocationModal({ visible: false });
    });
  }
  handleRegionChange = (value) => {
    const [code, province, city, district, street] = value;
    const region = Object.assign({}, { region_code: code, province, city, district, street });
    this.setState({ region });
  }
  msg = formatMsg(this.props.intl)
  render() {
    const { visible, type, form: { getFieldDecorator } } = this.props;
    let typeDesc = '';
    if (type === 0) {
      typeDesc = '发货方';
    } else if (type === 1) {
      typeDesc = '收货方';
    }
    return (
      <Modal visible={visible} title={`添加${typeDesc}`}
        onCancel={this.handleCancel} onOk={this.handleOk}
      >
        <Row>
          <Col span="14">
            <FormItem label={`${typeDesc}名称`}>
              {getFieldDecorator('name')(<Input placeholder={`${typeDesc}名称`} />)}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={10}>
          <Col span="14">
            <FormItem label={this.msg('locationProvince')}>
              <RegionCascade
                onChange={this.handleRegionChange}
              />
            </FormItem>
          </Col>
          <Col span="10">
            <FormItem label="地点别名">
              {getFieldDecorator('byname')(<Input placeholder="地点别名" />)}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <FormItem label={this.msg('locationAddress')}>
            {getFieldDecorator('addr')(<Input placeholder="请输入收货地址" />)}
          </FormItem>
        </Row>
        <Row gutter={10}>
          <Col span="8">
            <FormItem label="联系人" >
              {getFieldDecorator('contact')(<Input placeholder="联系人" />)}
            </FormItem>
          </Col>
          <Col span="8">
            <FormItem label="手机号" >
              {getFieldDecorator('mobile')(<Input placeholder="手机号" />)}
            </FormItem>
          </Col>
          <Col span="8">
            <FormItem label="邮箱">
              {getFieldDecorator('email')(<Input placeholder="邮箱" />)}
            </FormItem>
          </Col>
        </Row>
      </Modal>
    );
  }
}
