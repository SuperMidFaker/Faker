import React, {PropTypes} from 'react';
import {connect} from 'react-redux';
import {loadSend} from '../../../../universal/redux/reducers/importdelegate';
import connectFetch from '../../../../reusable/decorators/connect-fetch';
import {Table, Button, Select} from 'ant-ui';
import connectNav from '../../../../reusable/decorators/connect-nav';
import {setNavTitle} from '../../../../universal/redux/reducers/navbar';
import './upload.less';
const Option = Select.Option;

function fetchData({state, dispatch, cookie, params}) {
  const pid = params.id;
  return dispatch(loadSend(state.importdelegate.idlist, cookie, pid));
}

function goBack(props) {
  props.history.goBack();
}

@connectFetch()(fetchData)
@connect(state => ({ // 从初始化state中加载数据
  tenantId: state.account.tenantId,
  sendlist: state.importdelegate.sendlist,
  loading: state.importdelegate.loading
}), {loadSend})
@connectNav((props, dispatch) => {
  dispatch(setNavTitle({
    depth: 3,
    text: '发送业务单',
    moduleName: '',
    goBackFn: () => goBack(props),
    withModuleLayout: false
  }));
})
export default class ImportDelegateSend extends React.Component {
  static propTypes = { // 属性检测
    history: PropTypes.object.isRequired,
    sendlist: PropTypes.object.isRequired,
    loading: PropTypes.bool.isRequired,
    tenantId: PropTypes.number.isRequired,
    loadSend: PropTypes.func.isRequired
  }
  constructor(props) {
    super(props);
    this.handleCancel = this.handleCancel.bind(this);
    this.state = { // 设置默认视图状态

    };
  }
  handleCancel() {
    goBack(this.props);
  }
  renderColumnText(record, text) {
    return <span>{text}</span>;
  }
  render() {
    const {sendlist, loading} = this.props;

    const dataSource = new Table.DataSource({
      fetcher: (params) => this.props.loadSend(null, params),
      resolve: (result) => result.data,
      extraParams: {
        tenantId: this.props.tenantId
      },
      remotes: sendlist
    });

    const columns = [
      {
        title: '序号',
        width: 40,
        render: (text, record, index) => this.renderColumnText(record, index + 1, text)
      }, {
        title: '报关业务单号',
        dataIndex: 'del_no',
        width: 300,
        render: (text, record) => this.renderColumnText(record, text)
      }, {
        title: '发票号',
        width: 150,
        dataIndex: 'invoice_no',
        render: (text, record) => this.renderColumnText(record, text)
      }, {
        title: '提单号',
        dataIndex: 'bill_no',
        width: 150,
        render: (text, record) => this.renderColumnText(record, text)
      }, {
        title: '创建时间',
        dataIndex: 'created_date',
        width: 150,
        render: (text, record) => this.renderColumnText(record, text)
      }
    ];
    return (
      <div className="main-content">
        <div className="page-body">
          <div className="panel-header">
            <label>选择报关行：</label>
            <Select showSearch style={{
              width: 200
            }} placeholder="请选择报关行" optionFilterProp="children" notFoundContent="无法找到" searchPlaceholder="输入关键词">
              <Option value="jack">杰克</Option>
              <Option value="lucy">露西</Option>
              <Option value="tom">汤姆</Option>
            </Select>
          </div>
          <div className="panel-body body-responsive">
            <Table columns={columns} loading={loading} dataSource={dataSource} pagination={false}/>
          </div>
          <div className="bottom-fixed-row">
            <Button size="large" type="primary">发送</Button>
            <Button size="large" onClick={this.handleCancel}>取消</Button>
          </div>
        </div>
      </div>
    );
  }
}
