import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Row, Menu, Icon, Col, Card } from 'antd';
import { saveBaseInfo } from 'common/reducers/cmsDelgInfoHub';
import downloadMultiple from 'client/util/multipleDownloader';
import { GOODSTYPES, TRANS_MODE, CLAIM_DO_AWB } from 'common/constants';
import InfoItem from 'client/components/InfoItem';
import { MdIcon } from 'client/components/FontIcon';

function getExtension(filename) {
  const parts = filename.split('.');
  return parts[parts.length - 1];
}

@injectIntl
@connect(
  state => ({
    delegation: state.cmsDelgInfoHub.previewer.delegation,
    files: state.cmsDelgInfoHub.previewer.files,
  }),
  { saveBaseInfo }
)
export default class MainInfoCard extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    delegation: PropTypes.object.isRequired,
    files: PropTypes.array.isRequired,
  }
  state = {
    sortedFiles: [],
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.files.length !== this.props.files.length) {
      const sortedFiles = [];
      nextProps.files.forEach((fl) => {
        const filename = fl.name;
        const ext = getExtension(filename);
        const type = ext.toLowerCase();
        if (type === 'doc' || type === 'pages' || type === 'docx') {
          sortedFiles.push({ type: 'doc', name: filename });
        } else if (type === 'xls' || type === 'numbers') {
          sortedFiles.push({ type: 'xls', name: filename });
        } else if (type === 'zip' || type === 'rar') {
          sortedFiles.push({ type: 'zip', name: filename });
        } else {
          sortedFiles.push({ type: 'pdf', name: filename });
        }
      });
      this.setState({ sortedFiles });
    }
  }
  handleFilesDownload = () => {
    downloadMultiple(this.files);
  }
  handleFill = (val, field) => {
    const change = {};
    change[field] = val;
    this.props.saveBaseInfo(change, this.props.delegation.delg_no);
  }
  handleMenuClick = (e) => {
    this.handleFill(e.key, 'goods_type');
  }
  render() {
    const { delegation } = this.props;
    const goods = GOODSTYPES.filter(gt => gt.value === Number(delegation.goods_type))[0];
    const transMode = TRANS_MODE.filter(tm => tm.value === delegation.trans_mode)[0];
    let doAwbText = '';
    if (delegation.trans_mode === '2') {
      if (CLAIM_DO_AWB.notClaimDO.key === delegation.claim_do_awb) {
        doAwbText = CLAIM_DO_AWB.notClaimDO.value;
      } else if (CLAIM_DO_AWB.claimDO.key === delegation.claim_do_awb) {
        doAwbText = CLAIM_DO_AWB.claimDO.value;
      }
    }
    if (delegation.trans_mode === '5') {
      if (CLAIM_DO_AWB.notClaimAWB.key === delegation.claim_do_awb) {
        doAwbText = CLAIM_DO_AWB.notClaimAWB.value;
      } else if (CLAIM_DO_AWB.claimAWB.key === delegation.claim_do_awb) {
        doAwbText = CLAIM_DO_AWB.claimAWB.value;
      }
    }
    return (
      <Card bodyStyle={{ padding: 16 }}>
        <Row>
          <Col span="8">
            <InfoItem label="运输方式" addonBefore={transMode && <MdIcon type={transMode.icon} />}
              field={transMode ? transMode.text : ''}
            />
          </Col>
          <Col span="8">
            <InfoItem label="提运单号" addonBefore={<Icon type="tag-o" />}
              field={delegation.bl_wb_no} dataIndex="bl_wb_no" placeholder="添加提运单号" editable onEdit={this.handleFill}
            />
          </Col>
          <Col span="8">
            <InfoItem label="运输工具名称" field={delegation.traf_name} editable placeholder="添加运输工具名称" dataIndex="traf_name" onEdit={this.handleFill} />
          </Col>
        </Row>
        {
            delegation.trans_mode === '2' &&
            <Row>
              <Col span="8">
                <InfoItem label="是否换单" field={doAwbText} />
              </Col>
              <Col span="8">
                <InfoItem label="海运单号" field={delegation.swb_no} />
              </Col>
            </Row>
            }
        <Row>
          <Col span="8">
            <InfoItem type="dropdown" label="货物类型"
              field={goods ? goods.text : ''} placeholder="选择货物类型" editable
              overlay={<Menu onClick={this.handleMenuClick}>
                {GOODSTYPES.map(gt => (<Menu.Item key={gt.value}>{gt.text}</Menu.Item>))}
              </Menu>}
            />
          </Col>
          <Col span="8">
            <InfoItem label="总件数"
              field={delegation.pieces} addonAfter="件" editable onEdit={this.handleFill} dataIndex="pieces"
            />
          </Col>
          <Col span="8">
            <InfoItem type="number" label="总重量"
              field={delegation.weight} dataIndex="weight" addonAfter="千克" placeholder="设置总重量" editable onEdit={this.handleFill}
            />
          </Col>
        </Row>
      </Card>
    );
  }
}