import React from 'react';
import { Icon, Button, Dropdown, Menu } from 'antd';
import ExcelUploader from 'client/components/ExcelUploader';
import { createFilename } from 'client/util/dataTransform';

export default function WsItemExportButton(props) {
  function handleMenuClick(ev) {
    const wsItemExportUrl = `${API_ROOTS.default}v1/cms/tradeitem/workspace/export/item`;
    let query = '';
    if (props.repoId) {
      query = `repoId=${props.repoId}&`;
    }
    if (props.taskId) {
      query = `${query}taskId=${props.taskId}&`;
    }
    if (props.status) {
      query = `${query}status=${props.status}&`;
    }
    if (ev.key === 'unclassified') {
      window.open(`${wsItemExportUrl}/${createFilename('workItemsExport')}.xlsx?unclassified=true&${query}`);
    }
  }
  function handleWorkItemImport() {
    props.onUploaded();
  }
  const exptMenu = (
    <Menu onClick={handleMenuClick}>
      <Menu.Item key="unclassified">未归类物料</Menu.Item>
    </Menu>);
  return (<React.Fragment>
    <Dropdown overlay={exptMenu}>
      <Button icon="file-excel"> 导出 </Button>
    </Dropdown>
    <ExcelUploader
      endpoint={`${API_ROOTS.default}v1/cms/tradeitem/workspace/importitem`}
      formData={{ data: JSON.stringify({ }) }}
      onUploaded={handleWorkItemImport}
    >
      <Button ><Icon type="upload" /> 导入</Button>
    </ExcelUploader>
  </React.Fragment>);
}
