import React from 'react';
import { connect } from 'react-redux';
// import PropTypes from 'prop-types';
import { intlShape, injectIntl } from 'react-intl';
import { Input } from 'antd';
import DataPane from 'client/components/DataPane';

const Search = Input.Search;

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
  }),
  { }
)
export default class ImpGoodsPane extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
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
    /*
    this.setState({ loading: true });
    this.props.loadShipDetails(this.props.outboundNo).then(() => {
      this.setState({ loading: false });
    });
    */
  }
  handleSearch = (value) => {
    this.setState({ searchValue: value });
  }
  columns = [{
    title: '序号',
    dataIndex: 'em_g_no',
    width: 150,
  }, {
    title: '商品编码',
    dataIndex: 'code_s',
    width: 150,
  }, {
    title: '附加编码',
    dataIndex: 'code_t',
    width: 150,
  }, {
    title: '商品名称',
    dataIndex: 'g_name',
    width: 160,
  }, {
    title: '规格型号',
    dataIndex: 'g_model',
    width: 100,
  }, {
    title: '计量单位',
    dataIndex: 'g_unit',
    width: 150,
  }, {
    title: '法定计量单位',
    dataIndex: 'unit_1',
    width: 100,
  }, {
    title: '申报数量',
    dataIndex: 'dec_qty',
  }, {
    title: '申报单价',
    dataIndex: 'dec_price',
    width: 150,
  }, {
    title: '申报总价',
    dataIndex: 'dec_amount',
    width: 100,
  }, {
    title: '币制',
    dataIndex: 'currency',
  }, {
    title: '产销国',
    width: 100,
    dataIndex: 'country',
  }, {
    title: '征免方式',
    width: 100,
    dataIndex: 'duty_mode',
  }, {
    title: '征税比例',
    width: 100,
    dataIndex: 'duty_rate',
  }, {
    title: '备注',
    width: 100,
    dataIndex: 'remark',
  }]
  render() {
    // const { shipDetails } = this.props;
    const rowSelection = {
      selectedRowKeys: this.state.selectedRowKeys,
      onChange: (selectedRowKeys) => {
        this.setState({ selectedRowKeys });
      },
    };
    return (
      <DataPane fullscreen={this.props.fullscreen}
        columns={this.columns} rowSelection={rowSelection} indentSize={0}
        dataSource={null} rowKey="id" loading={this.state.loading}
      >
        <DataPane.Toolbar>
          <Search size="large" placeholder="商品编码" style={{ width: 200 }} onSearch={this.handleSearch} />
        </DataPane.Toolbar>
      </DataPane>
    );
  }
}
