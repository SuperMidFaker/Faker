import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { connect } from 'react-redux';
import connectFetch from 'client/common/decorators/connect-fetch';
import { intlShape, injectIntl } from 'react-intl';
import { Button, Layout, Select, Icon, Tooltip } from 'antd';
import QueueAnim from 'rc-queue-anim';
import { CWM_MOVEMENT_TYPE } from 'common/constants';
import DataTable from 'client/components/DataTable';
import PageHeader from 'client/components/PageHeader';
import SearchBox from 'client/components/SearchBox';
import RowAction from 'client/components/RowAction';
import connectNav from 'client/common/decorators/connect-nav';
import { Logixon } from 'client/components/FontIcon';
import { openMovementModal, loadMovements, cancelMovement } from 'common/reducers/cwmMovement';
import { switchDefaultWhse } from 'common/reducers/cwmContext';
import { showDock } from 'common/reducers/cwmShippingOrder';
import { format } from 'client/common/i18n/helpers';
import WhseSelect from '../../common/whseSelect';
import MovementModal from './modal/movementModal';
import messages from '../message.i18n';


const formatMsg = format(messages);
const { Content } = Layout;
const { Option } = Select;

function fetchData({ state, dispatch }) {
  dispatch(loadMovements({
    whseCode: state.cwmContext.defaultWhse.code,
    pageSize: state.cwmMovement.movements.pageSize,
    current: state.cwmMovement.movements.current,
    filter: state.cwmMovement.movementFilter,
  }));
}
@connectFetch()(fetchData)
@injectIntl
@connect(
  state => ({
    whses: state.cwmContext.whses,
    defaultWhse: state.cwmContext.defaultWhse,
    owners: state.cwmContext.whseAttrs.owners,
    loginId: state.account.loginId,
    loginName: state.account.username,
    movements: state.cwmMovement.movements,
    loading: state.cwmMovement.movements.loading,
    filter: state.cwmMovement.movementFilter,
  }),
  {
    openMovementModal, switchDefaultWhse, showDock, loadMovements, cancelMovement,
  }
)
@connectNav({
  depth: 2,
  moduleName: 'cwm',
})
export default class MovementList extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  state = {
    selectedRowKeys: [],
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.defaultWhse.code !== this.props.defaultWhse.code) {
      const whseCode = nextProps.defaultWhse.code;
      this.props.loadMovements({
        whseCode,
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
    render: o => o && CWM_MOVEMENT_TYPE[o - 1].text,
  }, {
    title: '状态',
    align: 'center',
    width: 200,
    render: (o, record) => {
      if (record.isdone === 1) {
        return <Logixon type="circle" color="green" />;
      }
      return <Logixon type="circle" color="gray" />;
    },
  }, {
    title: '操作模式',
    dataIndex: 'moving_mode',
    width: 80,
    align: 'center',
    render: (o) => {
      if (o === 'scan') {
        return (<Tooltip title="扫码移动"><Icon type="scan" /></Tooltip>);
      } else if (o === 'manual') {
        return (<Tooltip title="人工移动"><Icon type="solution" /></Tooltip>);
      }
      return <span />;
    },
  }, {
    title: '创建时间',
    dataIndex: 'created_date',
    width: 120,
    render: createdate => createdate && moment(createdate).format('MM.DD HH:mm'),
  }, {
    title: '移动时间',
    dataIndex: 'completed_date',
    width: 120,
    render: completeddate => completeddate && moment(completeddate).format('MM.DD HH:mm'),
  }, {
    title: '操作',
    dataIndex: 'OPS_COL',
    className: 'table-col-ops',
    width: 150,
    fixed: 'right',
    render: (o, record) => {
      if (record.isdone) {
        return (<RowAction onClick={this.handleMovementDetail} label="移库明细" row={record} />);
      }
      return (<span>
        <RowAction onClick={this.handleMovementDetail} label="移库明细" row={record} />
        <span className="ant-divider" />
        <RowAction onClick={this.cancelMovement} label="取消移库" row={record} />
      </span>);
    },
  }]
  handleCreateMovement = () => {
    this.props.openMovementModal();
  }
  handleStatusChange = () => {
    const whseCode = this.props.defaultWhse.code;
    this.props.loadMovements({
      whseCode,
      pageSize: this.props.movements.pageSize,
      current: this.props.movements.current,
    });
  }
  handleMovementDetail = (row) => {
    const link = `/cwm/stock/movement/${row.movement_no}`;
    this.context.router.push(link);
  }

  handleSearch = () => {
    const whseCode = this.props.defaultWhse.code;
    this.props.loadMovements({
      whseCode,
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
      pageSize: this.props.movements.pageSize,
      current: this.props.movements.current,
      filter,
    });
  }
  cancelMovement = (row) => {
    const { loginName } = this.props;
    this.props.cancelMovement(row.movement_no, loginName).then((result) => {
      if (!result.err) {
        const whseCode = this.props.defaultWhse.code;
        this.props.loadMovements({
          whseCode,
          pageSize: this.props.movements.pageSize,
          current: this.props.movements.current,
          filter: this.props.filter,
        });
      }
    });
  }
  render() {
    const {
      owners, loading,
    } = this.props;
    const dataSource = new DataTable.DataSource({
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
    const toolbarActions = (<span>
      <SearchBox placeholder={this.msg('searchPlaceholder')} onSearch={this.handleSearch} />
      <Select
        showSearch
        optionFilterProp="children"
        onChange={this.handleOwnerChange}
        defaultValue="all"
        dropdownMatchSelectWidth={false}
        dropdownStyle={{ width: 360 }}
      >
        <Option value="all" key="all">全部货主</Option>
        {
            owners.map(owner => (<Option value={owner.id} key={owner.name}>{owner.name}</Option>))
          }
      </Select>
    </span>);
    const bulkActions = (<Button>批量移库</Button>);

    return (
      <QueueAnim type={['bottom', 'up']}>
        <PageHeader
          breadcrumb={[
            <WhseSelect onChange={this.handleWhseChange} />,
            this.msg('movement'),
          ]}
        >
          <PageHeader.Actions>
            <Button type="primary" icon="plus" onClick={this.handleCreateMovement}>
              {this.msg('createMovement')}
            </Button>
          </PageHeader.Actions>
        </PageHeader>
        <Content className="page-content" key="main">
          <DataTable
            toolbarActions={toolbarActions}
            bulkActions={bulkActions}
            selectedRowKeys={this.state.selectedRowKeys}
            columns={this.columns}
            dataSource={dataSource}
            rowSelection={rowSelection}
            rowKey="id"
            loading={loading}
          />
        </Content>
        <MovementModal />
      </QueueAnim>
    );
  }
}
