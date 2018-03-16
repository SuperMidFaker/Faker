/* eslint no-undef: 0 */
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import connectNav from 'client/common/decorators/connect-nav';
import { Input, Button, Card, Layout, message } from 'antd';
import { searchShipment } from 'common/reducers/shipment';
import './index.less';

const { Content } = Layout;

@connect(
  state => ({
    shipmtDetail: state.shipment.shipmtDetail,
    logo: state.corpDomain.logo,
    name: state.corpDomain.name,
  }),
  { searchShipment }
)
@connectNav({
  depth: 1,
  moduleName: 'transport',
})
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
    searchText: this.props.location.query.shipmtNo,
    dataSource: [],
  }
  componentDidMount() {
    // window.$('title').text('运单查询');
    const shipmtNo = this.props.location.query.shipmtNo;
    if (shipmtNo) {
      this.handleSearch();
    }
  }
  handleInputChange = (e) => {
    this.setState({ searchText: e.target.value });
  }

  handleSearch = () => {
    const searchText = this.state.searchText;
    let subdomain = '';
    if (__DEV__) {
      subdomain = this.props.location.query.subdomain;
    } else {
      subdomain = window.location.hostname.split('.')[0];
    }
    if (/\s+/.test(searchText) || searchText === '') {
      message.error('请输入正确的运单号或客户单号');
    } else {
      this.props.searchShipment(searchText, subdomain).then((result) => {
        if (result.error) {
          message.error(result.error.message, 10);
        } else if (result.data.length === 0) {
          message.info('运单不存在', 10);
        } else {
          this.setState({ dataSource: result.data, searchText });
          if (result.data.length === 1) {
            const shipment = result.data[0];
            this.context.router.push(`/pub/tms/tracking/detail/${shipment.shipmt_no}/${shipment.public_key}`);
            // window.open(`/pub/tms/tracking/detail/${shipment.shipmt_no}/${shipment.public_key}`);
          }
        }
      });
    }
  }
  renderColumn = (o, shipment) => (<a href={`/pub/tms/tracking/detail/${shipment.shipmt_no}/${shipment.public_key}`} target="_blank" rel="noopener noreferrer">{o}</a>)
  render() {
    const { name } = this.props;
    return (
      <Content className="main-content layout-fixed-width">
        <Card>
          <div className="tracking-form">
            <div className="tenant-info">
              <h2 className="tenant-name">运单追踪</h2>
            </div>
            <center>
              <Input
                placeholder="请输入运单号或客户单号"
                value={this.state.searchText}
                style={{ height: '38px' }}
                onPressEnter={this.handleSearch}
                onChange={this.handleInputChange}
              />
              <Button type="primary" icon="search" style={{ height: '38px', width: '120px', marginTop: 24 }} onClick={this.handleSearch} >
              查询
              </Button>
            </center>
          </div>
        </Card>
        <div className="tenant-footer"><center>{name}</center></div>
      </Content>
    );
  }
}
