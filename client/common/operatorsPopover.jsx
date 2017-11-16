import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Popover, Form, Select, Button, Icon, message } from 'antd';
import { loadOperators } from 'common/reducers/crmCustomers';
import messages from './root.i18n';
import { format } from './i18n/helpers';

const formatMsg = format(messages);
const FormItem = Form.Item;
const Option = Select.Option;

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    operators: state.crmCustomers.operators,
  }),
  { loadOperators }
)
export default class OperatorsPopover extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    record: PropTypes.object,
    handleAccept: PropTypes.func.isRequired,
    module: PropTypes.string.isRequired,
    partnerIds: PropTypes.array,
    partnerId: PropTypes.number.isRequired,
  }
  state = {
    visible: false,
    value: '',
  }
  msg = key => formatMsg(this.props.intl, key);
  handlePopVisibleChange = (visible) => {
    if (visible === true) {
      if (this.props.module === 'multiple') {
        const partnerIds = this.props.partnerIds;
        for (let i = 0; i < partnerIds.length; i++) {
          for (let j = 0; j < partnerIds.length; j++) {
            if (partnerIds[i] !== partnerIds[j]) {
              message.info('批量接单需选择同一客户');
              return false;
            }
          }
        }
      }
      this.props.loadOperators(this.props.partnerId, this.props.tenantId);
      this.setState({ visible });
    }
  }
  handleSelect = ({ key, label }) => {
    this.setState({
      visible: true,
      lid: key,
      name: label,
    });
  }
  render() {
    const { operators, record, handleAccept, module } = this.props;
    const visible = this.state.visible;
    const label = module === 'clearance' ? 'allocateOriginator' : 'allocateOperator';
    let button = '';
    if (module === 'multiple') {
      button = (<Button type="default">
        批量接单
      </Button>);
    } else if (module === 'shipment' || module === 'delegation') {
      button = (<Button key="accept" type="primary" icon="check" >
          接单
        </Button>);
    } else {
      button = (<span style={{ color: '#108ee9', background: 'transparent' }}><Icon type="check-square-o" />{this.msg('accepting')}</span>);
    }
    return (
      <Popover visible={visible} onVisibleChange={this.handlePopVisibleChange} trigger="click" content={
        <div style={{ width: 140 }}>
          <FormItem label={this.msg(label)} >
            <Select labelInValue style={{ width: '100%' }} onSelect={this.handleSelect}>
              {operators.map(op => <Option key={`${op.lid}${op.name}`} value={op.lid}>{op.name}</Option>)}
            </Select>
          </FormItem>
          <Button type="primary" onClick={() => { handleAccept(record, this.state.lid, this.state.name); this.setState({ visible: false }); }} >确定</Button>
          <Button style={{ marginLeft: 8 }} onClick={() => this.setState({ visible: false })} >取消</Button>
        </div>
      }
      >
        {button}
      </Popover>
    );
  }
}
