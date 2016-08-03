import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Form, Modal, message } from 'antd';
import Table from 'client/components/remoteAntTable';
import RegionCascader from 'client/components/region-cascade';
import { submitRateSource, loadRatesSources } from 'common/reducers/transportTariff';

const FormItem = Form.Item;

function renderRegion(region) {
  const rgs = [];
  if (region.province) {
    rgs.push(region.province);
  }
  if (region.city && (region.city.indexOf('市') !== 0 || region.city.indexOf('县') !== 0)) {
    rgs.push(region.city);
  }
  if (region.district) {
    rgs.push(region.district);
  }
  if (region.street) {
    rgs.push(region.street);
  }
  return rgs.join('-');
}
@connect(
  state => ({
    tariffId: state.transportTariff.tariffId,
    loading: state.transportTariff.ratesSourceLoading,
    ratesSourceList: state.transportTariff.ratesSourceList,
  }),
  { submitRateSource, loadRatesSources }
)
@Form.create()
export default class TariffRatesForm extends React.Component {
  static propTypes = {
    visibleModal: PropTypes.bool.isRequired,
    tariffId: PropTypes.string.isRequired,
    ratesSourceList: PropTypes.object.isRequired,
    loading: PropTypes.bool.isRequired,
    form: PropTypes.object.isRequired,
    onChangeVisible: PropTypes.func.isRequired,
    submitRateSource: PropTypes.func.isRequired,
    loadRatesSources: PropTypes.func.isRequired,
  }
  state = {
    selectedRowKeys: [],
    region_code: null,
    sourceId: null,
    modalRegion: [],
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
    render: (o, record) => renderRegion(record.source),
  }, {
    title: '操作',
    width: 130,
    render: () => {
      return (
        <span>
          <a role="button">编辑</a>
          <span className="ant-divider" />
          <a role="button">删除</a>
        </span>
      );
    },
  }]
  loadSources = (pageSize, current) => {
    this.props.loadRatesSources({
      tariffId: this.props.tariffId,
      pageSize,
      currentPage: current,
      filters: JSON.stringify(this.props.filters),
    });
  }
  handleSourceSave = () => {
    if (this.state.region_code) {
      this.props.submitRateSource(
        this.props.tariffId,
        this.state.region_code,
        this.state.modalRegion
      ).then(result => {
        if (result.error) {
          message.error(result.error.message);
        } else {
          message.success('创建成功');
          let current = this.props.ratesSourceList.current;
          if (this.props.ratesSourceList.pageSize * current
              < this.props.ratesSourceList.totalCount + 1) {
            current += 1;
          }
          this.loadSources(this.props.ratesSourceList.pageSize, current)
            .then(() => {
              this.setState({
                region_code: null,
                modalRegion: [],
                sourceId: null,
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
    this.props.onChangeVisible('source', false);
    this.setState({
      region_code: null,
      modalRegion: [],
      sourceId: null,
    });
  }
  handleRegionChange = (region) => {
    const [code, province, city, district, street] = region;
    this.setState({
      region_code: code,
      modalRegion: [province, city, district, street],
    });
  }
  render() {
    const { ratesSourceList, loading, visibleModal, form } = this.props;
    const { modalRegion } = this.state;
    this.dataSource.remotes = ratesSourceList;
    const rowSelection = {
      selectedRowKeys: this.state.selectedRowKeys,
      onChange: selectedRowKeys => {
        this.setState({ selectedRowKeys });
      },
    };
    return (
      <div>
        <Table rowSelection={rowSelection} columns={this.columns} loading={loading}
          dataSource={this.dataSource}
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
