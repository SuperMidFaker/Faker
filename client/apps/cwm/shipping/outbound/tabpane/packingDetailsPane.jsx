import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import moment from 'moment';
import { intlShape, injectIntl } from 'react-intl';
import { Tag, Icon } from 'antd';
import DataPane from 'client/components/DataPane';
import SearchBox from 'client/components/SearchBox';
import { loadPackDetails } from 'common/reducers/cwmOutbound';
import { formatMsg } from '../../message.i18n';

@injectIntl
@connect(
  state => ({
    reload: state.cwmOutbound.outboundReload,
    packDetails: state.cwmOutbound.packDetails,
  }),
  { loadPackDetails }
)
export default class PackingDetailsPane extends React.Component {
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
  msg = formatMsg(this.props.intl)
  handleLoad = () => {
    this.setState({ loading: true });
    this.props.loadPackDetails(this.props.outboundNo).then(() => {
      this.setState({ loading: false });
    });
  }
  handleSearch = (value) => {
    this.setState({ searchValue: value });
  }
  columns = [{
    title: '箱号',
    dataIndex: 'packed_no',
    width: 150,
  }, {
    title: '商品货号',
    dataIndex: 'product_no',
    width: 200,
  }, {
    title: '装箱数量',
    dataIndex: 'chkpacked_qty',
    width: 100,
  }, {
    title: '中文品名',
    dataIndex: 'name',
    width: 150,
  }, {
    title: '序列号',
    dataIndex: 'serial_no',
    width: 150,
  }, {
    title: '批次号',
    dataIndex: 'external_lot_no',
    width: 150,
  }, {
    title: '库别',
    dataIndex: 'virtual_whse',
    width: 150,
    render: o => o && <Tag>{o}</Tag>,
  }, {
    title: '复核装箱人员',
    width: 100,
    dataIndex: 'chkpacked_by',
    render: o => o && <div><Icon type="user" />{o}</div>,
  }, {
    title: '复核装箱时间',
    width: 100,
    dataIndex: 'chkpacked_date',
    render: o => o && moment(o).format('MM.DD HH:mm'),
  }]
  render() {
    const { packDetails } = this.props;
    const dataSource = packDetails.filter((item) => {
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
        </DataPane.Toolbar>
      </DataPane>
    );
  }
}
