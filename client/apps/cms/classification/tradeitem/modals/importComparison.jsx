import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Modal, Popconfirm, Icon, Tooltip, Tag, Table, message } from 'antd';
import RowUpdater from 'client/components/rowUpdater';
import TrimSpan from 'client/components/trimSpan';
import { createRepo, setCompareVisible, loadOwners, saveComparedItemDatas, loadTradeItems } from 'common/reducers/cmsTradeitem';
import { format } from 'client/common/i18n/helpers';
import messages from '../../message.i18n';
import { TRADE_ITEM_STATUS } from 'common/constants';

const formatMsg = format(messages);

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    loginId: state.account.loginId,
    loginName: state.account.username,
    repoId: state.cmsTradeitem.repoId,
    listFilter: state.cmsTradeitem.listFilter,
    visibleCompareModal: state.cmsTradeitem.visibleCompareModal,
  }),
  { createRepo, setCompareVisible, loadOwners, saveComparedItemDatas, loadTradeItems }
)

export default class ImportComparisonModal extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
    loginId: PropTypes.number.isRequired,
    repoId: PropTypes.number,
    listFilter: PropTypes.object.isRequired,
    visibleCompareModal: PropTypes.bool.isRequired,
    data: PropTypes.array.isRequired,
  }
  constructor(props) {
    super(props);
    const dataSource = props.data;
    this.state = {
      dataSource,
      pagination: {
        current: 1,
        total: 0,
        pageSize: 10,
        showQuickJumper: true,
        onChange: this.handlePageChange,
      },
    };
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.data !== this.props.data) {
      this.setState({
        dataSource: nextProps.data,
        pagination: { ...this.state.pagination, total: nextProps.data.length },
      });
    }
  }
  handlePageChange = (current) => {
    this.setState({
      pagination: {
        ...this.state.pagination,
        current,
      },
    });
  }
  handleCancel = () => {
    this.props.setCompareVisible(false);
  }
  handleOk = () => {
    const { tenantId, loginId, loginName } = this.props;
    const datas = this.state.dataSource.filter(data => data.feedback !== 'repeat' && data.feedback !== 'chooseGmdel' &&
      data.feedback !== 'chooseHscode' && data.feedback !== 'wrongImHscode' && data.feedback !== 'wrongHscode' && data.feedback !== 'wrongpreHscode');
    this.props.saveComparedItemDatas({ datas, tenantId, loginId, loginName }).then((result) => {
      if (result.error) {
        message.error(result.error.message);
      } else {
        this.props.setCompareVisible(false);
        this.props.loadTradeItems({
          repoId: this.props.repoId,
          filter: JSON.stringify(this.props.listFilter),
          pageSize: 20,
          currentPage: 1,
        });
      }
    });
  }
  handleRowDel = (index) => {
    const dataSource = this.state.dataSource;
    const recordIdx = index + (this.state.pagination.current - 1) * this.state.pagination.pageSize;
    dataSource.splice(recordIdx, 1);
    const pagination = { ...this.state.pagination, total: dataSource.length };
    if (pagination.current > 1 && (pagination.current - 1) * pagination.pageSize === pagination.total) {
      pagination.current -= 1;
    }
    this.setState({ dataSource, pagination });
  }
  handleNewHscode = (row, index) => {
    const dataSource = this.state.dataSource;
    const recordIdx = index + (this.state.pagination.current - 1) * this.state.pagination.pageSize;
    dataSource[recordIdx] = { ...row, feedback: 'newhscode' };
    this.setState({ dataSource });
  }
  handleNewGmodel = (row, index) => {
    const dataSource = this.state.dataSource;
    const recordIdx = index + (this.state.pagination.current - 1) * this.state.pagination.pageSize;
    dataSource[recordIdx] = { ...row, feedback: 'newGmodel' };
    this.setState({ dataSource });
  }
  msg = descriptor => formatMsg(this.props.intl, descriptor)
  columns = [{
    title: this.msg('copProductNo'),
    dataIndex: 'cop_product_no',
    width: 210,
    render: (o, record) => {
      if (record.feedback === 'repeat') {
        return (
          <Tooltip title="该条记录已存在，请勿重复添加">
            <Tag color="orange">{o}</Tag>
          </Tooltip>);
      } else {
        return <span>{o}</span>;
      }
    },
  }, {
    title: this.msg('hscode'),
    dataIndex: 'hscode',
    width: 180,
    render: (o, record) => {
      if (record.feedback === 'wrongImHscode' || record.feedback === 'wrongHscode') {
        return (
          <Tooltip title="错误的商品编码">
            <Tag color="red">{o}</Tag>
          </Tooltip>
        );
      } else if (record.feedback === 'newhscode') {
        return (
          <Tooltip title="使用该商品编码">
            <Tag color="green">{o}</Tag>
          </Tooltip>);
      } else {
        return <span>{o}</span>;
      }
    },
  }, {
    title: this.msg('preHscode'),
    dataIndex: 'item_hscode',
    width: 180,
    render: (o, record) => {
      if (record.feedback === 'wrongpreHscode' || record.feedback === 'wrongHscode') {
        return (
          <Tooltip title="错误的商品编码">
            <Tag color="red">{o}</Tag>
          </Tooltip>
        );
      } else {
        return <span>{o}</span>;
      }
    },
  }, {
    title: this.msg('gName'),
    dataIndex: 'g_name',
    width: 200,
  }, {
    title: this.msg('gModel'),
    dataIndex: 'g_model',
    width: 300,
    render: (o, record) => {
      if (record.feedback === 'newGmodel') {
        return (
          <Tooltip title="使用该规格型号">
            <Tag color="green">{o}</Tag>
          </Tooltip>);
      } else {
        return <span>{o}</span>;
      }
    },
  }, {
    title: this.msg('preGModel'),
    dataIndex: 'item_g_model',
    width: 300,
  }, {
    title: this.msg('element'),
    dataIndex: 'element',
    width: 400,
    render: o => <TrimSpan text={o} maxLen={20} />,
  }, {
    title: this.msg('status'),
    dataIndex: 'status',
    width: 120,
    render: (o) => {
      const status = TRADE_ITEM_STATUS.filter(sts => sts.value === o)[0];
      if (status) {
        return (<span>{status.text}</span>);
      } else {
        return (<span>{o}</span>);
      }
    },
  }]
  render() {
    const { visibleCompareModal } = this.props;
    const columns = [...this.columns];
    columns.push({
      title: this.msg('opColumn'),
      width: 120,
      fixed: 'right',
      render: (o, record, index) => {
        if (record.feedback === 'chooseHscode' || record.feedback === 'wrongpreHscode') {
          return (
            <span>
              <Popconfirm title={this.msg('deleteConfirm')} onConfirm={() => this.handleRowDel(index)}>
                <a role="button"><Icon type="delete" /></a>
              </Popconfirm>
              <span className="ant-divider" />
              <RowUpdater onHit={this.handleNewHscode} label="使用新编码" row={record} index={index} />
            </span>
          );
        } else if (record.feedback === 'chooseGmdel') {
          return (
            <span>
              <Popconfirm title={this.msg('deleteConfirm')} onConfirm={() => this.handleRowDel(index)}>
                <a role="button"><Icon type="delete" /></a>
              </Popconfirm>
              <span className="ant-divider" />
              <RowUpdater onHit={this.handleNewGmodel} label="使用新规格型号" row={record} index={index} />
            </span>
          );
        } else {
          return (
            <Popconfirm title={this.msg('deleteConfirm')} onConfirm={() => this.handleRowDel(index)}>
              <a role="button"><Icon type="delete" /></a>
            </Popconfirm>);
        }
      },
    });
    return (
      <Modal title={this.msg('对比结果确认')} visible={visibleCompareModal}
        onOk={this.handleOk} onCancel={this.handleCancel} width={1000}
      >
        <Table rowKey={record => record.cop_product_no} columns={columns} dataSource={this.state.dataSource} pagination={this.state.pagination} scroll={{ x: 1500 }} />
      </Modal>
    );
  }
}

