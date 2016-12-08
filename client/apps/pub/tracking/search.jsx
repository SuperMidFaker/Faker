/* eslint no-undef: 0 */
import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Input, Button, Alert, Table, message } from 'antd';
import { searchShipment } from 'common/reducers/shipment';
import './index.less';

@connect(
  state => ({
    shipmtDetail: state.shipment.shipmtDetail,
    logo: state.corpDomain.logo,
    name: state.corpDomain.name,
  }),
  { searchShipment }
)
export default class TrackingSearch extends React.Component {
  static propTypes = {
    location: PropTypes.object.isRequired,
    searchShipment: PropTypes.func.isRequired,
    logo: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  state = {
    searchText: '',
    dataSource: [],
  }
  componentDidMount() {
    window.$('title').text('运单查询');
  }
  handleInputChange = (e) => {
    this.setState({ searchText: e.target.value });
  }

  handleSearch = () => {
    let subdomain = '';
    if (__DEV__) {
      subdomain = this.props.location.query.subdomain;
    } else {
      subdomain = window.location.hostname.split('.')[0];
    }
    if (/\s+/.test(this.state.searchText) || this.state.searchText === '') {
      message.error('请输入正确的运单号或客户单号');
    } else {
      this.props.searchShipment(this.state.searchText, subdomain).then((result) => {
        if (result.error) {
          message.error(result.error.message);
        } else if (result.data.length === 0) {
          message.info('运单不存在', 10);
        } else {
          this.setState({ dataSource: result.data });
          if (result.data.length === 1) {
            const shipment = result.data[0];
            window.open(`/pub/tms/tracking/detail/${shipment.shipmt_no}/${shipment.public_key}`);
          }
        }
      });
    }
  }
  renderColumn = (o, shipment) => (<a href={`/pub/tms/tracking/detail/${shipment.shipmt_no}/${shipment.public_key}`} target="_blank" rel="noopener noreferrer">{o}</a>)
  render() {
    const { logo, name } = this.props;
    const columns = [{
      title: '运单号',
      dataIndex: 'shipmt_no',
      render: this.renderColumn,
    }, {
      title: '客户单号',
      dataIndex: 'ref_external_no',
      render: this.renderColumn,
    }];
    return (
      <div className="main-content">
        <div className="page-body" style={{ padding: 64, marginBottom: 16 }}>
          <div className="tracking-form">
            <div className="tenant-info">
              <div className="tenant-logo " style={{ backgroundImage: `url("${logo || '/assets/img/home/tenant-logo.png'}")` }} />
              <h2 className="tenant-name">运单追踪</h2>
            </div>
            <center>
              <Input size="large" placeholder="请输入运单号或客户单号" value={this.state.searchText} style={{ height: '38px' }} onPressEnter={this.handleSearch}
                onChange={this.handleInputChange}
              />
              <Button type="primary" size="large" icon="search" style={{ height: '38px', width: '120px', marginTop: 24 }} onClick={this.handleSearch} >
              查询
              </Button>
              <div style={{ width: 400, marginTop: 96 }}>
                <Alert message="为了能够浏览追踪页面，请您设置允许浏览器弹出窗口" type="info" showIcon />
              </div>
              <div style={{ display: this.state.dataSource.length === 0 ? 'none' : '' }}>
                <Table columns={columns} dataSource={this.state.dataSource} pagination={false} size="small" />
              </div>
            </center>
          </div>
        </div>
        <div className="tenant-footer"><center>{name}</center></div>
      </div>
    );
  }
}
