import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import moment from 'moment';
import { intlShape, injectIntl } from 'react-intl';
import { Table, Tag, Icon, Input } from 'antd';
import { loadPackDetails } from 'common/reducers/cwmOutbound';
import PackagePopover from '../../../common/popover/packagePopover';

const Search = Input.Search;

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
    outboundHead: PropTypes.object.isRequired,
    shippingMode: PropTypes.string.isRequired,
  }
  componentWillMount() {
    this.props.loadPackDetails(this.props.outboundNo);
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.reload) {
      this.props.loadPackDetails(this.props.outboundNo);
    }
  }
  columns = [{
    title: '箱号',
    dataIndex: 'packed_no',
    width: 150,
    fixed: 'left',
  }, {
    title: 'SKU',
    dataIndex: 'product_sku',
    width: 150,
    render: (o) => {
      if (o) {
        return <PackagePopover sku={o} />;
      }
    },
  }, {
    title: '批次号',
    dataIndex: 'external_lot_no',
    width: 100,
  }, {
    title: '装箱数量',
    dataIndex: 'chkpacked_qty',
    width: 200,
  }, {
    title: '商品货号',
    dataIndex: 'product_no',
    width: 150,
  }, {
    title: '中文品名',
    dataIndex: 'name',
    width: 150,

  }, {
    title: '库别',
    dataIndex: 'virtual_whse',
    width: 150,
    render: (o) => {
      if (o) {
        return <Tag>{o}</Tag>;
      }
    },
  }, {
    title: '复核装箱人员',
    width: 100,
    dataIndex: 'chkpacked_by',
    render: (o) => {
      if (o) {
        return (<div><Icon type="user" />{o}</div>);
      }
    },
  }, {
    title: '复核装箱时间',
    width: 100,
    dataIndex: 'created_date',
    render: (o) => {
      if (o) {
        return (<div>{moment(o).format('MM.DD HH:mm')}</div>);
      }
    },
  }]
  render() {
    const { packDetails } = this.props;
    return (
      <div className="table-fixed-layout">
        <div className="toolbar">
          <Search placeholder="货号/SKU" style={{ width: 200 }} onSearch={this.handleSearch} />
        </div>
        <Table columns={this.columns} indentSize={0} dataSource={packDetails} rowKey="id"
          scroll={{ x: this.columns.reduce((acc, cur) => acc + (cur.width ? cur.width : 200), 0) }}
        />
      </div>
    );
  }
}
