/* eslint no-console: 0 */
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import connectFetch from 'client/common/decorators/connect-fetch';
import { intlShape, injectIntl } from 'react-intl';
import { Form, Select, Table, message } from 'antd';

import { saveFlowGraph, loadScvTrackings } from 'common/reducers/scofFlow';
import { loadFormRequires } from 'common/reducers/sofOrders';
import EditableCell from 'client/components/EditableCell';
import { formatMsg } from '../message.i18n';

const { Option } = Select;
const FormItem = Form.Item;

function fetchData({ state, dispatch }) {
  const promises = [
    dispatch(loadFormRequires({ tenantId: state.account.tenantId })),
  ];
  return Promise.all(promises);
}

@connectFetch()(fetchData)
@injectIntl
@connect(
  state => ({
    trackingFields: state.scofFlow.trackingFields,
    tenantId: state.account.tenantId,
    currentFlow: state.scofFlow.currentFlow,
  }),
  {
    saveFlowGraph,
    loadScvTrackings,
  }
)
export default class FlowDesigner extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    trackingFields: PropTypes.arrayOf(PropTypes.shape({
      field: PropTypes.string,
      title: PropTypes.string,
      module: PropTypes.oneOf(['cms', 'tms', 'cwmrec', 'cwmship']),
    })),
    currentFlow: PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
      partner_id: PropTypes.number,
      customer_tenant_id: PropTypes.number,
      tracking_id: PropTypes.number,
    }).isRequired,
  }
  constructor(...args) {
    super(...args);
    this.state = {
      activeItem: null,
      trackDataSource: this.props.trackingFields.map(tf => ({
        title: tf.title, field: tf.field, module: tf.module, node: null,
      })),
      trackings: [],
      trackingId: null,
    };
    this.trackingFieldTypeMapNodeKinds = {
      cms: ['import', 'export'],
      tms: ['tms'],
      cwmrec: ['cwmrec'],
      cwmship: ['cwmship'],
    };
    this.formhoc = null;
    this.trackingColumns = [{
      title: '追踪点',
      width: 150,
      dataIndex: 'title',
    }, {
      title: '来源节点',
      dataIndex: 'node',
      render: (node, row) => {
        if (this.props.graph) {
          const nodekinds = this.trackingFieldTypeMapNodeKinds[row.module];
          const nodes = this.props.graph.get('items').filter(item => item.get('type') === 'node' && nodekinds.indexOf(item.get('model').kind) !== -1)
            .map(item => ({
              key: item.get('model').id,
              text: item.get('model').name,
            }));
          return (
            <EditableCell
              type="select"
              options={nodes}
              value={node}
              placeholder="选择节点"
              onSave={nodeId => this.handleTrackNodeChange(nodeId, row.field)}
            />);
        }
        return null;
      },
    }];
  }
  componentWillMount() {
    const { currentFlow } = this.props;
    if (currentFlow.customer_tenant_id && currentFlow.customer_tenant_id !== -1) {
      this.props.loadScvTrackings(currentFlow.customer_tenant_id).then((result) => {
        if (!result.error) {
          this.setState({ trackings: result.data });
        }
      });
    }
  }
  msg = formatMsg(this.props.intl)
  handleTrackNodeChange = (nodeId, field) => {
    const dataSource = [...this.state.trackDataSource];
    for (let i = 0; i < dataSource.length; i++) {
      if (dataSource[i].field === field) {
        dataSource[i].node = nodeId;
        break;
      }
    }
    this.setState({ trackDataSource: dataSource });
  }
  handleTrackingChange = (trackingId) => {
    this.setState({ trackingId });
  }
  handlePanelForm = (form) => { this.formhoc = form; }
  handleSave = () => {
    const { activeItem } = this.state;
    if (activeItem && this.formhoc) {
      const values = this.formhoc.getFieldsValue();
      this.props.graph.update(activeItem, values);
    }
    const trackingId = this.state.trackingId !== this.props.currentFlow.tracking_id ?
      this.state.trackingId : null;
    const graphItems = this.props.graph.get('items');
    const nodeMap = {};
    graphItems.filter(item => item.get('type') === 'node').forEach((item) => {
      const model = item.get('model');
      model.in_degree = 0;
      model.out_degree = 0;
      nodeMap[model.id] = model;
    });
    const edges = graphItems.filter(item => item.get('type') === 'edge'
      && item.get('model').target !== item.get('model').source).map(item => item.get('model'));
    edges.forEach((edge) => { // edge move cannot edit in/out degree on the fly
      if (nodeMap[edge.target]) {
        nodeMap[edge.target].in_degree += 1;
      }
      if (nodeMap[edge.source]) {
        nodeMap[edge.source].out_degree += 1;
      }
    });
    const nodes = Object.keys(nodeMap).map(nodeid => nodeMap[nodeid]);
    console.log(nodes, edges);
    // todo graph node edge disconnected
    this.props.saveFlowGraph(
      this.props.currentFlow.id, nodes, edges, trackingId,
      this.state.trackDataSource.map(tds => ({
        field: tds.field,
        node: tds.node,
      }))
    ).then((result) => {
      if (!result.error) {
        const { currentFlow } = this.props;
        this.props.loadFlowGraph(currentFlow.id, currentFlow.main_flow_id);
        this.setState({ activeItem: null });
        message.success('保存成功');
      } else {
        message.error('保存失败', 5);
      }
    });
  }

  render() {
    return (
      <div>
        <Form layout="inline">
          <FormItem>
            <Select
              value={this.state.trackingId}
              style={{ width: 360 }}
              onChange={this.handleTrackingChange}
            >
              {this.state.trackings.map(data => (
                <Option key={data.id} value={data.id}>{data.name}</Option>))}
            </Select>
          </FormItem>
        </Form>
        <Table
          size="small"
          columns={this.trackingColumns}
          bordered={false}
          dataSource={this.state.trackDataSource}
          rowKey="field"
        />
      </div>
    );
  }
}
