
import { Table } from 'antd';
import { useState } from 'react';
function DataTable(props : any){
    const [pageSize , setPageSize] = useState(25)
    return (
        <div style={{}}>
            <Table
            title={props.title}
            columns={props.colDefs}
            dataSource={props.rowData}
            rowKey={(record)=>record.id}
            pagination={{ pageSize, onShowSizeChange: (_, size) => setPageSize(size) }}
            size="small"
            bordered
            />
        </div>
    )
}


export default DataTable
