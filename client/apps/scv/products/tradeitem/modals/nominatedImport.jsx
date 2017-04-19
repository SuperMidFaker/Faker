import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Modal, Form, message, Select, Radio, Col, Upload, Button, Icon } from 'antd';
import { setNominatedVisible, nominatedImport, loadTradeItems, setCompareVisible } from 'common/reducers/scvClassification';
import { loadPartners } from 'common/reducers/partner';
import { PARTNER_ROLES, PARTNER_BUSINESSE_TYPES } from 'common/constants';
import { format } from 'client/common/i18n/helpers';
import messages from '../message.i18n';

const formatMsg = format(messages);
const role = PARTNER_ROLES.SUP;
const businessType = PARTNER_BUSINESSE_TYPES.clearance;
const FormItem = Form.Item;
const Option = Select.Option;

@Form.create()
@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    tenantName: state.account.tenantName,
    loginId: state.account.loginId,
    loginName: state.account.username,
    visibleNominatedModal: state.scvClassification.visibleNominatedModal,
    brokers: state.scvClassification.brokers,
    listFilter: state.scvClassification.listFilter,
    tradeItemlist: state.scvClassification.tradeItemlist,
  }),
  { setNominatedVisible, loadPartners, nominatedImport, loadTradeItems, setCompareVisible }
)
export default class NominatedImport extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
    visibleNominatedModal: PropTypes.bool.isRequired,
    brokers: PropTypes.array,
  }
  state = {
    brokers: [],
    nominated: true,
    attachments: [],
  };
  componentDidMount() {
    this.props.loadPartners({
      tenantId: this.props.tenantId,
      role,
      businessType,
    }).then((result) => {
      this.setState({ brokers: result.data.filter(item => item.partner_tenant_id !== -1) });
    });
  }
  handleCancel = () => {
    this.props.setNominatedVisible(false);
  }
  handleOk = () => {
    const { tenantId, tenantName } = this.props;
    const val = this.props.form.getFieldsValue();
    if (this.state.nominated && !val.broker) {
      return message.error('选择报关行', 5);
    }
    let params = {
      tenantId,
      contributeTenantId: tenantId,
      contributeTenantName: tenantName,
      nominated: this.state.nominated,
      file: this.state.attachments[0],
    };
    if (this.state.nominated) {
      const broker = this.state.brokers.find(tr => tr.id === val.broker);
      params = { ...params,
        contributeTenantId: broker.partner_tenant_id,
        contributeTenantName: broker.name,
      };
    }
    this.props.nominatedImport(params).then((result) => {
      if (result.error) {
        message.error(result.error.message, 10);
      } else {
        this.props.setNominatedVisible(false);
        this.props.setCompareVisible(true);
      }
    });
  }
  handleRadioChange = () => {
    this.setState({
      nominated: !this.state.nominated,
    });
  }
  handleImport = (info) => {
    if (info.file.status === 'removed') {
      return;
    }
    if (info.file.status === 'uploading') {
      this.setState({
        attachments: [...this.state.attachments, info.file],
      });
      return;
    }
    if (info.file.response.status !== 200) {
      message.error(info.file.response.msg);
      return;
    }
    const file = info.file;
    const nextFile = {
      uid: file.uid,
      name: file.name,
      url: file.response.data,
      status: 'done',
    };
    this.setState({
      attachments: [nextFile],
    });
  }
  handleRemove = () => {
    this.setState({ attachments: [] });
  }
  msg = descriptor => formatMsg(this.props.intl, descriptor)
  render() {
    const { form: { getFieldDecorator }, visibleNominatedModal } = this.props;
    return (
      <Modal title={this.msg('nominatedBroker')} visible={visibleNominatedModal}
        onOk={this.handleOk} onCancel={this.handleCancel}
      >
        <FormItem>
          <Col span="4">
            <Radio checked={this.state.nominated} onChange={this.handleRadioChange}>
              {this.msg('nominatedBroker')}
            </Radio>
          </Col>
          { this.state.nominated && <Col offset="2" span="18">
            {getFieldDecorator('broker', { initialValue: null }
              )(<Select
                showSearch
                placeholder="选择报关行"
                optionFilterProp="children"
                size="large"
                style={{ width: '90%' }}
              >
                {this.state.brokers.map(data => (<Option key={data.id} value={data.id}
                  search={`${data.partner_code}${data.name}`}
                >{data.partner_code ? `${data.partner_code} | ${data.name}` : data.name}</Option>)
                )}
              </Select>)
            }
          </Col>}
        </FormItem>
        <FormItem>
          <Col span="4">
            <Radio checked={!this.state.nominated} onChange={this.handleRadioChange}>
              {this.msg('nonNominatedBroker')}
            </Radio>
          </Col>
          <Col offset="2" span="18">
            物料信息由我方修改审核
          </Col>
        </FormItem>
        <Upload accept=".xls,.xlsx" onChange={this.handleImport} onRemove={this.handleRemove}
          fileList={this.state.attachments} action={`${API_ROOTS.default}v1/upload/excel/`} withCredentials
        >
          <Button type="ghost">
            <Icon type="upload" /> 导入数据
          </Button>
        </Upload>
      </Modal>
    );
  }
}
