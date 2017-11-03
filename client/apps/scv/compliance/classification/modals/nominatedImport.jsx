import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Modal, Form, message, Select, Radio, Col, Upload, Button, Icon, Alert } from 'antd';
import { setNominatedVisible, nominatedImport, loadTradeItems, setCompareVisible, loadSyncList } from 'common/reducers/scvClassification';
import { format } from 'client/common/i18n/helpers';
import messages from '../message.i18n';

const formatMsg = format(messages);
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
    slaves: state.scvClassification.synclist,
    visibleNominatedModal: state.scvClassification.visibleNominatedModal,
    listFilter: state.scvClassification.listFilter,
    tradeItemlist: state.scvClassification.tradeItemlist,
  }),
  { setNominatedVisible, loadSyncList, nominatedImport, loadTradeItems, setCompareVisible }
)
export default class NominatedImport extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
    visibleNominatedModal: PropTypes.bool.isRequired,
    slaves: PropTypes.arrayOf(PropTypes.shape({ tenant_id: PropTypes.number, name: PropTypes.string })),
  }
  state = {
    nominated: true,
    attachments: [],
  }
  componentWillMount() {
    this.props.loadSyncList({ tenantId: this.props.tenantId });
  }
  handleCancel = () => {
    this.props.setNominatedVisible(false);
  }
  handleOk = () => {
    const { tenantId, tenantName, slaves } = this.props;
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
      const broker = slaves.filter(tr => tr.broker_tenant_id === val.broker)[0];
      params = { ...params,
        contributeTenantId: broker.broker_tenant_id,
        contributeTenantName: broker.broker_name,
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
    const { form: { getFieldDecorator }, visibleNominatedModal, slaves } = this.props;
    return (
      <Modal maskClosable={false} title={this.msg('nominatedBroker')} visible={visibleNominatedModal}
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

                style={{ width: '90%' }}
              >
                {slaves.map(data => (
                  <Option key={data.broker_tenant_id} value={data.broker_tenant_id} >{data.broker_name}</Option>)
                )}
              </Select>)
            }
          </Col>}
        </FormItem>
        {this.state.nominated && <Alert message="需要增加新的报关行，请到归类设置 -> 从库同步中添加" type="info" showIcon />}
        <FormItem>
          <Col span="4">
            <Radio checked={!this.state.nominated} onChange={this.handleRadioChange}>
              {this.msg('nonNominatedBroker')}
            </Radio>
          </Col>
          {!this.state.nominated && <Col offset="2" span="18">
            物料信息由我方修改审核
          </Col>}
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
