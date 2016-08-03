import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Form, Modal, message } from 'antd';
import Table from 'client/components/remoteAntTable';
import RegionCascader from 'client/components/region-cascade';

const FormItem = Form.Item;
@connect(
  state => ({
    tariffId: state.transportTariff.tariffId,
    loading: state.transportTariff.ratesEndLoading,
    ratesEndList: state.transportTariff.ratesEndList,
  })
)
@Form.create()
export default class TariffRatesForm extends React.Component {
  static propTypes = {
    visibleModal: PropTypes.bool.isRequired,
    tariffId: PropTypes.string.isRequired,
    ratesEndList: PropTypes.object.isRequired,
    loading: PropTypes.bool.isRequired,
    form: PropTypes.object.isRequired,
    onChangeVisible: PropTypes.func.isRequired,
  }
  state = {
    selectedRowKeys: [],
    visible: false,
  }
  dataSource = new Table.DataSource({
    fetcher: params => this.props.loadRatesSources(null, params),
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
    remotes: this.props.tarifflist,
  })
  columns = [{
    title: '目的地',
    dataIndex: 'source',
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
  handleSave = () => {
    message.success('保存成功');
  }
  handleCancel = () => {
    this.props.onChangeVisible('end', false);
  }
  render() {
    const { ratesEndList, loading, visibleModal, form } = this.props;
    this.dataSource.remotes = ratesEndList;
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
        <Modal visible={visibleModal} onOk={this.handleSave} onCancel={this.handleCancel}>
          <Form horizontal form={form}>
            <FormItem label="目的地" labelCol={{ span: 8 }} wrapperCol={{ span: 16 }}>
              <RegionCascader />
            </FormItem>
          </Form>
        </Modal>
      </div>
    );
  }
}
