import React from 'react';
import PropTypes from 'prop-types';
import { Card, Spin } from 'antd';
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
      <div>
        <div className="chart-left">
          <Spin spinning={loading}>
            <Card>
              <div id={barChartId} style={{ width: '100%', height: '450px' }} />
            </Card>
          </Spin>
        </div>
        <div className="chart-right">
          <Spin spinning={loading}>
            <Card>
              <div id={pieChartId} style={{ width: '100%', height: '450px' }} />
            </Card>
          </Spin>
        </div>
      </div>
    );
  }
}
