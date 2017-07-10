import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { intlShape, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { Modal, Table } from 'antd';
import { format } from 'client/common/i18n/helpers';
import { loadWaves, addToWave, hideAddToWave } from 'common/reducers/cwmShippingOrder';
import messages from '../../message.i18n';

const formatMsg = format(messages);
@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    defaultWhse: state.cwmContext.defaultWhse,
    loginId: state.account.loginId,
    filters: state.cwmShippingOrder.waveFilters,
    wave: state.cwmShippingOrder.wave,
    loading: state.cwmShippingOrder.wave.loading,
    visible: state.cwmShippingOrder.addToMoveModal.visible,
    ownerId: state.cwmShippingOrder.addToMoveModal.ownerId,
  }),
  { loadWaves, addToWave, hideAddToWave }
)
export default class AddToWaveModal extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    ownerId: PropTypes.string.isRequired,
    selectedRowKeys: PropTypes.array.isRequired,
    reload: PropTypes.func.isRequired,
  }
  state = {
    selectedRowKeys: [],
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.visible && nextProps.visible !== this.props.visible) {
      const { defaultWhse, ownerId, wave } = this.props;
      this.props.loadWaves({
        whseCode: defaultWhse.code,
        pageSize: wave.pageSize,
        current: wave.current,
        filters: { status: 'pending', ownerId },
      });
    }
  }
  msg = key => formatMsg(this.props.intl, key);
  columns = [{
    title: '波次号',
    dataIndex: 'wave_no',
  }]
  handleSubmit = () => {
    this.props.addToWave(this.props.selectedRowKeys, this.state.selectedRowKeys[0]).then((result) => {
      if (!result.error) {
        this.props.hideAddToWave();
        this.props.reload();
      }
    });
  }
  handleCancel = () => {
    this.props.hideAddToWave();
  }
  render() {
    const rowSelection = {
      type: 'radio',
      selectedRowKeys: this.state.selectedRowKeys,
      onChange: (selectedRowKeys) => {
        this.setState({ selectedRowKeys });
      },
    };
    const { wave, loading } = this.props;
    return (
      <Modal title="添加到波次计划" visible={this.props.visible} onOk={this.handleSubmit} onCancel={this.handleCancel}>
        <Table columns={this.columns} dataSource={wave.data} rowSelection={rowSelection} loading={loading} rowKey="wave_no" />
      </Modal>
    );
  }
}
