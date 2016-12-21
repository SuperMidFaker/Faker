import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Tag, Row, Col, Card, Table } from 'antd';
import { DELG_SOURCE } from 'common/constants';
import moment from 'moment';
import { loadDeclCiqByDelgNo } from 'common/reducers/cmsDeclare';
import InfoItem from 'client/components/InfoItem';

@injectIntl
@connect(
  state => ({
    delgNo: state.cmsDelegation.previewer.delgNo,
    ciqdecl: state.cmsDeclare.previewer.ciqdecl,
    tenantId: state.account.tenantId,
    tabKey: state.cmsDelegation.previewer.tabKey,
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
      status: PropTypes.number,
      recv_tenant_id: PropTypes.number,
      ciqlist: PropTypes.arrayOf(PropTypes.shape({
        pre_entry_seq_no: PropTypes.string,
      })),
    }),
  }
  componentDidMount() {
    this.props.loadDeclCiqByDelgNo(this.props.delgNo, this.props.tenantId);
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.tabKey === 'ciqDecl' &&
      nextProps.tabKey !== this.props.tabKey) {
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
      title: '品质查验',
      dataIndex: 'ciq_quality_inspect',
      render: o => o === 1 ? <Tag color="red">是</Tag>
          : <Tag>否</Tag>,
    }, {
      title: '动检查验',
      dataIndex: 'ciq_ap_inspect',
      render: o => o === 1 ? <Tag color="red">是</Tag>
          : <Tag>否</Tag>,
    }, {
      title: '报检日期',
      dataIndex: 'inspection_time',
      render: o => o && moment(o).format('MM.DD HH:mm'),
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
    let sourceText = '';
    if (ciqdecl.source === DELG_SOURCE.consigned) {
      sourceText = '委托';
    } else if (ciqdecl.source === DELG_SOURCE.subcontracted) {
      sourceText = '分包';
    } else {
      sourceText = '转包';
    }
    return (
      <div className="pane-content tab-pane">
        <Card bodyStyle={{ padding: 8 }}>
          <Row>
            <Col span="12">
              <InfoItem labelCol={{ span: 3 }} label="报检服务商"
                field={ciqdecl.inspection_name} fieldCol={{ span: 9 }}
              />
            </Col>
            <Col span="8">
              <InfoItem labelCol={{ span: 3 }} label="受理日期" fieldCol={{ span: 9 }}
                field={ciqdecl.acpt_time && moment(ciqdecl.acpt_time).format('YYYY.MM.DD HH:mm')}
              />
            </Col>
            <Col span="4">
              <InfoItem labelCol={{ span: 3 }} label="来源"
                field={sourceText} fieldCol={{ span: 9 }}
              />
            </Col>
          </Row>
        </Card>
        <Table size="middle" columns={columns} pagination={false} dataSource={ciqdecl.ciqlist} scroll={{ x: 800 }} />
      </div>
    );
  }
}
