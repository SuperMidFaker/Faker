import React, { Component } from 'react';
import { connect } from 'react-redux';
import moment from 'moment';
import { Modal, Table, message } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import { format } from 'client/common/i18n/helpers';
import messages from '../../message.i18n';
import { hideAsnSelectModal } from 'common/reducers/cwmShippingOrder';
import { getCrossAsns, addTemporary, clearTemporary, getCrossAsnDetails } from 'common/reducers/cwmReceive';

const formatMsg = format(messages);

@injectIntl
@connect(
  state => ({
    visible: state.cwmShippingOrder.asnSelectModal.visible,
    whseCode: state.cwmContext.defaultWhse.code,
    tenantId: state.account.tenantId,
  }),
  { getCrossAsns, hideAsnSelectModal, addTemporary, clearTemporary, getCrossAsnDetails }
)
export default class AddDetailModal extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
  }
  state = {
    selectedRowKeys: [],
    dataSource: [],
  }
  componentWillMount() {
    this.props.getCrossAsns(this.props.whseCode).then((result) => {
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
  handleCrossAsnDetails = () => {
    this.props.getCrossAsnDetails(this.state.selectedRowKeys).then((result) => {
      if (!result.error) {
        this.props.clearTemporary();
        this.props.addTemporary(result.data);
        this.handleCancel();
      } else {
        message.error(result.error.message);
      }
    });
  }
  rowSelection = {
    onChange: (selectedRowKeys) => {
      this.setState({ selectedRowKeys });
    },
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
      <Modal maskClosable={false} onCancel={this.handleCancel} visible={visible} title="越库列表"
        onOk={this.handleCrossAsnDetails}
      >
        <Table columns={columns} dataSource={dataSource} rowKey="asn_no" rowSelection={this.rowSelection} />
      </Modal>
    );
  }
}
