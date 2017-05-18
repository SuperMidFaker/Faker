import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Popover, Form, Select, Button, Icon } from 'antd';
import RowUpdater from 'client/components/rowUpdater';
import { loadServiceTeamMembers } from 'common/reducers/crmCustomers';
import messages from './root.i18n';
import { format } from './i18n/helpers';
const formatMsg = format(messages);
const FormItem = Form.Item;
const Option = Select.Option;

@injectIntl
@connect(
  state => ({
    serviceTeamMembers: state.crmCustomers.serviceTeamMembers,
  }),
  { loadServiceTeamMembers }
)

export default class OperatorPopover extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    record: PropTypes.object.isRequired,
    handleAccept: PropTypes.func.isRequired,
  }
  state = {
    visible: false,
    value: '',
  }
  msg = key => formatMsg(this.props.intl, key);
  handlePopVisibleChange = (visible) => {
    if (visible === true) {
      const partnerId = this.props.record.partnerId;
      this.props.loadServiceTeamMembers(partnerId);
    }
    this.setState({ visible });
  }
  handleSelect = ({ key, label }) => {
    this.setState({
      visible: true,
      lid: key,
      name: label,
    });
  }
  render() {
    const { serviceTeamMembers, record, handleAccept } = this.props;
    const visible = this.state.visible;
    return (
      <Popover visible={visible} onVisibleChange={this.handlePopVisibleChange} content={
        <div style={{ width: 120 }}>
          <FormItem label={this.msg('allocateOriginator')} >
            <Select labelInValue style={{ width: '100%' }} onSelect={this.handleSelect}>
              {serviceTeamMembers.map(op => <Option key={`${op.lid}${op.name}`} value={op.lid}>{op.name}</Option>)}
            </Select>
          </FormItem>
          <Button type="primary" onClick={() => handleAccept(record, this.state.lid, this.state.name)} >确定</Button>
        </div>
      }
      >
        <RowUpdater label={<span><Icon type="check-square-o" /> {this.msg('accepting')}</span>} />
      </Popover>
    );
  }
}
