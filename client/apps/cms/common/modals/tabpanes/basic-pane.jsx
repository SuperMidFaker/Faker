import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Row, Col, Card } from 'antd';
import './pane.less';

let FILE = [];
function getColCls(col) {
  if (col) {
    const { span, offset } = col;
    const spanCls = span ? `col-${span}` : '';
    const offsetCls = offset ? `col-offset-${offset}` : '';
    return `${spanCls} ${offsetCls}`;
  }
  return '';
}
function PaneFormItem(props) {
  const { label, labelCol, field, fieldCol } = props;
  const labelCls = getColCls(labelCol);
  const fieldCls = `pane-field ${getColCls(fieldCol)}`;
  return (
    <div className="pane-form-item">
      <label className={labelCls} htmlFor="pane">{label}：</label>
      <div className={fieldCls}>{field}</div>
    </div>
  );
}
function getExtension(filename) {
  const parts = filename.split('.');
  return parts[parts.length - 1];
}

function fileSort(filename) {
  const ext = getExtension(filename);
  const type = ext.toLowerCase();
  if (type === 'doc' || type === 'pages' || type === 'docx') {
    FILE.push({ type: 'doc', name: filename });
  } else if (type === 'xls' || type === 'numbers') {
    FILE.push({ type: 'xls', name: filename });
  } else if (type === 'zip' || type === 'rar') {
    FILE.push({ type: 'zip', name: filename });
  } else {
    FILE.push({ type: 'pdf', name: filename });
  }
}

PaneFormItem.propTypes = {
  label: PropTypes.string.isRequired,
  labelCol: PropTypes.object,
  fieldCol: PropTypes.object,
};
@injectIntl
@connect(
  state => ({
    aspect: state.account.aspect,
    delegation: state.cmsDelegation.previewer.delegation,
    files: state.cmsDelegation.previewer.files,
    delegateTracking: state.cmsDelegation.previewer.delegateTracking,
  })
)
export default class BasicPane extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    aspect: PropTypes.number.isRequired,
    delegation: PropTypes.object.isRequired,
    files: PropTypes.array.isRequired,
    delegateTracking: PropTypes.object.isRequired,
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.files.length !== this.props.files.length) {
      FILE = [];
      nextProps.files.forEach((fl) => {
        fileSort(fl.name);
      });
    }
  }
  render() {
    const { delegation, delegateTracking } = this.props;
    let img = '';
    const filenames = FILE.map((fl, index) => {
      if (fl.type === 'doc') {
        img = 'word.png';
      }
      if (fl.type === 'xls') {
        img = 'excl.png';
      }
      if (fl.type === 'zip') {
        img = 'zip.png';
      }
      if (fl.type === 'pdf') {
        img = 'pdf.png';
      }
      return (
        <div key={index} className="filebox">
          <img id="img" role="presentation"
            src={`${__CDN__}/assets/img/${img}`}
          />{fl.name}
        </div>
      );
    });
    return (
      <div className="pane-content tab-pane">
        <Card bodyStyle={{ padding: 16 }}>
          <Row>
            <Col span="12">
              <PaneFormItem labelCol={{ span: 3 }} label="委托方"
                field={delegation.customer_name} fieldCol={{ span: 9 }}
              />
            </Col>
            <Col span="12">
              <PaneFormItem labelCol={{ span: 3 }} label="申报单位"
                field={delegateTracking.recv_name} fieldCol={{ span: 9 }}
              />
            </Col>
          </Row>
          <Row>
            <Col span="12">
              <PaneFormItem labelCol={{ span: 3 }} label="提运单号"
                field={delegation.bl_wb_no} fieldCol={{ span: 9 }}
              />
            </Col>
            <Col span="12">
              <PaneFormItem labelCol={{ span: 3 }} label="运单号"
                field={delegation.shipping_no} fieldCol={{ span: 9 }}
              />
            </Col>
          </Row>
          <Row>
            <Col span="12">
              <PaneFormItem labelCol={{ span: 3 }} label="发票号"
                field={delegation.invoice_no} fieldCol={{ span: 9 }}
              />
            </Col>
            <Col span="12">
              <PaneFormItem labelCol={{ span: 3 }} label="订单号"
                field={delegation.order_no} fieldCol={{ span: 9 }}
              />
            </Col>
          </Row>
          <Row>
            <Col span="12">
              <PaneFormItem labelCol={{ span: 3 }} label="船名航次"
                field={delegation.voyage_no} fieldCol={{ span: 9 }}
              />
            </Col>

            <Col span="12">
              <PaneFormItem labelCol={{ span: 3 }} label="外部编号"
                field={delegation.ref_external_no}
                fieldCol={{ span: 9 }}
              />
            </Col>
          </Row>
          <Row>
            <Col span="12">
              <PaneFormItem labelCol={{ span: 3 }} label="总重量"
                field={`${delegation.weight ? delegation.weight : ''} 公斤`} fieldCol={{ span: 9 }}
              />
            </Col>
            <Col span="12">
              <PaneFormItem labelCol={{ span: 3 }} label="总件数"
                field={`${delegation.pieces} 件`} fieldCol={{ span: 9 }}
              />
            </Col>
          </Row>
          <Row>
            <Col span="12">
              <PaneFormItem labelCol={{ span: 3 }} label="备注"
                field={delegation.remark}
                fieldCol={{ span: 9 }}
              />
            </Col>
          </Row>
        </Card>
        <Card title="附件" bodyStyle={{ padding: 16 }}>
          {filenames}
        </Card>
      </div>
    );
  }
}
