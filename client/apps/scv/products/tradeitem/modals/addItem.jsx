import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Modal, Form, Input, message, Select } from 'antd';
import { setAdditemModalVisible, addItem, loadTradeItems } from 'common/reducers/scvTradeitem';
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
    visibleAddItemModal: state.scvTradeitem.visibleAddItemModal,
    brokers: state.scvTradeitem.brokers,
    listFilter: state.scvTradeitem.listFilter,
    tradeItemlist: state.scvTradeitem.tradeItemlist,
  }),
  { setAdditemModalVisible, loadPartners, addItem, loadTradeItems }
)
export default class AddItem extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
    visibleAddItemModal: PropTypes.bool.isRequired,
    brokers: PropTypes.array,
  }
  state = {
    brokers: [],
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
    this.props.setAdditemModalVisible(false);
  }
  handleOk = () => {
    const { tenantId, tenantName, loginId, loginName } = this.props;
    const val = this.props.form.getFieldsValue();
    const broker = this.state.brokers.find(tr => tr.id === val.broker);
    let params = {
      owner_tenant_id: tenantId,
      owner_name: tenantName,
      creater_login_id: loginId,
      creater_name: loginName,
      cop_product_no: val.cop_product_no,
    };
    if (broker) {
      params = { ...params,
        contribute_tenant_id: broker.partner_tenant_id,
        contribute_tenant_name: broker.name,
      };
    }
    this.props.addItem({ params }).then((result) => {
      if (result.error) {
        message.error(result.error.message, 10);
      } else {
        const { listFilter, tradeItemlist: { pageSize, current, searchText } } = this.props;
        this.props.form.resetFields();
        this.props.setAdditemModalVisible(false);
        this.props.loadTradeItems({
          tenantId,
          filter: JSON.stringify(listFilter),
          pageSize,
          currentPage: current,
          searchText,
        });
      }
    });
  }
  msg = descriptor => formatMsg(this.props.intl, descriptor)
  render() {
    const { form: { getFieldDecorator }, visibleAddItemModal } = this.props;
    return (
      <Modal title={this.msg('addItem')} visible={visibleAddItemModal}
        onOk={this.handleOk} onCancel={this.handleCancel}
      >
        <FormItem label={this.msg('copProductNo')} >
          {getFieldDecorator('cop_product_no', {
          })(<Input />)}
        </FormItem>
        <FormItem label={this.msg('broker')}>
          {getFieldDecorator('broker', { initialValue: null }
            )(<Select
              showSearch
              placeholder="选择报关行"
              optionFilterProp="children"
              size="large"
              style={{ width: '100%' }}
            >
              {this.state.brokers.map(data => (<Option key={data.id} value={data.id}
                search={`${data.partner_code}${data.name}`}
              >{data.partner_code ? `${data.partner_code} | ${data.name}` : data.name}</Option>)
              )}
            </Select>)
          }
        </FormItem>
      </Modal>
    );
  }
}

