import React, { PropTypes } from 'react';
import { Dropdown, Icon, Col, Row, Input } from 'antd';
import EditableCell from './EditableCell';

function getColCls(col) {
  if (col) {
    const { span, offset } = col;
    const spanCls = span ? `col-${span}` : '';
    const offsetCls = offset ? `col-offset-${offset}` : '';
    return `${spanCls} ${offsetCls}`;
  }
  return '';
}

export default class InfoItem extends React.Component {
  static defaultProps = {
    prefixCls: 'info-item',
    colon: true,
    type: 'text',
  };

  static propTypes = {
    label: PropTypes.string.isRequired,
    field: PropTypes.any,
    overlay: PropTypes.object,
    labelCol: PropTypes.object,
    fieldCol: PropTypes.object,
    prefix: PropTypes.node,
    suffix: PropTypes.node,
    editable: PropTypes.bool,
    type: PropTypes.string,
    placeholder: PropTypes.string,
    onEdit: PropTypes.func,
  }
  renderLabel() {
    const { prefixCls, label, labelCol, colon } = this.props;
    const labelCls = `${prefixCls}-label ${getColCls(labelCol)}`;

    let labelChildren = label;
    // Remove duplicated user input colon
    if (colon) {
      labelChildren = label.replace(/[：|:]\s*$/, '');
    }

    return label ? (
      <Col {...labelCol} key="label" className={labelCls}>
        <label
          htmlFor="pane"
          title={typeof label === 'string' ? label : ''}
        >
          {labelChildren}
        </label>
      </Col>
    ) : null;
  }
  renderPopoverContent(value) {
    switch (this.props.type) {
      case 'textarea':
        return (
          <Input type="textarea" autosize defaultValue={value} />
        );
      default:
        return (
          <Input defaultValue={value} />
        );
    }
  }
  renderField() {
    const { type, field, placeholder, editable, overlay, onEdit } = this.props;
    if (editable) {
      if (type === 'dropdown') {
        return (<Dropdown overlay={overlay}>
          <a className="ant-dropdown-link">
            {(field && field.length > 0) ? field : placeholder } <Icon type="down" />
          </a>
        </Dropdown>);
      }
      return (<EditableCell type={type} value={field} placeholder={placeholder} onChange={onEdit} />);
    }
    return field;
  }
  renderPrefix() {
    const { prefixCls, prefix } = this.props;
    return prefix ? (<span className={`${prefixCls}-prefix`}>{prefix}</span>) : null;
  }
  renderSuffix() {
    const { prefixCls, field, suffix } = this.props;
    return (field && field.length > 0 && suffix) ? (<span className={`${prefixCls}-suffix`}>{suffix}</span>) : null;
  }

  render() {
    const { prefixCls, fieldCol } = this.props;
    const fieldCls = `${prefixCls}-field ${getColCls(fieldCol)}`;
    return (
      <Row className={prefixCls}>
        {this.renderLabel()}
        <div className={fieldCls}>{this.renderPrefix()}{this.renderField()}{this.renderSuffix()}</div>
      </Row>
    );
  }
}
