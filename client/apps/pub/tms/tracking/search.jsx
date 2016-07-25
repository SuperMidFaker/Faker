/* eslint no-undef: 0 */
import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Input, Button, Col, message } from 'antd';
import { searchShipment } from 'common/reducers/shipment';
import '../index.less';

const InputGroup = Input.Group;

@connect(
  state => ({
    shipmtDetail: state.shipment.shipmtDetail,
  }),
  { searchShipment }
)
export default class TrackingSearch extends React.Component {
  static propTypes = {
    location: PropTypes.object.isRequired,
    searchShipment: PropTypes.func.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  state = {
    searchText: '',
  };
  componentDidMount() {
    window.$('title').text('运单查询');
  }
  handleInputChange = (e) => {
    this.setState({ searchText: e.target.value });
  }

  handleSearch = () => {
    this.props.searchShipment(this.state.searchText, this.props.location.query).then(result => {
      if (result.error) {
        message.error(result.error.message);
      } else if (result.data.length === 0) {
        message.info('运单不存在', 10);
      } else {
        const shipment = result.data[0];
        window.open(`/pub/tms/tracking/detail/${shipment.shipmt_no}/${shipment.public_key}`);
      }
    });
  }
  render() {
    return (
      <div className="panel-body">
        <div className="tmsSearch">
          <InputGroup>
            <Col span="18">
            <Input placeholder="请输入运单号" value={this.state.searchText} style={{ height: '38px' }} onPressEnter={this.handleSearch}
              onChange={this.handleInputChange}
            />
            </Col>
            <Col span="6">
              <Button type="primary" icon="search" style={{ height: '38px', width: '90px' }} onClick={this.handleSearch} >
                查询
              </Button>
            </Col>
          </InputGroup>
        </div>
      </div>
    );
  }
}
