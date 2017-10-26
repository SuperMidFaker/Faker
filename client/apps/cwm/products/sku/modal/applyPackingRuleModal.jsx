import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { intlShape, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { Form, Modal, Select } from 'antd';
import { format } from 'client/common/i18n/helpers';
import messages from '../../message.i18n';
import { closeApplyPackingRuleModal } from 'common/reducers/cwmSku';

const formatMsg = format(messages);
const FormItem = Form.Item;
const Option = Select.Option;

@injectIntl
@connect(
  state => ({
    packings: state.cwmSku.params.packings,
    visible: state.cwmSku.applyPackingRuleModal.visible,
  }),
  { closeApplyPackingRuleModal }
)
@Form.create()
export default class ApplyPackingRuleModal extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    packings: PropTypes.arrayOf(PropTypes.shape({
      code: PropTypes.string,
      desc: PropTypes.string,
      convey_inner_qty: PropTypes.number,
      inbound_convey: PropTypes.string,
    })),
  }
  msg = key => formatMsg(this.props.intl, key);
  handleCancel = () => {
    this.props.closeApplyPackingRuleModal();
  }

  render() {
    const { packings } = this.props;
    return (
      <Modal maskClosable={false} title="采用包装规则" onCancel={this.handleCancel} visible={this.props.visible}>
        <FormItem label={this.msg('packingCode')}>
          <Select showSearch placeholder="选择包装代码" style={{ width: '100%' }}
            onSelect={this.handlePackingSelect}
          >
            {packings.map(pack => <Option value={pack.code}>{pack.code} | {pack.desc}</Option>)}
          </Select>
        </FormItem>
      </Modal>
    );
  }
}
