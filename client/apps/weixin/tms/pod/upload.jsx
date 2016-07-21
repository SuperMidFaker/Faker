/* eslint no-undef: 0 */
import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Upload, Icon, message } from 'antd';
import { saveSubmitPod } from 'common/reducers/trackingLandStatus';

import WeUI from 'react-weui';
import '../../weui.less';

const { Cells, CellsTitle, Cell, CellBody, CellFooter, TextArea,
Button, Select } = WeUI;

@connect(
  state => ({
    submitter: state.account.username,
    dispId: state.weixin.pod.dispId,
    parentDispId: state.weixin.pod.parentDispId,
    shipmtNo: state.weixin.pod.shipmtNo,
  }),
  { saveSubmitPod }
)
export default class UploadPod extends React.Component {
  static propTypes = {
    dispId: PropTypes.number.isRequired,
    parentDispId: PropTypes.number,
    shipmtNo: PropTypes.string.isRequired,
    saveSubmitPod: PropTypes.func.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  state = {
    signStatus: '',
    remark: '',
    photoList: [],
  }
  componentDidMount() {
    $('title').text(this.props.shipmtNo);
  }
  handleNavigationTo(to, query) {
    this.context.router.push({ pathname: to, query });
  }
  handleFieldChange = (ev) => {
    this.setState({ remark: ev.target.value });
  }
  handleSignSelectChange = ev => {
    this.setState({ signStatus: ev.target.value });
  }
  handlePhotoUpload = info => {
    if (info.file.status === 'done' && info.file.response) {
      if (info.file.response.status === 200) {
        const photos = [...this.state.photoList];
        photos.push({
          uid: info.file.uid,
          name: info.file.name,
          status: 'done',
          url: info.file.response.data,
        });
        this.setState({ photoList: photos });
      } else {
        message.error(info.file.response.msg);
      }
    }
  }
  handleOk = () => {
    const { shipmtNo, submitter, dispId, parentDispId } = this.props;
    const { signStatus, remark, photoList } = this.state;
    const photos = photoList.map(ph => ph.url).join(',');
    this.props.saveSubmitPod(shipmtNo, dispId, parentDispId, submitter,
                             signStatus, remark, photos).then(
      result => {
        if (result.error) {
          message.error(result.error.message);
        } else {
          this.context.router.push({ pathname: '/weixin/tms/pod/uploadSucceed' });
        }
      });
  }
  render() {
    const { signStatus, remark } = this.state;
    return (
      <div className="panel-body">
        <form>
          <CellsTitle>签收状态</CellsTitle>
          <Cells access>
            <Cell className="">
              <CellBody>
                <Select defaultValue={signStatus} onChange={this.handleSignSelectChange}>
                    <option value={1}>正常签收</option>
                    <option value={2}>异常签收</option>
                    <option value={3}>拒绝签收</option>
                </Select>
              </CellBody>
              <CellFooter />
            </Cell>
          </Cells>
          <CellsTitle>拍摄回单</CellsTitle>
          <Cells>
            <Cell className="">
              <CellBody>
                <Upload action={`${API_ROOTS.default}v1/upload/img`} listType="picture-card"
                  onChange={this.handlePhotoUpload} fileList={this.state.photoList} withCredentials
                >
                  <Icon type="plus" />
                  <div className="ant-upload-text">上传照片</div>
                </Upload>
              </CellBody>
            </Cell>
          </Cells>
          <CellsTitle>签收备注</CellsTitle>
          <Cells>
            <Cell className="">
              <CellBody>
                <TextArea placeholder="货差/货损/拒绝原因" rows="3" maxlength="500" value={remark} onChange={this.handleFieldChange} />
              </CellBody>
            </Cell>
          </Cells>
        </form>
        <div className="button" style={{ marginTop: '20px' }}>
          <Button type="primary" onClick={this.handleOk}>
            确定
          </Button>
          <Button type="default" onClick={() => { this.context.router.goBack(); }}>
            取消
          </Button>
        </div>
      </div>
    );
  }
}
