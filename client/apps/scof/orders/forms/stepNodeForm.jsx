import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { Carousel, Row, Col, Card, Button, Tooltip } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import messages from '../message.i18n';
import { format } from 'client/common/i18n/helpers';

const formatMsg = format(messages);

@injectIntl
@connect(
  state => ({
    formRequires: state.crmOrders.formRequires,
  }),
  { }
)

export default class StepNodeForm extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    index: PropTypes.number.isRequired,
    operation: PropTypes.oneOf(['view', 'edit', 'create']),
    formData: PropTypes.object.isRequired,
    formRequires: PropTypes.object.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }

  msg = key => formatMsg(this.props.intl, key)

  render() {
    return (
      <Row type="flex" className="flow-step">
        <Col span={22}>
          <Carousel>
            <div>
              <Card bodyStyle={{ height: 200 }}>
                1
              </Card>
              <Button type="dashed" onClick={this.handleAddRow} icon="plus-circle-o" style={{ width: '100%' }}>
                {this.msg('addSubsequentNode')}
              </Button>
            </div>
            <div>
              <Card bodyStyle={{ height: 200 }}>
                2
              </Card>
              <Button type="dashed" onClick={this.handleAddRow} icon="plus-circle-o" style={{ width: '100%' }} >
                {this.msg('addSubsequentNode')}
              </Button>
            </div>
          </Carousel>
        </Col>
        <Col span={2} style={{ paddingLeft: 16 }}>
          <Tooltip placement="right" title={this.msg('addParallelNode')}>
            <Button type="dashed" size="large" onClick={this.handleAddRow} icon="plus" style={{ width: '100%', height: '100%' }} />
          </Tooltip>
        </Col>
      </Row>
    );
  }
}
