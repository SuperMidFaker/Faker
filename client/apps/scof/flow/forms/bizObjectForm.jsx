/* eslint react/no-multi-comp: 0 */
import React, { Component, PropTypes } from 'react';
import { Collapse, Form, Card, Col, Row, Input, Tree } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import { format } from 'client/common/i18n/helpers';
import messages from '../../message.i18n';

const formatMsg = format(messages);
const FormItem = Form.Item;
const Panel = Collapse.Panel;
const TreeNode = Tree.TreeNode;

@injectIntl
export default class BizObjectForm extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    form: PropTypes.object.isRequired,
  }
  msg = key => formatMsg(this.props.intl, key);
  render() {
    const { form: { getFieldDecorator } } = this.props;
    return (
      <div>
        <Card title={this.msg('bizObject')} bodyStyle={{ padding: 0 }}>
          <Collapse bordered={false} defaultActiveKey={['properties', 'events']}>
            <Panel header={this.msg('properties')} key="properties">
              <Row gutter={16}>
                <Col sm={24} lg={24}>
                  <FormItem label={this.msg('asnNo')}>
                    {getFieldDecorator('asn_no', {
                    })(<Input />)}
                  </FormItem>
                </Col>
                <Col sm={24} lg={24}>
                  <FormItem label={this.msg('asnNo')}>
                    {getFieldDecorator('asn_no', {
                    })(<Input />)}
                  </FormItem>
                </Col>
                <Col sm={24} lg={24}>
                  <FormItem label={this.msg('asnNo')}>
                    {getFieldDecorator('asn_no', {
                    })(<Input />)}
                  </FormItem>
                </Col>
              </Row>
            </Panel>
            <Panel header={this.msg('events')} key="events">
              <Tree showLine>
                <TreeNode title={this.msg('onEntered')} key="0">
                  <TreeNode title="发送通知" key="0-0-0" />
                  <TreeNode title="parent 1-1" key="0-0-1" />
                </TreeNode>
                <TreeNode title={this.msg('onExited')} key="1">
                  <TreeNode title="parent 1-0" key="1-0-0" />
                  <TreeNode title="parent 1-1" key="1-0-1" />
                </TreeNode>
              </Tree>
            </Panel>
          </Collapse>
        </Card>
      </div>
    );
  }
}
