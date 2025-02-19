import { Content } from "antd/es/layout/layout"
import constants from "../../Constants"
import { Anchor, Row, Col, Slider, Form, Select, Input, Button, Popover, Divider } from "antd"
import { CommentOutlined, FileExcelOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from "react-redux"
import { RootState } from "../../store/store"
import { useEffect, useState } from "react"
import AjaxHelpers from "../../AjaxHelpers"
import { setTableData } from "../../slices/dsaSlice"
import DataTable from "../../common/Table"
import { OptionType } from "../../Types"
import { CSVLink } from 'react-csv';
import { Typography } from 'antd';
import CardWithStats from "../../common/CardWithStats";

const { Title } = Typography;


const { Link } = Anchor
const marks = {
    0: '0',
    1: '1',
    2: '2',
    3: '3',
    4: '4',
    5: '5',
    
};

interface DataItem {
    key: string;
    [key: string]: any;
}

const filterKeyValues = (data: any[], keys: string[]) => {
    return data.map(item => {
        const filteredItem: any = {};
        keys.forEach(key => {
            if (key in item) {
                filteredItem[key] = item[key];
            }
        });
        return filteredItem;
    });
};
const collectAllFilters = (data: any[], type: string) => {
    
    var allFilters: Set<string> = new Set()
    data.map((item: any) => {
        if (type in item){
        item[type].map((filter: any) => {
            allFilters.add(filter)
        })
    }
    })
    var allOptions: OptionType[] = Array.from(allFilters).map((item) => {
        return { label: item, value: item }
    })
    return allOptions

}

const filterData = (data : any , companiesFilter : string[] , topicsFilter : string[] , otherFilter : string[] , rateFilter : any[] , searchInput : string ) =>{
    const intersection = (setA: Set<string>, setB: Set<string>) => {
        const _intersection = new Set<string>();
        setB.forEach((elem)=>{
            if (setA.has(elem)) {
                _intersection.add(elem);
            }
        })
        return _intersection;
    };
    var filterData:any[] = []
    var count = 0
    var statsByDifficulty : {[key:string]:number} = {
        'easy' : 0,
        'medium' :0 ,
        'hard': 0
    }
    var statsByTopics : {[key:string]:number} = {}
   
    for (var item of data){
        var flag = 1
        
        if (companiesFilter.length > 0){
            count = 1
            const setA  : Set<string>= new Set(item['companies'])
            const setB : Set<string> = new Set(companiesFilter)
            const common : Set<string> = intersection(setA,setB)
            
            if (common.size != setB.size){
                if (flag == 1){
                flag = 0
                }
            }
        }
        if (topicsFilter.length > 0){
            count = 1
            const setA  : Set<string>= new Set(item['topics'])
            const setB : Set<string> = new Set(topicsFilter)
            const common : Set<string> = intersection(setA,setB)
            if (common.size != setB.size){
                if (flag == 1){
                    flag = 0
                    continue
                }
            }
        }
        if (otherFilter.length > 0){
            count = 1
            const setA  : Set<string>= new Set(item['others'])
            const setB : Set<string> = new Set(otherFilter)
            const common : Set<string> = intersection(setA,setB)
            if (common.size != setB.size){
                if (flag == 1){
                    flag = 0
                    continue
                }
            }
        }
        if (searchInput.length > 0){
            count = 1
            if (item['Title'].toLowerCase().split('::')[0].indexOf(searchInput) == -1){
                if (flag == 1){
                    flag = 0
                    continue
                }
            }
        }
        if (rateFilter[0]>0 || rateFilter[1]<10){
            
            count = 1
            if (!(parseFloat(item['freq']) >= rateFilter[0] && parseFloat(item['freq']) <= rateFilter[1])) {
                if (flag == 1){
                    flag = 0
                    continue
                }
            }
        }
        if (flag == 1){
            filterData.push(item)
            if (item['Difficulty'] == 'E'){
                statsByDifficulty['easy']+=1
            } else if (item['Difficulty'] == 'M'){
                statsByDifficulty['medium']+=1
            } else{
                statsByDifficulty['hard']+=1
            }
            for (var topic of item['topics']){
                if (!(topic in statsByTopics)){
                    statsByTopics[topic] = 1
                }
                else {
                    statsByTopics[topic] += 1
                }
            }
        }
        
    }
    if (count == 0){
        return [data , statsByDifficulty , statsByTopics]
    }
    return [filterData , statsByDifficulty , statsByTopics]


}
function DSA() {
    const dispatch = useDispatch()
    const [companyFilters, setCompanyFilters] = useState<OptionType[]>([])
    const [topicFilters, setTopicFilters] = useState<OptionType[]>([])
    const [otherFilters, setOtherFilters] = useState<OptionType[]>([])
    const [selectedRate, setSelectedRate] = useState([0, 10])
    const [searchInput, setSearchInput] = useState("")
    const [fileName , setFileName] = useState("")
    const [selectedCompanyFilters, setSelectedCompanyFilters] = useState([])
    const [selectedTopicFilters, setSelectedTopicFilters] = useState([])
    const [selectedOtherFilters, setSelectedOtherFilters] = useState([])
    var tableData = useSelector((state: RootState) => state.dsa.tableData)
    var dsaTableColumns: { [key: string]: string } = constants.tableColumns['DSA']
    var columnDefs: { dataIndex: string; title: string; key: string; sorter: ((a: DataItem, b: DataItem) => any) | boolean; render?: (title: any) => JSX.Element }[] = Object.keys(dsaTableColumns).map((item) => {
        return {
            'dataIndex': dsaTableColumns[item],
            'title': item.toString(),
            'key': dsaTableColumns[item],
            sorter: (a: DataItem, b: DataItem) => {
                const aValue = a[dsaTableColumns[item]];
                const bValue = b[dsaTableColumns[item]];

                const aFloat = parseFloat(aValue)
                const bFloat = parseFloat(bValue)
                if (!isNaN(aFloat) && !isNaN(bFloat)) {
                    return aFloat - bFloat
                }
                if (typeof aValue === 'string' && typeof bValue === 'string') {
                    return aValue.localeCompare(bValue);
                }
                return 0;
            },

        }
    })

    columnDefs = columnDefs.map((item : any) => {
        const dataIndex: string = typeof item['dataIndex'] === 'string' ? item['dataIndex'] : '';
        if (item['dataIndex'] == 'Title') {
            item = {
                ...item, 'render': (title : any) => {
                    
                    title = title.split('::')
                    return (
                        <Link href={`${title[1].split('Link-').pop().slice(0,-1)}`} title={`${title[0]}`}></Link>
                    )
                }
            }
        }
        

        return item;
    })
    useEffect(() => {
        const fetchData = async () => {
            const data = await AjaxHelpers.sendRequest('http://127.0.0.1:8000/api/dsa/getall', {})
            const keys = Object.keys(data)
            const lData: any[] = []
            for (const key of keys) {
                data[key]['key'] = key
                data[key]['freq'] = ((data[key]['freq'] * 5) / 10).toFixed(2);
                lData.push(data[key])
            }
            dispatch(setTableData(lData))
            var companyFilters: OptionType[] = collectAllFilters(lData, 'companies')
            var topicFilters: OptionType[] = collectAllFilters(lData, 'topics')
            var otherFilters: OptionType[] = collectAllFilters(lData, 'others')
            setCompanyFilters(companyFilters)
            setTopicFilters(topicFilters)
            setOtherFilters(otherFilters)
        }
        if (tableData.length == 0) {
            fetchData()
        }

    })
    const handleFilterChange = (e: any, filterName: string) => {
        if (filterName == 'companies') {
            setSelectedCompanyFilters(e)
        } else if (filterName == 'topics') {
            setSelectedTopicFilters(e)
        } else if (filterName == 'other') {
            setSelectedOtherFilters(e)
        } else if (filterName == 'rate') {
            setSelectedRate(e)
        } else {
            setSearchInput(e.target.value)
        }
    }
    
    console.log( selectedCompanyFilters , selectedTopicFilters ,selectedOtherFilters,selectedRate,searchInput)
    var [filteredData , statsByDifficulty , statsByTopics] = filterData(tableData , selectedCompanyFilters , selectedTopicFilters ,selectedOtherFilters,selectedRate,searchInput)
    console.log('filter ',filteredData ,  statsByDifficulty , statsByTopics)
    
    return (
        <Content style={{ height: '100vh', padding: '24px', background: '#fff' }}>
            <div className="tableFilter">
                <Row className='filterRow'>
                    <Col span={8} className="filterSelect">
                        <Select
                            mode="multiple"
                            style={{ width: '100%' }}
                            placeholder="Filter Company"
                            defaultValue={[]}
                            options={companyFilters}
                            onChange={(e) => handleFilterChange(e, 'companies')}
                        />
                    </Col>
                    <Col span={9} className="filterSelect">
                        <Select
                            mode="multiple"
                            style={{ width: '100%' }}
                            placeholder="Filter Topics"
                            defaultValue={[]}
                            options={topicFilters}
                            onChange={(e)=> handleFilterChange(e, "topics")}
                        />
                    </Col>
                    <Col span={5} className="filterSelect">
                        <Select
                            mode="multiple"
                            style={{ width: '100%' }}
                            placeholder="Other Filter"
                            defaultValue={[]}
                            options={otherFilters}
                            onChange={(e)=> handleFilterChange(e, "other")}
                        />
                    </Col>
                    

                </Row>
                <Row className="filterRow">
                <Col  className="filterSelect">
                <Popover placement="bottom" title={'Download Excel'} content={(
                    <div style={{width:'100%'}}>
                        <Input placeholder="Filename to Save!!" onChange={(e)=>{
                            setFileName(e.target.value)
                        }} value={fileName} style={{width:'70%'}}/><CSVLink
                        data={filterKeyValues(filteredData, ['id','Title','Difficulty','freq'])}
                        filename={`${fileName}.csv`}
                        className="btn btn-primary"
                    > <Button type="primary" disabled={fileName.length == 0}>Save</Button></CSVLink>
                    </div>
                )} >
                    
                <Button type={"primary"} icon={<FileExcelOutlined />}> Export Data</Button>
                
                </Popover>
                        
                    </Col>
                    <Col span={14} className="filterSelect">
                        <Input placeholder="Search Question" onChange={(e)=> handleFilterChange(e , "input")} />
                    </Col>
                    <Col span={6} className="filterSelect rateFilter">
                        <Form.Item label="Rate">
                            <Slider
                                range
                                min={0}
                                max={5}
                                step={0.1}
                                defaultValue={[0, 5]}
                                marks={marks}
                                onChangeComplete={(e)=>handleFilterChange(e,"rate")}
                            /></Form.Item>
                    </Col>
                   
                </Row>
            </div>
           
            <Title level={5} style={{float:'left'}}>Found {filteredData.length} Entries</Title>
            <div style={{width:'100%',display:'flex'}}>
            <div className="tableWrapper" style={{width:'70%'}}>
                <div className='table'>
                    <DataTable  colDefs={columnDefs} rowData={filteredData} />
                </div>
            </div>
            <div style={{width:'30%'}}><CardWithStats title={'Stats By Difficulty'} data={statsByDifficulty} max={15}/>
            <CardWithStats title={'Stats By Topics'} data={statsByTopics} max={15}/> </div>
            </div>
        </Content>
    )
}


export default DSA