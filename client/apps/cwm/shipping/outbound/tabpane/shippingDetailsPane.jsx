import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import moment from 'moment';
import FileSaver from 'file-saver';
// import { intlShape, injectIntl } from 'react-intl';
import { notification, Button, Tag, Icon } from 'antd';
import DataPane from 'client/components/DataPane';
import SearchBox from 'client/components/SearchBox';
import { loadShipDetails, exportNormalExitBySo } from 'common/reducers/cwmOutbound';

// @injectIntl
@connect(
  state => ({
    reload: state.cwmOutbound.outboundReload,
    outboundHead: state.cwmOutbound.outboundFormHead,
    shipDetails: state.cwmOutbound.shipDetails,
  }),
  { loadShipDetails, exportNormalExitBySo }
)
export default class ShippingDetailsPane extends React.Component {
  static propTypes = {
    // intl: intlShape.isRequired,
    outboundNo: PropTypes.string.isRequired,
  }
  state = {
    searchValue: '',
    loading: false,
  }
  componentWillMount() {
    this.handleLoad();
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.reload) {
      this.handleLoad();
    }
  }
  handleLoad = () => {
    this.setState({ loading: true });
    this.props.loadShipDetails(this.props.outboundNo).then(() => {
      this.setState({ loading: false });
    });
  }
  handleSearch = (value) => {
    this.setState({ searchValue: value });
  }
  handleExportExitVoucher = () => {
    this.props.exportNormalExitBySo(this.props.outboundHead.so_no).then((resp) => {
      if (!resp.error) {
        FileSaver.saveAs(
          new window.Blob([Buffer.from(resp.data)], { type: 'application/octet-stream' }),
          `${this.props.outboundHead.so_no}_出区凭单.xlsx`
        );
      } else {
        notification.error({
          message: '导出失败',
          description: resp.error.message,
        });
      }
    });
  }
  columns = [{
    title: '装车/配送单号',
    dataIndex: 'waybill',
    width: 150,
  }, {
    title: '托盘编号',
    dataIndex: 'drop_id',
    width: 150,
  }, {
    title: '箱号',
    dataIndex: 'packed_no',
    width: 150,
  }, {
    title: '商品货号',
    dataIndex: 'product_no',
    width: 200,
  }, {
    title: '发货数量',
    dataIndex: 'shipped_qty',
    width: 100,
  }, {
    title: '中文品名',
    dataIndex: 'name',
    width: 150,
  }, {
    title: '批次号',
    dataIndex: 'external_lot_no',
    width: 100,
  }, {
    title: '库别',
    dataIndex: 'virtual_whse',
    width: 100,
    render: (o) => {
      if (o) {
        return <Tag>{o}</Tag>;
      }
      return null;
    },
  }, {
    title: '发货人员',
    width: 100,
    dataIndex: 'shipped_by',
    render: (o) => {
      if (o) {
        return (<div><Icon type="user" />{o}</div>);
      }
      return null;
    },
  }, {
    title: '发货时间',
    width: 100,
    dataIndex: 'created_date',
    render: o => o && moment(o).format('MM.DD HH:mm'),
  }]
  render() {
    const { shipDetails } = this.props;
    const dataSource = shipDetails.filter((item) => {
      if (this.state.searchValue) {
        const reg = new RegExp(this.state.searchValue);
        return reg.test(item.product_no) || reg.test(item.product_sku);
      }
      return true;
    });
    const rowSelection = {
      selectedRowKeys: this.state.selectedRowKeys,
      onChange: (selectedRowKeys) => {
        this.setState({ selectedRowKeys });
      },
    };
    return (
      <DataPane
        columns={this.columns}
        rowSelection={rowSelection}
        indentSize={0}
        dataSource={dataSource}
        rowKey="id"
        loading={this.state.loading}
      >
        <DataPane.Toolbar>
          <SearchBox placeholder="货号/SKU" onSearch={this.handleSearch} />
          <DataPane.Actions>
            {shipDetails.length > 0 &&
            shipDetails.filter(pd => !pd.bonded && pd.ftz_ent_filed_id).length > 0 &&
            <Button type="primary" onClick={this.handleExportExitVoucher}>导出出区凭单</Button>}
          </DataPane.Actions>
        </DataPane.Toolbar>
      </DataPane>
    );
  }
}
