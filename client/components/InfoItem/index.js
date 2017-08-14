import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Dropdown, Icon, Col, Row, Input } from 'antd';
import classNames from 'classnames';
import EditableCell from '../EditableCell';

function getColCls(col) {
  if (col) {
    const { span, offset } = col;
    const spanCls = span ? `col-${span}` : '';
    const offsetCls = offset ? `col-offset-${offset}` : '';
    return `${spanCls} ${offsetCls}`;
  }
  return '';
}

export default class InfoItem extends PureComponent {
  static defaultProps = {
    prefixCls: 'info-item',
    colon: true,
    type: 'text',
  };

  static propTypes = {
    label: PropTypes.string,
    field: PropTypes.any,
    dataIndex: PropTypes.string,
    overlay: PropTypes.object,
    labelCol: PropTypes.object,
    fieldCol: PropTypes.object,
    addonBefore: PropTypes.node,
    addonAfter: PropTypes.node,
    editable: PropTypes.bool,
    type: PropTypes.string,
    size: PropTypes.oneOf(['small', 'large']),
    placeholder: PropTypes.string,
    onEdit: PropTypes.func,
    action: PropTypes.node,
    options: PropTypes.array,
  }
  renderLabel() {
    const { prefixCls, label, labelCol, colon } = this.props;
    const labelCls = `${prefixCls}-label ${getColCls(labelCol)}`;

    let labelChildren = label;
    // Remove duplicated user input colon
    if (label && colon) {
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
          <Input.TextArea autosize defaultValue={value} />
        );
      default:
        return (
          <Input defaultValue={value} />
        );
    }
  }
  renderField() {
    const { type, field, dataIndex, placeholder, editable, overlay, onEdit, options } = this.props;
    if (editable) {
      if (type === 'dropdown') {
        return (<span>{this.renderAddonBefore()}
          <Dropdown overlay={overlay} trigger={['click']}>
            <span>
              {field || placeholder } <Icon type="down" />
            </span>
          </Dropdown>
          {this.renderAddonAfter()}
        </span>);
      }
      return (<EditableCell cellTrigger type={type} value={field} field={dataIndex} options={options} addonBefore={this.renderAddonBefore()} addonAfter={this.renderAddonAfter()} placeholder={placeholder} onSave={onEdit} />);
    }
    return <span>{this.renderAddonBefore()}{field}{this.renderAddonAfter()}</span>;
  }
  renderAddonBefore() {
    const { prefixCls, addonBefore } = this.props;
    return addonBefore ? (<span className={`${prefixCls}-addon-before`}>{addonBefore}</span>) : null;
  }
  renderAddonAfter() {
    const { prefixCls, field, addonAfter } = this.props;
    return ((field && (field.length > 0 || field !== 0)) && addonAfter) ? (<span className={`${prefixCls}-addon-after`}>{addonAfter}</span>) : null;
  }

  render() {
    const { prefixCls, size = '', fieldCol, action } = this.props;
    const sizeCls = ({
      large: 'lg',
      small: 'sm',
    })[size] || '';
    const fieldCls = `${prefixCls}-field ${getColCls(fieldCol)}`;
    const classes = classNames(prefixCls, {
      [`${prefixCls}-${sizeCls}`]: sizeCls,
    });
    return (
      <div className={classes}>
        {this.renderLabel()}
        <Row type="flex">
          <Col className={`col-flex-primary ${fieldCls}`}>{this.renderField()}</Col>
          {action &&
          <Col className="col-flex-secondary">
            {action}
          </Col>}
        </Row>
      </div>
    );
  }
}
