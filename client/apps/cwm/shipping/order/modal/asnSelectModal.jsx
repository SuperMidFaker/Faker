import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import moment from 'moment';
import { Modal, message } from 'antd';
import DataTable from 'client/components/DataTable';
import SearchBox from 'client/components/SearchBox';
import { intlShape, injectIntl } from 'react-intl';
import { hideAsnSelectModal } from 'common/reducers/cwmShippingOrder';
import { getCrossAsns, addTemporary, clearTemporary, getCrossAsnDetails } from 'common/reducers/cwmReceive';
import { format } from 'client/common/i18n/helpers';
import messages from '../../message.i18n';

const formatMsg = format(messages);

@injectIntl
@connect(
  state => ({
    visible: state.cwmShippingOrder.asnSelectModal.visible,
    whseCode: state.cwmContext.defaultWhse.code,
  }),
  {
    getCrossAsns, hideAsnSelectModal, addTemporary, clearTemporary, getCrossAsnDetails,
  }
)
export default class AsnSelectModal extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    bonded: PropTypes.number.isRequired,
    soType: PropTypes.string,
  }
  state = {
    selectedRowKeys: [],
    dataSource: [],
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.visible && nextProps.visible !== this.props.visible) {
      this.props.getCrossAsns(
        this.props.whseCode, nextProps.bonded, nextProps.regType,
        nextProps.soType, nextProps.ownerPartnerId
      ).then((result) => {
        if (!result.error) {
          this.setState({
            dataSource: result.data,
          });
        }
      });
    }
  }
  msg = key => formatMsg(this.props.intl, key)
  handleCancel = () => {
    this.props.hideAsnSelectModal();
  }
  handleSearch = (searchVal) => {
    const {
      whseCode, bonded, regType, soType, ownerPartnerId,
    } = this.props;
    this.props.getCrossAsns(
      whseCode, bonded, regType,
      soType, ownerPartnerId, searchVal
    ).then((result) => {
      if (!result.error) {
        this.setState({
          searchVal,
          dataSource: result.data,
        });
      }
    });
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
    const { dataSource, searchVal } = this.state;
    const columns = [{
      title: '客户单号',
      dataIndex: 'po_no',
    }, {
      title: 'ASN',
      dataIndex: 'asn_no',
      width: 200,
    }, {
      title: '入库日期',
      dataIndex: 'received_date',
      width: 100,
      render: o => o && moment(o).format('YYYY-MM-DD'),
    }];
    const toolbarActions = (
      <SearchBox placeholder="客户单号" onSearch={this.handleSearch} value={searchVal} />
    );
    return (
      <Modal
        width={700}
        maskClosable={false}
        onCancel={this.handleCancel}
        visible={visible}
        title="可选ASN列表"
        onOk={this.handleCrossAsnDetails}
      >
        <DataTable
          toolbarActions={toolbarActions}
          rowSelection={this.rowSelection}
          columns={columns}
          dataSource={dataSource}
          indentSize={0}
          rowKey="asn_no"
        />
      </Modal>
    );
  }
}
