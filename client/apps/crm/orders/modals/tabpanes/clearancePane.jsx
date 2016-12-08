import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Row, Col, Card, Tabs } from 'antd';
import './pane.less';
import ClearanceStatus from './clearanceStatus';

const TabPane = Tabs.TabPane;

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

function fileSort(filename) {
  const ext = getExtension(filename);
  const type = ext.toLowerCase();
  if (type === 'doc' || type === 'pages' || type === 'docx') {
    return { type: 'doc', name: filename };
  } else if (type === 'xls' || type === 'numbers') {
    return { type: 'xls', name: filename };
  } else if (type === 'zip' || type === 'rar') {
    return { type: 'zip', name: filename };
  } else {
    return { type: 'pdf', name: filename };
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
    tenantId: state.account.tenantId,
    clearances: state.crmOrders.previewer.clearances,
  }), { }
)
export default class ClearancePane extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
    clearances: PropTypes.array.isRequired,
  }
  state = {
    tabKey: '',
  }
  componentWillMount() {
    const { clearances } = this.props;
    const tabKey = clearances[0] ? clearances[0].delegation.delg_no : '';
    this.setState({
      tabKey,
    });
  }
  componentWillReceiveProps(nextProps) {
    const { clearances } = nextProps;
    const tabKey = clearances[0] ? clearances[0].delegation.delg_no : '';
    this.setState({
      tabKey,
    });
  }
  handleChangeTab = (tabKey) => {
    this.setState({
      tabKey,
    });
  }
  renderClearance({ delegation, delegateTracking, files }) {
    let img = '';
    const FILE = [];
    files.forEach((fl) => {
      FILE.push(fileSort(fl.name));
    });

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
        <ClearanceStatus status={delegateTracking.status} subStatus={delegateTracking.sub_status} />
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
                field={delegation.weight ? `${delegation.weight} 千克` : ''} fieldCol={{ span: 9 }}
              />
            </Col>
            <Col span="12">
              <PaneFormItem labelCol={{ span: 3 }} label="总件数"
                field={delegation.pieces ? `${delegation.pieces} 件` : ''} fieldCol={{ span: 9 }}
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
  render() {
    const { clearances } = this.props;

    if (clearances.length === 1) {
      return (
        <div>
          {this.renderClearance(clearances[0])}
        </div>
      );
    } else {
      return (
        <div>
          <Tabs activeKey={this.state.tabKey} tabPosition="left" onChange={this.handleChangeTab}>
            {clearances.map(item => (
              <TabPane tab={item.delegation.delg_no} key={item.delegation.delg_no}>
                {this.renderClearance(item)}
              </TabPane>
              ))}
          </Tabs>
        </div>
      );
    }
  }
}
