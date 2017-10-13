import React, { Component } from 'react';
import { connect } from 'react-redux';
import moment from 'moment';
import { Modal, Table } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import { format } from 'client/common/i18n/helpers';
import messages from '../../message.i18n';
import { hideAsnSelectModal } from 'common/reducers/cwmShippingOrder';
import { getCrossAsns, addTemporary, clearTemporary, getAsnDetails } from 'common/reducers/cwmReceive';

const formatMsg = format(messages);

@injectIntl
@connect(
  state => ({
    visible: state.cwmShippingOrder.asnSelectModal.visible,
    whseCode: state.cwmContext.defaultWhse.code,
    tenantId: state.account.tenantId,
  }),
  { getCrossAsns, hideAsnSelectModal, addTemporary, clearTemporary, getAsnDetails }
)
export default class AddDetailModal extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
  }
  state = {
    dataSource: [],
  }
  componentWillMount() {
    this.props.getCrossAsns(this.props.whseCode, this.props.tenantId).then((result) => {
      if (!result.error) {
        this.setState({
          dataSource: result.data,
        });
      }
    });
  }
  msg = key => formatMsg(this.props.intl, key)
  handleCancel = () => {
    this.props.hideAsnSelectModal();
  }
  handleRowClick = (record) => {
    this.handleCancel();
    this.props.getAsnDetails(record.asn_no).then((result) => {
      if (!result.error) {
        this.props.clearTemporary();
        this.props.addTemporary(result.data);
      }
    });
  }
  render() {
    const { visible } = this.props;
    const { dataSource } = this.state;
    const columns = [{
      title: 'asnNo',
      dataIndex: 'asn_no',
    }, {
      title: '入库日期',
      dataIndex: 'received_date',
      render: o => moment(o).format('YYYY-MM-DD'),
    }];
    return (
      <Modal onCancel={this.handleCancel} visible={visible} title="asnList" onOk={this.handleCancel}>
        <Table columns={columns} dataSource={dataSource} rowKey="asn_no" onRowClick={record => this.handleRowClick(record)} />
      </Modal>
    );
  }
}
