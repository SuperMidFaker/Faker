import React from 'react';
import PropTypes from 'prop-types';
import { intlShape, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { Modal, Form, Input, Row, Col, AutoComplete } from 'antd';
import RegionCascader from 'client/components/RegionCascader';
import { toggleAddLocationModal, loadTmsBizParams, searchRateEnds } from 'common/reducers/scofFlow';
import { loadFormRequires } from 'common/reducers/sofOrders';
import { loadFormRequire } from 'common/reducers/shipment';
import { addNode } from 'common/reducers/transportResources';
import { loadRatesSources } from 'common/reducers/transportTariff';
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
    tariffId: state.scofFlow.addLocationModal.tariffId,
  }),
  {
    toggleAddLocationModal,
    loadTmsBizParams,
    loadFormRequires,
    addNode,
    loadRatesSources,
    searchRateEnds,
    loadFormRequire,
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
    partnerName: PropTypes.string.isRequired,
    loadTmsBizParams: PropTypes.func.isRequired,
    loadFormRequires: PropTypes.func.isRequired,
    addNode: PropTypes.func.isRequired,
    type: PropTypes.number.isRequired,
    onOk: PropTypes.func.isRequired,
    loadRatesSources: PropTypes.func.isRequired,
    searchRateEnds: PropTypes.func.isRequired,
    tariffId: PropTypes.string.isRequired,
    loadFormRequire: PropTypes.func.isRequired,
  }
  state = {
    region: {
      province: '',
      city: '',
      district: '',
      street: '',
      region_code: '',
    },
    locations: [],
  }
  handleCancel = () => {
    this.props.toggleAddLocationModal({ visible: false });
  }
  handleOk = () => {
    const {
      form, type, tenantId, partnerId, partnerName,
    } = this.props;
    const { region } = this.state;
    const nodeInfoInForm = form.getFieldsValue();
    const nodeInfo = Object.assign({}, nodeInfoInForm, {
      ...region, type, tenant_id: tenantId, ref_partner_id: partnerId, ref_partner_name: partnerName,
    });
    this.props.addNode(nodeInfo).then((result) => {
      this.setState({
        region: {
          province: '',
          city: '',
          district: '',
          street: '',
          region_code: '',
        },
      });
      this.props.form.resetFields();
      this.props.toggleAddLocationModal({ visible: false });
      Promise.all([
        this.props.loadFormRequires({ tenantId }),
        this.props.loadTmsBizParams(tenantId),
        this.props.loadFormRequire(null, tenantId),
      ]).then(() => {
        if (this.props.onOk) {
          this.props.onOk({ ...result.data, type });
        }
      });
    });
  }
  handleRegionChange = (value) => {
    const [code, province, city, district, street] = value;
    const region = Object.assign({}, {
      region_code: code, province, city, district, street,
    });
    this.setState({ region });
  }
  handleNameSelect = (value) => {
    const region = this.state.locations.find(item => item.name === value);
    this.setState({
      region: {
        province: region.province,
        city: region.city,
        district: region.district,
        street: region.street,
        region_code: region.code,
      },
    });
  }
  handleNameChange = (value) => {
    if (this.props.tariffId) {
      if (this.props.type === 0) {
        this.props.loadRatesSources({
          tariffId: this.props.tariffId,
          pageSize: 99999999,
          currentPage: 1,
          searchValue: value,
        }).then((result) => {
          this.setState({ locations: result.data.data.filter(item => !!item.source.name).map(item => item.source) });
        });
      } else if (this.props.type === 1) {
        this.props.searchRateEnds({
          tariffId: this.props.tariffId,
          searchValue: value,
        }).then((result) => {
          this.setState({ locations: result.data.filter(item => !!item.end.name).map(item => item.end) });
        });
      }
    }
  }
  msg = formatMsg(this.props.intl)
  render() {
    const { visible, type, form: { getFieldDecorator } } = this.props;
    const { region } = this.state;
    let typeDesc = '';
    if (type === 0) {
      typeDesc = '发货方';
    } else if (type === 1) {
      typeDesc = '收货方';
    }
    return (
      <Modal
        maskClosable={false}
        visible={visible}
        title={`添加${typeDesc}`}
        onCancel={this.handleCancel}
        onOk={this.handleOk}
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
              <RegionCascader
                region={[region.province, region.city, region.district, region.street]}
                onChange={this.handleRegionChange}
              />
            </FormItem>
          </Col>
          <Col span="10">
            <FormItem label="地点别名">
              {getFieldDecorator('byname')(<AutoComplete
                style={{ width: '100%' }}
                placeholder="地点别名"
                dataSource={this.state.locations.map(item => item.name)}
                onChange={this.handleNameChange}
                onSelect={this.handleNameSelect}
              />)}
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
