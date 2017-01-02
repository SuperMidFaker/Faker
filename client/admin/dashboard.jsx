import React, { PropTypes } from 'react';
import { Card, Col, Row } from 'antd';

export default class Dashboard extends React.Component {
  static propTypes = {
    children: PropTypes.object,
  }
  render() {
    return (
      <div>
        <header className="top-bar">
          <h3>控制面板</h3>
        </header>
        <div className="main-content" key="main">
          <Row gutter={16}>
            <Col sm={12} lg={6}>
              <Card>
                hello
              </Card>
            </Col>
            <Col sm={12} lg={6}>
              <Card>
                hello
              </Card>
            </Col>
            <Col sm={12} lg={6}>
              <Card>
                hello
              </Card>
            </Col>
            <Col sm={12} lg={6}>
              <Card>
                hello
              </Card>
            </Col>
            <Col sm={24} lg={18}>
              <Card>
                hello
              </Card>
            </Col>
            <Col sm={24} lg={6}>
              <Card>
                hello
              </Card>
            </Col>
          </Row>
        </div>
      </div>
    );
  }
}
