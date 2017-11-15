import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import moment from 'moment';
import { intlShape, injectIntl } from 'react-intl';
import { Tag, Icon, Input } from 'antd';
import DataPane from 'client/components/DataPane';
import { loadShipDetails } from 'common/reducers/cwmOutbound';

const Search = Input.Search;

@injectIntl
@connect(
  state => ({
    reload: state.cwmOutbound.outboundReload,
    shipDetails: state.cwmOutbound.shipDetails,
  }),
  { loadShipDetails }
)
export default class ShippingDetailsPane extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
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
    width: 160,
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
    render: (o) => {
      if (o) {
        return <Tag>{o}</Tag>;
      }
    },
  }, {
    title: '发货人员',
    width: 100,
    dataIndex: 'shipped_by',
    render: (o) => {
      if (o) {
        return (<div><Icon type="user" />{o}</div>);
      }
    },
  }, {
    title: '发货时间',
    width: 100,
    dataIndex: 'created_date',
    render: (o) => {
      if (o) {
        return (<div>{moment(o).format('MM.DD HH:mm')}</div>);
      }
    },
  }]
  render() {
    const { shipDetails } = this.props;
    const dataSource = shipDetails.filter((item) => {
      if (this.state.searchValue) {
        const reg = new RegExp(this.state.searchValue);
        return reg.test(item.product_no) || reg.test(item.product_sku);
      } else {
        return true;
      }
    });
    const rowSelection = {
      selectedRowKeys: this.state.selectedRowKeys,
      onChange: (selectedRowKeys) => {
        this.setState({ selectedRowKeys });
      },
    };
    return (
      <DataPane fullscreen={this.props.fullscreen}
        columns={this.columns} rowSelection={rowSelection} indentSize={0}
        dataSource={dataSource} rowKey="id" loading={this.state.loading}
      >
        <DataPane.Toolbar>
          <Search placeholder="货号/SKU" style={{ width: 200 }} onSearch={this.handleSearch} />
        </DataPane.Toolbar>
      </DataPane>
    );
  }
}
