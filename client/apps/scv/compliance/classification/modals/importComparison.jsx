import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Modal, Popconfirm, Icon, Tooltip, Tag, message, Table, Button } from 'antd';
import RowAction from 'client/components/RowAction';
import TrimSpan from 'client/components/trimSpan';
import { createFilename } from 'client/util/dataTransform';
import { setCompareVisible, saveComparedItemDatas, loadTradeItems } from 'common/reducers/scvClassification';
import { loadTempItems, comparedCancel, deleteTempData } from 'common/reducers/cmsTradeitem';
import { format } from 'client/common/i18n/helpers';
import messages from '../message.i18n';
import { ITEMS_STATUS } from 'common/constants';

const formatMsg = format(messages);

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    tenantName: state.account.tenantName,
    loginId: state.account.loginId,
    loginName: state.account.username,
    listFilter: state.scvClassification.listFilter,
    tempItems: state.cmsTradeitem.tempItems,
    visibleCompareModal: state.scvClassification.visibleCompareModal,
    compareduuid: state.scvClassification.compareduuid,
  }),
  {
    setCompareVisible, saveComparedItemDatas, loadTradeItems, loadTempItems, comparedCancel, deleteTempData,
  }
)
export default class ImportComparisonModal extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
    tenantName: PropTypes.string.isRequired,
    loginId: PropTypes.number.isRequired,
    listFilter: PropTypes.object.isRequired,
    tempItems: PropTypes.object,
    visibleCompareModal: PropTypes.bool.isRequired,
    data: PropTypes.string.isRequired,
  }
  constructor(props) {
    super(props);
    const uuid = props.data;
    this.state = {
      pagination: {
        current: 1,
        total: 0,
        pageSize: 10,
        showQuickJumper: true,
        onChange: this.handlePageChange,
      },
      uuid,
      dataSource: [],
      feedbackChanges: {},
    };
  }
  getInitialState() {
    return { modalWidth: 1000 };
  }
  componentWillMount() {
    if (typeof document !== 'undefined' && typeof window !== 'undefined') {
      this.setState({ modalWidth: window.innerWidth - 48 });
    }
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.compareduuid !== this.props.compareduuid) {
      this.setState({
        uuid: nextProps.compareduuid,
      });
    }
    if (nextProps.visibleCompareModal && nextProps.visibleCompareModal !== this.props.visibleCompareModal) {
      this.handleTempItemsLoad();
    }
    if (nextProps.tempItems !== this.props.tempItems) {
      this.setState({
        dataSource: nextProps.tempItems.data,
        pagination: { ...this.state.pagination, total: nextProps.tempItems.totalCount },
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
    this.handleTempItemsLoad(current);
  }
  handleTempItemsLoad = (currentPage) => {
    this.props.loadTempItems({
      uuid: this.state.uuid,
      pageSize: this.props.tempItems.pageSize,
      currentPage: currentPage || this.props.tempItems.current,
    }).then((result) => {
      if (result.error) {
        message.error(result.error.message, 5);
      }
    });
  }
  handleCancel = () => {
    this.props.comparedCancel({ uuid: this.state.uuid });
    this.props.setCompareVisible(false);
  }
  handleOk = () => {
    const {
      tenantId, tenantName, loginId, loginName,
    } = this.props;
    const { uuid, feedbackChanges } = this.state;
    const changes = JSON.stringify(feedbackChanges);
    const baseInfo = {
      owner_tenant_id: tenantId,
      owner_name: tenantName,
      creater_login_id: loginId,
      creater_name: loginName,
    };
    this.props.saveComparedItemDatas({ uuid, feedbackChanges: changes, baseInfo }).then((result) => {
      if (result.error) {
        message.error(result.error.message, 10);
      } else {
        this.props.setCompareVisible(false);
        this.props.loadTradeItems({
          tenantId,
          filter: JSON.stringify(this.props.listFilter),
          pageSize: 20,
          currentPage: 1,
        });
      }
    });
  }
  handleRowDel = (tempId) => {
    this.props.deleteTempData(tempId).then((result) => {
      if (result.error) {
        message.error(result.error.message, 10);
      } else {
        const totCount = this.props.tempItems.totalCount - 1;
        const current = this.props.tempItems.current;
        const count = (current - 1) * this.props.tempItems.pageSize;
        if (totCount === count && totCount > 0) {
          this.handleTempItemsLoad(current - 1);
        } else {
          this.handleTempItemsLoad();
        }
      }
    });
  }
  handleCodeChoose = (row, index) => {
    const dataSource = this.state.dataSource;
    let feedback = '';
    if (row.feedback === 'prehscode') {
      feedback = 'newhscode';
    } else if (row.feedback === 'newhscode') {
      feedback = 'prehscode';
    } else if (row.feedback === 'newGmodel') {
      feedback = 'preGmodel';
    } else if (row.feedback === 'preGmodel') {
      feedback = 'newGmodel';
    }
    const change = {};
    change[row.id] = feedback;
    dataSource[index] = { ...row, feedback };
    this.setState({ dataSource, feedbackChanges: { ...this.state.feedbackChanges, ...change } });
  }
  handleExportUnclassified = () => {
    window.open(`${API_ROOTS.default}v1/cms/cmsTradeitem/tempitems/export/${createFilename('unclassifiedItems')}.xlsx?uuid=${this.state.uuid}`);
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
      if (record.feedback === 'wrongImHscode' || record.feedback === 'wrongHscode' || record.feedback === 'impWrongHscode') {
        return (
          <Tooltip title="错误的商品编码">
            <Tag color="red">{o}</Tag>
          </Tooltip>
        );
      } else if (record.feedback === 'newhscode' || record.feedback === 'wrongpreHscode') {
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
      } else if (record.feedback === 'prehscode') {
        return (
          <Tooltip title="使用该商品编码">
            <Tag color="green">{o}</Tag>
          </Tooltip>);
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
    render: (o, record) => {
      if (record.feedback === 'preGmodel') {
        return (
          <Tooltip title="使用该规格型号">
            <Tag color="green">{o}</Tag>
          </Tooltip>);
      } else {
        return <span>{o}</span>;
      }
    },
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
      const status = ITEMS_STATUS.filter(sts => sts.value === o)[0];
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
      width: 130,
      fixed: 'right',
      render: (o, record, index) => {
        if (record.feedback === 'prehscode') {
          return (
            <span>
              <Popconfirm title={this.msg('deleteConfirm')} onConfirm={() => this.handleRowDel(record.id)}>
                <a role="presentation"><Icon type="delete" /></a>
              </Popconfirm>
              <span className="ant-divider" />
              <RowAction onClick={this.handleCodeChoose} label="使用新编码" row={record} index={index} />
            </span>
          );
        } else if (record.feedback === 'newhscode') {
          return (
            <span>
              <Popconfirm title={this.msg('deleteConfirm')} onConfirm={() => this.handleRowDel(record.id)}>
                <a role="presentation"><Icon type="delete" /></a>
              </Popconfirm>
              <span className="ant-divider" />
              <RowAction onClick={this.handleCodeChoose} label="使用原编码" row={record} index={index} />
            </span>
          );
        } else if (record.feedback === 'preGmodel') {
          return (
            <span>
              <Popconfirm title={this.msg('deleteConfirm')} onConfirm={() => this.handleRowDel(record.id)}>
                <a role="presentation"><Icon type="delete" /></a>
              </Popconfirm>
              <span className="ant-divider" />
              <RowAction onClick={this.handleCodeChoose} label="使用新规格型号" row={record} index={index} />
            </span>
          );
        } else if (record.feedback === 'newGmodel') {
          return (
            <span>
              <Popconfirm title={this.msg('deleteConfirm')} onConfirm={() => this.handleRowDel(record.id)}>
                <a role="presentation"><Icon type="delete" /></a>
              </Popconfirm>
              <span className="ant-divider" />
              <RowAction onClick={this.handleCodeChoose} label="使用原规格型号" row={record} index={index} />
            </span>
          );
        } else {
          return (
            <Popconfirm title={this.msg('deleteConfirm')} onConfirm={() => this.handleRowDel(record.id)}>
              <a role="presentation"><Icon type="delete" /></a>
            </Popconfirm>);
        }
      },
    });
    return (
      <Modal maskClosable={false} title={this.msg('对比结果确认')} visible={visibleCompareModal}
        onOk={this.handleOk} onCancel={this.handleCancel} width={this.state.modalWidth} style={{ top: 24 }}
      >
        <div className="pane">
          <div className="panel-header">
            <Button onClick={this.handleExportUnclassified}>{this.msg('exportUnclassified')}</Button>
          </div>
          <div className="panel-body table-panel table-fixed-layout">
            <Table size="middle" rowKey={record => record.cop_product_no} columns={columns} dataSource={this.state.dataSource} pagination={this.state.pagination} scroll={{ x: 1500 }} />
          </div>
        </div>
      </Modal>
    );
  }
}

