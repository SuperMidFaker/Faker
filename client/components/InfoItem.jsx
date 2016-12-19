import React, { PropTypes } from 'react';

function getColCls(col) {
  if (col) {
    const { span, offset } = col;
    const spanCls = span ? `col-${span}` : '';
    const offsetCls = offset ? `col-offset-${offset}` : '';
    return `${spanCls} ${offsetCls}`;
  }
  return '';
}

export default function InfoItem(props) {
  const { label, labelCol, field, fieldCol } = props;
  const labelCls = `info-label ${getColCls(labelCol)}`;
  const fieldCls = `info-data ${getColCls(fieldCol)}`;
  return (
    <div className="info-item">
      <label className={labelCls} htmlFor="pane">{label}：</label>
      <div className={fieldCls}>{field}</div>
    </div>
  );
}

InfoItem.propTypes = {
  label: PropTypes.string.isRequired,
  labelCol: PropTypes.object,
  fieldCol: PropTypes.object,
};
