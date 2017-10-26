import React, { Component } from 'react';
import { Modal, Form, Select, Button } from 'antd';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import connectFetch from 'client/common/decorators/connect-fetch';
import { hideImportModal } from 'common/reducers/cmsTradeManual';
import { loadPartners } from 'common/reducers/partner';
import ExcelUploader from 'client/components/ExcelUploader';
import messages from '../message.i18n';
import { format } from 'client/common/i18n/helpers';
import { PARTNER_ROLES, PARTNER_BUSINESSE_TYPES } from 'common/constants';

const formatMsg = format(messages);
const FormItem = Form.Item;
const Option = Select.Option;

function fetchData({ state, dispatch }) {
  return dispatch(loadPartners({
    tenantId: state.account.tenantId,
    role: PARTNER_ROLES.CUS,
    businessType: PARTNER_BUSINESSE_TYPES.clearance,
  }));
}

@connectFetch()(fetchData)
@injectIntl
@connect(
  state => ({
    visible: state.cmsTradeManual.importModal.visible,
    loginId: state.account.loginId,
    customers: state.partner.partners,
  }),
  { hideImportModal }
)

export default class ImportModal extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
  }
  state = {
    ownerPartnerId: '',
    ownerTenantId: '',
    ownerName: '',
  }
  msg = key => formatMsg(this.props.intl, key);
  handleCancel = () => {
    this.props.hideImportModal();
    this.setState({
      ownerPartnerId: '',
      ownerTenantId: '',
      ownerName: '',
    });
  }
  handleSelect = (value) => {
    const { customers } = this.props;
    const customer = customers.find(c => c.id === value);
    this.setState({
      ownerPartnerId: customer.id,
      ownerTenantId: customer.partner_tenant_id,
      ownerName: customer.name,
    });
  }
  manualUploaded = () => {
    this.handleCancel();
  }
  render() {
    const { visible, customers } = this.props;
    const { ownerName, ownerPartnerId, ownerTenantId } = this.state;
    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 14 },
    };
    return (
      <Modal visible={visible} title="客户选择" footer={<span>
        <Button onClick={this.handleCancel} style={{ marginRight: 8 }}>取消</Button>
        <ExcelUploader endpoint={`${API_ROOTS.default}v1/cms/manual/import`}
          formData={{
            data: JSON.stringify({
              loginId: this.props.loginId,
              ownerPartnerId,
              ownerTenantId,
              ownerName,
            }),
          }} onUploaded={this.manualUploaded}
        >
          <Button type="primary" onClick={this.handleOk} disabled={!ownerPartnerId}>确定</Button>
        </ExcelUploader>
      </span>} onCancel={this.handleCancel}
      >
        <Form>
          <FormItem label="客户" {...formItemLayout}>
            <Select onSelect={this.handleSelect} value={ownerPartnerId}>
              {customers.map(item => <Option value={item.id} key={item.id}>{item.name}</Option>)}
            </Select>
          </FormItem>
        </Form>
      </Modal>
    );
  }
}
