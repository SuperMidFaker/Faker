import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Card, Col, Button } from 'antd';
import RateSourceTable from './rateSourceTable';
import RateEndTable from './rateEndTable';

@connect(
  state => ({
    rateId: state.transportTariff.rateId,
  })
)
export default class TariffRatesForm extends React.Component {
  static propTypes = {
    rateId: PropTypes.string,
  }
  state = {
    sourceModal: false,
    endModal: false,
  }
  handleSourceAdd = () => {
    this.setState({ sourceModal: true });
  }
  handleEndAdd = () => {
    this.setState({ endModal: true });
  }
  handleVisibleChange = (type, visible) => {
    if (type === 'source') {
      this.setState({ sourceModal: visible });
    } else if (type === 'end') {
      this.setState({ endModal: visible });
    }
  }
  render() {
    const { sourceModal, endModal } = this.state;
    return (
      <div className="panel-body body-responsive">
        <Col sm={8} style={{ padding: 8 }}>
          <Card>
            <div style={{ padding: '0 8px 8px' }}>
              <Button type="primary" size="large" icon="plus-circle-o"
                onClick={this.handleSourceAdd}
              >
                添加
              </Button>
            </div>
            <RateSourceTable visibleModal={sourceModal} onChangeVisible={this.handleVisibleChange} />
          </Card>
        </Col>
        <Col sm={16} style={{ padding: 8 }}>
          <Card>
            <div style={{ padding: '0 8px 8px' }}>
              <Button type="primary" size="large" icon="plus-circle-o"
                onClick={this.handleEndAdd} disabled={!this.props.rateId}
              >
                添加
              </Button>
            </div>
            {
              this.props.rateId &&
              <RateEndTable visibleModal={endModal} onChangeVisible={this.handleVisibleChange} />
            }
          </Card>
        </Col>
      </div>
    );
  }
}
