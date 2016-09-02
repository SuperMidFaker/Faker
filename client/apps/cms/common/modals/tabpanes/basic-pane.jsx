import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Row, Col, Card, Modal } from 'antd';
import { TENANT_ASPECT } from 'common/constants';
import './pane.less';

let DOC = [];
let XLS = [];
let PDF = [];
let ZIP = [];
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
    DOC.push(filename);
  } else if (type === 'xls' || type === 'numbers') {
    XLS.push(filename);
  } else if (type === 'zip' || type === 'rar') {
    ZIP.push(filename);
  } else {
    PDF.push(filename);
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
  state = {
    imgModalShow: false,
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.files.length !== this.props.files.length) {
      DOC = []; XLS = []; PDF = []; ZIP = [];
      nextProps.files.forEach(fl => {
        fileSort(fl.name);
      });
    }
  }
  handleDocClick = () => {
    FILE = DOC;
    this.setState({ imgModalShow: true });
  }
  handleXlsClick = () => {
    FILE = XLS;
    this.setState({ imgModalShow: true });
  }
  handlePdfClick = () => {
    FILE = PDF;
    this.setState({ imgModalShow: true });
  }
  handleZipClick = () => {
    FILE = ZIP;
    this.setState({ imgModalShow: true });
  }
  handleClose = () => {
    this.setState({ imgModalShow: false });
  }
  render() {
    const { delegation, delegateTracking } = this.props;
    if (FILE.length < 1) {
      FILE[0] = '—';
    }
    const filenames = FILE.map((doc, index) => {
      return (
        <div key={index}>{doc}</div>
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
                field={this.props.aspect === TENANT_ASPECT.BO ? delegation.ref_delg_external_no : delegation.ref_recv_external_no}
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
          <Modal title="详情" wrapClassName="vertical-center-modal" visible={this.state.imgModalShow} footer={''} onCancel={this.handleClose}>
            {filenames}
          </Modal>
        </Card>
      </div>
    );
  }
}
