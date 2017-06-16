import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Button, Table } from 'antd';
import { openPackingRuleModal } from 'common/reducers/cwmSku';
import { format } from 'client/common/i18n/helpers';
import PackingRuleModal from '../modal/packingRuleModal';
import messages from '../../message.i18n';

const formatMsg = format(messages);

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    tenantName: state.account.tenantName,
  }),
  { openPackingRuleModal }
)
export default class PackingRulePane extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantName: PropTypes.string.isRequired,
    tenantId: PropTypes.number.isRequired,
  }
  state = {
    datas: [],
    brokers: [],
  };

  msg = (descriptor, values) => formatMsg(this.props.intl, descriptor, values)
  handleAddPackingRule = () => {
    this.props.openPackingRuleModal();
  }
  handleSave = () => {

  }
  handleDelete = () => {
  }

  render() {
    const columns = [{
      title: this.msg('packingCode'),
      dataIndex: 'packing_code',
      width: 120,
    }, {
      title: this.msg('desc'),
      dataIndex: 'desc',
    }];
    return (
      <div>
        <Table size="middle" pagination={false} columns={columns} dataSource={this.state.datas} rowKey="id"
          footer={() => <Button type="dashed" onClick={this.handleAddPackingRule} icon="plus" style={{ width: '100%' }}>{this.msg('add')}</Button>}
        />
        <PackingRuleModal />
      </div>
    );
  }
}
