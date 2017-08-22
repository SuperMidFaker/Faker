import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { Button, Popover, Card, Col, Row, Input } from 'antd';
import InfoItem from 'client/components/InfoItem';

export default class ActivityEditCard extends React.Component {
  static propTypes = {
    title: PropTypes.string.isRequired,
    leftLabel: PropTypes.string.isRequired,
    leftValue: PropTypes.string.isRequired,
    rightLabel: PropTypes.string.isRequired,
    rightValue: PropTypes.string.isRequired,
    createdDate: PropTypes.string.isRequired,
    field: PropTypes.string,
    onSave: PropTypes.func.isRequired,
  }
  state = {
    is_editing: false,
    edit_value: this.props.rightValue,
  }
  handleEdit = () => {
    this.setState({ is_editing: true });
  }
  handleValueChange = (ev) => {
    const value = ev.target.value;
    this.setState({ edit_value: value });
  }
  handleCancel = () => {
    this.setState({ is_editing: false });
  }
  handleSave = () => {
    this.setState({ is_editing: false });
    if (this.state.edit_value !== this.props.rightValue) {
      this.props.onSave({ field: this.props.field, value: this.state.edit_value });
    }
  }
  handleDel = () => {
    this.props.onSave({ field: this.props.field, value: null });
  }
  render() {
    const { title, leftLabel, leftValue, rightLabel, rightValue, createdDate } = this.props;
    return (
      <Card title={<span>{title} <small className="timestamp">{moment(createdDate).format('YYYY-MM-DD HH:mm')}</small></span>} noHovering extra={
        <Popover trigger="click"
          content={<div><a onClick={this.handleEdit}>修改</a><span className="ant-divider" /><a className="mdc-text-red" onClick={this.handleDel}>删除</a></div>}
        >
          <Button type="ghost" shape="circle" size="small" icon="ellipsis" />
        </Popover>} bodyStyle={{ padding: 8 }}
      >
        <Row>
          <Col span={12}>
            <InfoItem label={leftLabel} field={leftValue} />
          </Col>
          <Col span={12}>
            {
              this.state.is_editing ?
              (
                <div className="welo-info-item">
                  <label className="info-label" htmlFor="pane">{rightLabel}：</label>
                  <Row>
                    <Col span={14}><Input onChange={this.handleValueChange} value={this.state.edit_value} /></Col>
                    <Col span={6} style={{ paddingLeft: 8 }}>
                      <Button type="primary" onClick={this.handleSave}>保存</Button>
                    </Col>
                    <Col span={4}>
                      <Button onClick={this.handleCancel}>取消</Button>
                    </Col>
                  </Row>
                </div>) :
                <InfoItem label={rightLabel} field={rightValue} />
            }
          </Col>
        </Row>
      </Card>
    );
  }
}
