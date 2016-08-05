import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Form, Modal, message } from 'antd';
import Table from 'client/components/remoteAntTable';
import RegionCascader from 'client/components/region-cascade';
import { submitRateSource, loadRatesSources, updateRateSource,
  delRateSource, loadRateEnds, loadTariff } from 'common/reducers/transportTariff';
import { getRowKey, renderRegion, RowClick } from './commodity';

const FormItem = Form.Item;

@connect(
  state => ({
    tariffId: state.transportTariff.tariffId,
    rateId: state.transportTariff.rateId,
    loading: state.transportTariff.ratesSourceLoading,
    ratesSourceList: state.transportTariff.ratesSourceList,
  }),
  { submitRateSource, loadRatesSources, updateRateSource,
    delRateSource, loadRateEnds, loadTariff }
)
@Form.create()
export default class RateSourceTable extends React.Component {
  static propTypes = {
    visibleModal: PropTypes.bool.isRequired,
    tariffId: PropTypes.string.isRequired,
    ratesSourceList: PropTypes.object.isRequired,
    loading: PropTypes.bool.isRequired,
    form: PropTypes.object.isRequired,
    onChangeVisible: PropTypes.func.isRequired,
    submitRateSource: PropTypes.func.isRequired,
    loadRatesSources: PropTypes.func.isRequired,
    updateRateSource: PropTypes.func.isRequired,
    delRateSource: PropTypes.func.isRequired,
    loadRateEnds: PropTypes.func.isRequired,
    loadTariff: PropTypes.func.isRequired,
  }
  state = {
    selectedRowKeys: [],
    regionCode: null,
    rateId: null,
    modalRegion: [],
  }
  componentWillMount() {
    if (this.props.rateId) {
      this.setState({ selectedRowKeys: [this.props.rateId] });
    }
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.rateId !== this.props.rateId) {
      this.setState({ selectedRowKeys: [nextProps.rateId] });
    }
  }
  dataSource = new Table.DataSource({
    fetcher: params => this.props.loadRatesSources(params),
    resolve: result => result.data,
    getPagination: (result, resolve) => ({
      total: result.totalCount,
      current: resolve(result.totalCount, result.current, result.pageSize),
      showSizeChanger: true,
      showQuickJumper: false,
      pageSize: result.pageSize,
    }),
    getParams: (pagination) => {
      const params = {
        tariffId: this.props.tariffId,
        pageSize: pagination.pageSize,
        currentPage: pagination.current,
        filters: this.props.filters,
      };
      params.filters = JSON.stringify(params.filters);
      return params;
    },
    remotes: this.props.ratesSourceList,
  })
  columns = [{
    title: '起始地',
    dataIndex: 'source',
    width: 200,
    render: (o, record) => renderRegion(record.source),
  }, {
    title: '操作',
    width: 130,
    render: (o, record) => {
      return (
        <span>
          <RowClick text="编辑" onHit={this.handleEdit} row={record} />
          <span className="ant-divider" />
          <RowClick text="删除" onHit={this.handleDel} row={record} />
        </span>
      );
    },
  }]
  loadSources = (pageSize, current) => {
    return this.props.loadRatesSources({
      tariffId: this.props.tariffId,
      pageSize,
      currentPage: current,
      filters: JSON.stringify(this.props.filters),
    });
  }
  handleEdit = (row, ev) => {
    ev.stopPropagation();
    const { code, province, city, district, street } = row.source;
    this.setState({
      rateId: row._id,
      regionCode: code,
      modalRegion: [province, city, district, street],
    });
    this.props.onChangeVisible('source', true);
  }
  handleDel = (row) => {
    this.props.delRateSource(row._id).then(result => {
      if (result.error) {
        message.error(result.error.message);
      } else {
        let current = this.props.ratesSourceList.current;
        if (current > 1 &&
            this.props.ratesSourceList.pageSize * (current - 1)
            === this.props.ratesSourceList.totalCount - 1) {
          current -= 1;
        }
        this.loadSources(this.props.ratesSourceList.pageSize, current);
      }
    });
  }
  handleSourceSave = () => {
    if (this.state.regionCode) {
      let prom;
      if (this.state.rateId) {
        prom = this.props.updateRateSource(
            this.state.rateId,
            this.state.regionCode,
            this.state.modalRegion);
      } else {
        prom = this.props.submitRateSource(
            this.props.tariffId,
            this.state.regionCode,
            this.state.modalRegion);
      }
      prom.then(result => {
        if (result.error) {
          message.error(result.error.message);
        } else {
          message.success('保存成功');
          let current = this.props.ratesSourceList.current;
          if (this.props.ratesSourceList.pageSize * current
              < this.props.ratesSourceList.totalCount + 1) {
            current += 1;
          }
          this.loadSources(this.props.ratesSourceList.pageSize, current)
            .then(() => {
              this.setState({
                regionCode: null,
                modalRegion: [],
                rateId: null,
              });
              this.props.onChangeVisible('source', false);
            });
        }
      });
    } else {
      message.error('未选择起始地址');
    }
  }
  handleCancel = () => {
    this.loadSources(10, 1);
    this.props.loadTariff(this.props.tariffId);
    this.props.onChangeVisible('source', false);
    this.setState({
      regionCode: null,
      modalRegion: [],
      rateId: null,
    });
  }
  handleRegionChange = (region) => {
    const [code, province, city, district, street] = region;
    this.setState({
      regionCode: code,
      modalRegion: [province, city, district, street],
    });
  }
  handleRowClick = (row) => {
    this.props.loadRateEnds({
      rateId: row._id,
      pageSize: 10,
      current: 1,
    }).then(result => {
      if (result.error) {
        message.error(result.error.message);
      }
    });
  }
  render() {
    const { ratesSourceList, loading, visibleModal, form } = this.props;
    const { modalRegion } = this.state;
    this.dataSource.remotes = ratesSourceList;
    const rowSelection = {
      type: 'radio',
      selectedRowKeys: this.state.selectedRowKeys,
      /*
      onChange: selectedRowKeys => {
        this.setState({ selectedRowKeys });
      },
      */
    };
    return (
      <div>
        <Table rowSelection={rowSelection} columns={this.columns} loading={loading}
          dataSource={this.dataSource} onRowClick={this.handleRowClick} rowKey={getRowKey}
        />
        <Modal visible={visibleModal} onOk={this.handleSourceSave} onCancel={this.handleCancel}
          closable={false}
        >
          <Form horizontal form={form}>
            <FormItem label="起始地" labelCol={{ span: 4 }} wrapperCol={{ span: 16 }} required>
              <RegionCascader region={modalRegion} onChange={this.handleRegionChange} />
            </FormItem>
          </Form>
        </Modal>
      </div>
    );
  }
}
