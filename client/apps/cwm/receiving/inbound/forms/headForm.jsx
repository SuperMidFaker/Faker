/* eslint react/no-multi-comp: 0 */
import React, { Component, PropTypes } from 'react';
import { Progress, Card, Col, Icon, Menu, Row, Tag } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import Avatar from 'react-avatar';
import InfoItem from 'client/components/InfoItem';
import { format } from 'client/common/i18n/helpers';
import messages from '../../message.i18n';

const formatMsg = format(messages);

@injectIntl
export default class HeadForm extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    form: PropTypes.object.isRequired,
  }
  msg = key => formatMsg(this.props.intl, key);
  columns = [{
    title: this.msg('seq'),
    width: 50,
  }, {
    title: this.msg('opColumn'),
    width: 80,
  }, {
    title: this.msg('sku'),
    dataIndex: 'sku',
    width: 300,
  }, {
    title: this.msg('unit'),
    width: 60,
    dataIndex: 'unit',
  }, {
    title: this.msg('qty'),
    width: 50,
    dataIndex: 'qty',
  }, {
    title: this.msg('remark'),
    dataIndex: 'remark',
  }]
  render() {
    return (
      <Card>
        <Row gutter={16}>
          <Col sm={24} lg={8}>
            <InfoItem label="入库单号" field="I096120170603223-01" />
          </Col>
          <Col sm={24} lg={4}>
            <InfoItem label="入库状态" field={<Tag color="blue">上架</Tag>} />
          </Col>
          <Col sm={24} lg={4}>
            <InfoItem label="预计箱数" addonBefore={<Icon type="inbox" />} field={10} />
          </Col>
          <Col sm={24} lg={4}>
            <InfoItem label="预计托盘数" addonBefore={<Icon type="appstore-o" />} field={2} />
          </Col>
          <Col sm={24} lg={4}>
            <InfoItem type="dropdown" label="操作人员" addonBefore={<Avatar name="未分配" size={28} round />}
              placeholder="分配操作人员" editable
              overlay={<Menu onClick={this.handleMenuClick}>
                <Menu.Item key={1}>仓管员</Menu.Item>
              </Menu>}
            />
          </Col>
          <Col sm={24} lg={24}>
            <Progress percent={50} status="active" />
          </Col>
        </Row>
      </Card>
    );
  }
}
