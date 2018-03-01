import React from 'react';
import PropTypes from 'prop-types';
import { Card, Spin, Row, Col } from 'antd';
import './index.less';

export default class ChartBody extends React.Component {
  static propTypes = {
    loading: PropTypes.bool.isRequired,
    barChartId: PropTypes.string.isRequired,
    pieChartId: PropTypes.string.isRequired,
  }
  render() {
    const { loading, barChartId, pieChartId } = this.props;
    return (
      <Row gutter={16}>
        <Col span={14}>
          <Spin spinning={loading}>
            <Card>
              <div id={barChartId} style={{ width: '100%', height: '450px' }} />
            </Card>
          </Spin>
        </Col>
        <Col span={10}>
          <Spin spinning={loading}>
            <Card>
              <div id={pieChartId} style={{ width: '100%', height: '450px' }} />
            </Card>
          </Spin>
        </Col>
      </Row>
    );
  }
}
