import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Button, Row, Col, Card } from 'antd';
import moment from 'moment';
import downloadMultiple from 'client/util/multipleDownloader';
import { GOODSTYPES, TRANS_MODE, CLAIM_DO_AWB } from 'common/constants';
import './pane.less';

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
  const labelCls = `info-label ${getColCls(labelCol)}`;
  const fieldCls = `info-data ${getColCls(fieldCol)}`;
  return (
    <div className="info-item">
      <label className={labelCls} htmlFor="pane">{label}：</label>
      <div className={fieldCls}>{field}</div>
    </div>
  );
}
function getExtension(filename) {
  const parts = filename.split('.');
  return parts[parts.length - 1];
}

PaneFormItem.propTypes = {
  label: PropTypes.string.isRequired,
  labelCol: PropTypes.object,
  fieldCol: PropTypes.object,
};

@injectIntl
@connect(
  state => ({
    delegation: state.cmsDelegation.previewer.delegation,
    files: state.cmsDelegation.previewer.files,
    delegateTracking: state.cmsDelegation.previewer.delegateTracking,
  })
)
export default class BasicPane extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    delegation: PropTypes.object.isRequired,
    files: PropTypes.array.isRequired,
    delegateTracking: PropTypes.object.isRequired,
  }
  state = {
    sortedFiles: [],
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.files.length !== this.props.files.length) {
      const sortedFiles = [];
      nextProps.files.forEach((fl) => {
        const filename = fl.name;
        const ext = getExtension(filename);
        const type = ext.toLowerCase();
        if (type === 'doc' || type === 'pages' || type === 'docx') {
          sortedFiles.push({ type: 'doc', name: filename });
        } else if (type === 'xls' || type === 'numbers') {
          sortedFiles.push({ type: 'xls', name: filename });
        } else if (type === 'zip' || type === 'rar') {
          sortedFiles.push({ type: 'zip', name: filename });
        } else {
          sortedFiles.push({ type: 'pdf', name: filename });
        }
      });
      this.setState({ sortedFiles });
    }
  }
  handleFilesDownload = () => {
    downloadMultiple(this.files);
  }
  render() {
    const { delegation, delegateTracking } = this.props;
    let img = '';
    const filenames = this.state.sortedFiles.map((fl, index) => {
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
    const goods = GOODSTYPES.filter(gt => gt.value === delegation.goods_type);
    const tms = TRANS_MODE.filter(tm => tm.value === delegation.trans_mode);
    let doAwbText = '';
    if (delegation.trans_mode === '2') {
      if (CLAIM_DO_AWB.notClaimDO.key === delegation.claim_do_awb) {
        doAwbText = CLAIM_DO_AWB.notClaimDO.value;
      } else if (CLAIM_DO_AWB.claimDO.key === delegation.claim_do_awb) {
        doAwbText = CLAIM_DO_AWB.claimDO.value;
      }
    }
    if (delegation.trans_mode === '5') {
      if (CLAIM_DO_AWB.notClaimAWB.key === delegation.claim_do_awb) {
        doAwbText = CLAIM_DO_AWB.notClaimAWB.value;
      } else if (CLAIM_DO_AWB.claimAWB.key === delegation.claim_do_awb) {
        doAwbText = CLAIM_DO_AWB.claimAWB.value;
      }
    }
    return (
      <div className="pane-content tab-pane">
        <Card bodyStyle={{ padding: 16 }}>
          <Row>
            <Col span="8">
              <PaneFormItem labelCol={{ span: 3 }} label="委托方"
                field={delegation.customer_name} fieldCol={{ span: 9 }}
              />
            </Col>
            <Col span="8">
              <PaneFormItem labelCol={{ span: 3 }} label="代理方"
                field={delegation.agent_name} fieldCol={{ span: 9 }}
              />
            </Col>
            <Col span="8">
              <PaneFormItem labelCol={{ span: 3 }} label="委托日期" fieldCol={{ span: 9 }}
                field={moment(delegateTracking.delg_time).format('YYYY.MM.DD HH:mm')}
              />
            </Col>
          </Row>
          <Row>
            <Col span="8">
              <PaneFormItem labelCol={{ span: 3 }} label="客户订单号"
                field={delegation.order_no} fieldCol={{ span: 9 }}
              />
            </Col>
            <Col span="8">
              <PaneFormItem labelCol={{ span: 3 }} label="发票号"
                field={delegation.invoice_no} fieldCol={{ span: 9 }}
              />
            </Col>
            <Col span="8">
              <PaneFormItem labelCol={{ span: 3 }} label="外部编号"
                field={delegation.ref_external_no}
                fieldCol={{ span: 9 }}
              />
            </Col>
          </Row>
          <Row>
            <Col span="8">
              <PaneFormItem labelCol={{ span: 3 }} label="运输方式"
                field={tms.length > 0 ? tms[0].text : ''} fieldCol={{ span: 9 }}
              />
            </Col>
            <Col span="8">
              <PaneFormItem labelCol={{ span: 3 }} label="提运单号"
                field={delegation.bl_wb_no} fieldCol={{ span: 9 }}
              />
            </Col>
            <Col span="8">
              <PaneFormItem labelCol={{ span: 3 }} label="船名航次"
                field={delegation.voyage_no} fieldCol={{ span: 9 }}
              />
            </Col>
          </Row>
          <Row>
            <Col span="8">
              <PaneFormItem labelCol={{ span: 3 }} label="货物类型"
                field={goods.length > 0 ? goods[0].text : ''} fieldCol={{ span: 9 }}
              />
            </Col>
            <Col span="8">
              <PaneFormItem labelCol={{ span: 3 }} label="总件数"
                field={`${delegation.pieces} 件`} fieldCol={{ span: 9 }}
              />
            </Col>
            <Col span="8">
              <PaneFormItem labelCol={{ span: 3 }} label="总重量"
                field={`${delegation.weight ? delegation.weight : ''} 千克`} fieldCol={{ span: 9 }}
              />
            </Col>
          </Row>
          <Row>
            <Col span="8">
              <PaneFormItem labelCol={{ span: 3 }} label="是否抽/换单"
                field={doAwbText} fieldCol={{ span: 9 }}
              />
            </Col>
            <Col span="16">
              <PaneFormItem labelCol={{ span: 3 }} label="备注"
                field={delegation.remark}
                fieldCol={{ span: 9 }}
              />
            </Col>
          </Row>
        </Card>
        <Card title="附件" bodyStyle={{ padding: 16 }} extra={
          <Button type="primary" size="small" onClick={this.handleFilesDownload} icon="download">
            下载
          </Button>}
        >
          {filenames}
        </Card>
      </div>
    );
  }
}