import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Badge, Button, Card, Col, Icon, Row, Table, Tag, Tooltip } from 'antd';
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
  handleAssignOperator = () => {

  }

  render() {
    const { ciqdecl } = this.props;
    const columns = [{
      title: '统一编号',
      dataIndex: 'pre_entry_seq_no',
      width: 120,
    }, {
      title: '海关编号',
      dataIndex: 'entry_id',
      width: 120,
    }, {
      title: '通关单号',
      dataIndex: 'ciq_no',
      width: 120,
    }, {
      title: '品质查验',
      dataIndex: 'ciq_quality_inspect',
      width: 60,
      render: o => o === 1 ? <Tag color="red">是</Tag>
          : <Tag>否</Tag>,
    }, {
      title: '动检查验',
      dataIndex: 'ciq_ap_inspect',
      width: 60,
      render: o => o === 1 ? <Tag color="red">是</Tag>
          : <Tag>否</Tag>,
    }];
    return (
      <div className="pane-content tab-pane">
        <Card bodyStyle={{ padding: 0 }}>
          <Row gutter={8} style={{ padding: 8 }}>
            <Col span="12">
              <InfoItem labelCol={{ span: 3 }} label="报检服务商"
                field={ciqdecl.ciq_name} fieldCol={{ span: 9 }}
              />
            </Col>
            <Col span="8">
              <InfoItem labelCol={{ span: 3 }} label="受理日期" fieldCol={{ span: 9 }}
                field={ciqdecl.acpt_time && moment(ciqdecl.acpt_time).format('YYYY.MM.DD HH:mm')}
              />
            </Col>
            <Col span="4">
              <InfoItem labelCol={{ span: 3 }} label="操作人"
                field={ciqdecl.recv_login_name} fieldCol={{ span: 9 }}
              />
            </Col>
          </Row>
          <div className="card-footer">
            <Badge status="warning" text="报检待处理" />
            <div className="toolbar-right">
              <Tooltip title="分配报检供应商">
                <Button type="ghost"><Icon type="share-alt" /> 分配</Button>
              </Tooltip>
              <Tooltip title="指派操作人员">
                <Button type="ghost" shape="circle" onClick={this.handleAssignOperator}><Icon type="user" /></Button>
              </Tooltip>
            </div>
          </div>
        </Card>
        <Card bodyStyle={{ padding: 0 }}>
          <Table size="middle" columns={columns} pagination={false} dataSource={ciqdecl.ciqlist} scroll={{ x: 580 }} />
        </Card>
      </div>
    );
  }
}
