import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { connect } from 'react-redux';
import connectFetch from 'client/common/decorators/connect-fetch';
import { intlShape, injectIntl } from 'react-intl';
import { Button, Breadcrumb, Layout, Select, message } from 'antd';
import Table from 'client/components/remoteAntTable';
import QueueAnim from 'rc-queue-anim';
import SearchBar from 'client/components/SearchBar';
import RowUpdater from 'client/components/rowUpdater';
import connectNav from 'client/common/decorators/connect-nav';
import { Fontello } from 'client/components/FontIcon';
import { openMovementModal, loadMovements, cancelMovement } from 'common/reducers/cwmMovement';
import { switchDefaultWhse } from 'common/reducers/cwmContext';
import { showDock } from 'common/reducers/cwmShippingOrder';
import { format } from 'client/common/i18n/helpers';
import MovementModal from './modal/movementModal';
import messages from '../message.i18n';
import { CWM_MOVE_TYPE } from 'common/constants';

const formatMsg = format(messages);
const { Header, Content } = Layout;
const Option = Select.Option;

function fetchData({ state, dispatch }) {
  dispatch(loadMovements({
    whseCode: state.cwmContext.defaultWhse.code,
    tenantId: state.account.tenantId,
    pageSize: state.cwmMovement.movements.pageSize,
    current: state.cwmMovement.movements.current,
    filter: state.cwmMovement.movementFilter,
  }));
}
@connectFetch()(fetchData)
@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    whses: state.cwmContext.whses,
    defaultWhse: state.cwmContext.defaultWhse,
    owners: state.cwmContext.whseAttrs.owners,
    loginId: state.account.loginId,
    loginName: state.account.username,
    movements: state.cwmMovement.movements,
    loading: state.cwmMovement.movements.loading,
    filter: state.cwmMovement.movementFilter,
  }),
  { openMovementModal, switchDefaultWhse, showDock, loadMovements, cancelMovement }
)
@connectNav({
  depth: 2,
  moduleName: 'cwm',
})
export default class MovementList extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  state = {
    selectedRowKeys: [],
    searchInput: '',
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.defaultWhse.code !== this.props.defaultWhse.code) {
      const whseCode = nextProps.defaultWhse.code;
      this.props.loadMovements({
        whseCode,
        tenantId: this.props.tenantId,
        pageSize: this.props.movements.pageSize,
        current: this.props.movements.current,
        filter: this.props.filter,
      });
    }
  }
  msg = key => formatMsg(this.props.intl, key);
  columns = [{
    title: '移库单号',
    dataIndex: 'movement_no',
    width: 180,
  }, {
    title: '货主',
    width: 300,
    dataIndex: 'owner_name',
  }, {
    title: '类型',
    dataIndex: 'move_type',
    render: o => o && CWM_MOVE_TYPE[o - 1].text,
  }, {
    title: '状态',
    className: 'cell-align-center',
    width: 200,
    render: (o, record) => {
      if (record.isdone === 1) {
        return <Fontello type="circle" color="green" />;
      } else {
        return <Fontello type="circle" color="gray" />;
      }
    },
  }, {
    title: '创建时间',
    dataIndex: 'created_date',
    width: 120,
    render: createdate => createdate && moment(createdate).format('MM.DD HH:mm'),
  }, {
    title: '移库时间',
    dataIndex: 'completed_date',
    width: 120,
    render: completeddate => completeddate && moment(completeddate).format('MM.DD HH:mm'),
  }, {
    title: '操作',
    width: 200,
    fixed: 'right',
    render: (o, record) => {
      if (record.isdone) {
        return (<RowUpdater onHit={this.handleMovementDetail} label="移库明细" row={record} />);
      } else {
        return (<span>
          <RowUpdater onHit={this.handleMovementDetail} label="移库明细" row={record} />
          <span className="ant-divider" />
          <RowUpdater onHit={this.cancelMovement} label="取消移库" row={record} />
        </span>);
      }
    },
  }]
  handleCreateMovement = () => {
    this.props.openMovementModal();
  }
  handleStatusChange = () => {
    const whseCode = this.props.defaultWhse.code;
    this.props.loadMovements({
      whseCode,
      tenantId: this.props.tenantId,
      pageSize: this.props.movements.pageSize,
      current: this.props.movements.current,
    });
  }
  handleMovementDetail = (row) => {
    const link = `/cwm/stock/movement/${row.movement_no}`;
    this.context.router.push(link);
  }
  handleWhseChange = (value) => {
    this.props.switchDefaultWhse(value);
    message.info('当前仓库已切换');
  }
  handleSearch = () => {
    const whseCode = this.props.defaultWhse.code;
    this.props.loadMovements({
      whseCode,
      tenantId: this.props.tenantId,
      pageSize: this.props.movements.pageSize,
      current: this.props.movements.current,
      filter: this.props.filter,
    });
  }
  handleOwnerChange = (value) => {
    const filter = { ...this.props.filter, owner: value };
    const whseCode = this.props.defaultWhse.code;
    this.props.loadMovements({
      whseCode,
      tenantId: this.props.tenantId,
      pageSize: this.props.movements.pageSize,
      current: this.props.movements.current,
      filter,
    });
  }
  cancelMovement = (row) => {
    const { loginName, tenantId } = this.props;
    this.props.cancelMovement(row.movement_no, loginName, tenantId).then((result) => {
      if (!result.err) {
        const whseCode = this.props.defaultWhse.code;
        this.props.loadMovements({
          whseCode,
          tenantId: this.props.tenantId,
          pageSize: this.props.movements.pageSize,
          current: this.props.movements.current,
          filter: this.props.filter,
        });
      }
    });
  }
  render() {
    const { defaultWhse, whses, owners, loading } = this.props;
    const dataSource = new Table.DataSource({
      fetcher: params => this.props.loadMovements(params),
      resolve: result => result.data,
      getPagination: (result, resolve) => ({
        total: result.totalCount,
        current: resolve(result.totalCount, result.current, result.pageSize),
        showSizeChanger: true,
        showQuickJumper: false,
        pageSize: result.pageSize,
        showTotal: total => `共 ${total} 条`,
      }),
      getParams: (pagination, tblfilters) => {
        const newfilters = { ...this.props.filters, ...tblfilters[0] };
        const params = {
          whseCode: this.props.defaultWhse.code,
          tenantId: this.props.tenantId,
          pageSize: pagination.pageSize,
          current: pagination.current,
          filters: newfilters,
        };
        return params;
      },
      remotes: this.props.movements,
    });
    const rowSelection = {
      selectedRowKeys: this.state.selectedRowKeys,
      onChange: (selectedRowKeys) => {
        this.setState({ selectedRowKeys });
      },
    };
    return (
      <QueueAnim type={['bottom', 'up']}>
        <Header className="page-header">
          <Breadcrumb>
            <Breadcrumb.Item>
              <Select size="large" value={defaultWhse.code} placeholder="选择仓库" style={{ width: 160 }} onSelect={this.handleWhseChange}>
                {
                  whses.map(warehouse => (<Option value={warehouse.code} key={warehouse.code}>{warehouse.name}</Option>))
                }
              </Select>
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              {this.msg('movement')}
            </Breadcrumb.Item>
          </Breadcrumb>
          <div className="page-header-tools">
            <Button type="primary" size="large" icon="plus" onClick={this.handleCreateMovement}>
              {this.msg('createMovement')}
            </Button>
          </div>
        </Header>
        <Content className="main-content" key="main">
          <div className="page-body">
            <div className="toolbar">
              <SearchBar placeholder={this.msg('searchPlaceholder')} size="large" onInputSearch={this.handleSearch} />
              <span />
              <Select showSearch optionFilterProp="children" size="large" style={{ width: 160 }}
                onChange={this.handleOwnerChange} defaultValue="all" dropdownMatchSelectWidth={false} dropdownStyle={{ width: 360 }}
              >
                <Option value="all" key="all">全部货主</Option>
                {
                  owners.map(owner => (<Option value={owner.id} key={owner.name}>{owner.name}</Option>))
                }
              </Select>
              <div className="toolbar-right" />
              <div className={`bulk-actions ${this.state.selectedRowKeys.length === 0 ? 'hide' : ''}`}>
                <h3>已选中{this.state.selectedRowKeys.length}项</h3>
              </div>
            </div>
            <div className="panel-body table-panel table-fixed-layout">
              <Table columns={this.columns} dataSource={dataSource} rowSelection={rowSelection} rowKey="id" scroll={{ x: 1300 }} loading={loading} />
            </div>
          </div>
        </Content>
        <MovementModal />
      </QueueAnim>
    );
  }
}
