import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Tag, Row, Col, Card, Table } from 'antd';
import { DELG_SOURCE } from 'common/constants';
import moment from 'moment';
import { loadDeclCiqByDelgNo } from 'common/reducers/cmsDeclare';

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

PaneFormItem.propTypes = {
  label: PropTypes.string.isRequired,
  labelCol: PropTypes.object,
  fieldCol: PropTypes.object,
};
@injectIntl
@connect(
  state => ({
    delgNo: state.cmsDelegation.previewer.delegation.delg_no,
    ciqdecl: state.cmsDeclare.previewer.ciqdecl,
    tenantId: state.account.tenantId,
  }),
  { loadDeclCiqByDelgNo }
)
export default class CiqDeclPane extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    delgNo: PropTypes.string.isRequired,
    tenantId: PropTypes.number.isRequired,
    ciqdecl: PropTypes.shape({
      inspection_name: PropTypes.string,
      acpt_time: PropTypes.date,
      source: PropTypes.number,
      ciqlist: PropTypes.arrayOf(PropTypes.shape({
        pre_entry_seq_no: PropTypes.string,
      })),
    }),
  }
  componentWillMount() {
    this.props.loadDeclCiqByDelgNo(this.props.delgNo, this.props.tenantId);
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.delgNo !== this.props.delgNo) {
      this.props.loadDeclCiqByDelgNo(nextProps.delgNo, this.props.tenantId);
    }
  }
  render() {
    const { ciqdecl } = this.props;
    const columns = [{
      title: '统一编号',
      dataIndex: 'pre_entry_seq_no',
    }, {
      title: '海关编号',
      dataIndex: 'entry_id',
    }, {
      title: '通关单号',
      dataIndex: 'ciq_no',
    }, {
      title: '报检日期',
      dataIndex: 'inspection_time',
      render: o => o && moment(o).format('YYYY.MM.DD HH:mm'),
    }, {
      title: '品质查验',
      dataIndex: 'ciq_quality_inspect',
      render: (o) => {
        return o === 1 ? <Tag color="red">是</Tag>
          : <Tag>否</Tag>;
      },
    }, {
      title: '动检查验',
      dataIndex: 'ciq_ap_inspect',
      render: (o) => {
        return o === 1 ? <Tag color="red">是</Tag>
          : <Tag>否</Tag>;
      },
    }, {
      title: '处理结果',
      dataIndex: 'ciq_status',
      render: (o) => {
        if (o !== 1) {
          return <span>未完成</span>;
        } else {
          return <span>完成</span>;
        }
      },
    }];
    const sourceText = ciqdecl.source === DELG_SOURCE.consigned ? '委托' : '分包';
    return (
      <div className="pane-content tab-pane">
        <Card bodyStyle={{ padding: 16 }}>
          <Row>
            <Col span="8">
              <PaneFormItem labelCol={{ span: 3 }} label="报检企业"
                field={ciqdecl.inspection_name} fieldCol={{ span: 9 }}
              />
            </Col>
            <Col span="8">
              <PaneFormItem labelCol={{ span: 3 }} label="受理日期" fieldCol={{ span: 9 }}
                field={ciqdecl.acpt_time && moment(ciqdecl.acpt_time).format('YYYY.MM.DD HH:mm')}
              />
            </Col>
            <Col span="8">
              <PaneFormItem labelCol={{ span: 3 }} label="来源"
                field={sourceText} fieldCol={{ span: 9 }}
              />
            </Col>
          </Row>
        </Card>
        <Card bodyStyle={{ padding: 8 }}>
          <Table size="small" columns={columns} pagination={false} dataSource={ciqdecl.ciqlist} />
        </Card>
      </div>
    );
  }
}
