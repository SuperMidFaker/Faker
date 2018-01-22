import React, { Component } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { intlShape, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { Modal } from 'antd';
import DataTable from 'client/components/DataTable';
import { format } from 'client/common/i18n/helpers';
import { loadWaves, addToWave, hideAddToWave } from 'common/reducers/cwmShippingOrder';
import messages from '../../message.i18n';

const formatMsg = format(messages);
@injectIntl
@connect(
  state => ({
    defaultWhse: state.cwmContext.defaultWhse,
    loginId: state.account.loginId,
    filters: state.cwmShippingOrder.waveFilters,
    wave: state.cwmShippingOrder.wave,
    loading: state.cwmShippingOrder.wave.loading,
    visible: state.cwmShippingOrder.addToMoveModal.visible,
    ownerCode: state.cwmShippingOrder.addToMoveModal.ownerCode,
  }),
  { loadWaves, addToWave, hideAddToWave }
)
export default class AddToWaveModal extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    selectedRowKeys: PropTypes.array.isRequired,
    reload: PropTypes.func.isRequired,
  }
  state = {
    selectedRowKeys: [],
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.visible && nextProps.visible !== this.props.visible) {
      const { defaultWhse, ownerCode, wave } = nextProps;
      this.props.loadWaves({
        whseCode: defaultWhse.code,
        pageSize: wave.pageSize,
        current: wave.current,
        filters: { status: 'pending', ownerCode },
      });
    }
  }
  msg = key => formatMsg(this.props.intl, key);
  columns = [{
    title: '波次号',
    dataIndex: 'wave_no',
  }, {
    title: '创建时间',
    width: 120,
    dataIndex: 'created_date',
    render: o => moment(o).format('MM.DD HH:mm'),
  }]
  dataSource = new DataTable.DataSource({
    fetcher: params => this.props.loadWaves(params),
    resolve: result => result.data,
    getPagination: (result, resolve) => ({
      total: result.totalCount,
      current: resolve(result.totalCount, result.current, result.pageSize),
      showSizeChanger: true,
      showQuickJumper: false,
      pageSize: result.pageSize,
      showTotal: total => `共 ${total} 条`,
    }),
    getParams: (pagination, tblfilters) => {
      const newfilters = { ...this.props.filters, ...tblfilters[0] };
      const params = {
        whseCode: this.props.defaultWhse.code,
        tenantId: this.props.tenantId,
        pageSize: pagination.pageSize,
        current: pagination.current,
        filters: newfilters,
      };
      return params;
    },
    remotes: this.props.wave,
  });
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
    this.dataSource.remotes = wave;
    return (
      <Modal maskClosable={false} title="添加到波次计划" visible={this.props.visible} onOk={this.handleSubmit} onCancel={this.handleCancel}>
        <DataTable size="middle" columns={this.columns} dataSource={this.dataSource} rowSelection={rowSelection} loading={loading} rowKey="wave_no" />
      </Modal>
    );
  }
}
