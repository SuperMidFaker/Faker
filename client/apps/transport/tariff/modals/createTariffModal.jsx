import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Form, message, Modal, Select } from 'antd';
import { loadPartners, loadNewForm, showCreateTariffModal } from 'common/reducers/transportTariff';
import { TARIFF_KINDS, PARTNER_ROLES, PARTNER_BUSINESSE_TYPES } from 'common/constants';
const FormItem = Form.Item;
const Option = Select.Option;

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    visible: state.transportTariff.createTariffModal.visible,
    partners: state.transportTariff.partners,
  }),
  { loadPartners, loadNewForm, showCreateTariffModal }
)
@Form.create()
export default class CreateTariffModal extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
    visible: PropTypes.bool.isRequired,
    loadPartners: PropTypes.func.isRequired,
    partners: PropTypes.array.isRequired,
    loadNewForm: PropTypes.func.isRequired,
    showCreateTariffModal: PropTypes.func.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  state = {
    partnerVisible: true,
    formData: { },
  }
  handleOk = () => {
    const editForm = this.props.form.getFieldsValue();
    if (editForm.kind === undefined) {
      message.error('请选择价格类型');
    } else if ((editForm.kind === 0 || editForm.kind === 1) && editForm.partnerId === undefined) {
      message.error('请选择合作伙伴');
    } else {
      const selpartners = this.props.partners.find(
        pt => pt.partner_id === editForm.partnerId);
      let partnerName = '';
      let partnerTid = -1;
      if (selpartners) {
        partnerName = selpartners.name;
        partnerTid = selpartners.tid;
      }
      this.props.loadNewForm({
        ...editForm,
        partnerName,
        partnerTid,
      });
      this.context.router.push('/transport/billing/tariff/new');
    }
  }
  handleCancel = () => {
    this.props.showCreateTariffModal(false);
  }
  handleTariffKindSelect = (value) => {
    const kind = TARIFF_KINDS[value];
    if (kind.isBase) {
      this.setState({ partnerVisible: false });
    } else if (kind.value === 'sales') {
      this.props.loadPartners(this.props.tenantId,
        [PARTNER_ROLES.CUS, PARTNER_ROLES.DCUS],
        [PARTNER_BUSINESSE_TYPES.transport])
        .then((result) => {
          if (result.error) {
            message.error(result.error.message, 10);
          } else {
            this.setState({ partnerVisible: true });
          }
        });
    } else if (kind.value === 'cost') {
      this.props.loadPartners(this.props.tenantId,
        [PARTNER_ROLES.SUP],
        [PARTNER_BUSINESSE_TYPES.transport])
        .then((result) => {
          if (result.error) {
            message.error(result.error.message, 10);
          } else {
            this.setState({ partnerVisible: true });
          }
        });
    }
  }
  render() {
    const { partners, form: { getFieldDecorator } } = this.props;
    const { formData, partnerVisible } = this.state;

    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 18 },
    };
    return (
      <Modal maskClosable={false} title="新建报价" onCancel={this.handleCancel} onOk={this.handleOk}
        visible={this.props.visible}
      >
        <Form className="row" style={{ width: '400px' }}>
          <FormItem label="价格类型" {...formItemLayout}>
            {getFieldDecorator('kind', {
              initialValue: formData.kind,
              rules: [{ required: true, message: '价格类型必选', type: 'number' }],
            })(<Select onSelect={this.handleTariffKindSelect}>
              {
                TARIFF_KINDS.map(
                  (tk, idx) =>
                    <Option value={idx} key={tk.value}>{TARIFF_KINDS[idx].text}</Option>
                )
              }
            </Select>)}
          </FormItem>
          {partnerVisible && (
            <FormItem label="合作伙伴" {...formItemLayout}>
              {getFieldDecorator('partnerId', {
                initialValue: formData.partnerId,
                rules: [{ required: true, message: '合作伙伴必选', type: 'number' }],
              })(
                <Select showSearch optionFilterProp="searched" allowClear>
                  {
                  partners.map(pt => (
                    <Option searched={`${pt.partner_code}${pt.name}`}
                      value={pt.partner_id} key={pt.partner_id}
                    >
                      {pt.partner_code ? `${pt.partner_code} | ${pt.name}` : pt.name}
                    </Option>)
                  )
                }
                </Select>
              )}
            </FormItem>
          )}
        </Form>
      </Modal>
    );
  }
}
