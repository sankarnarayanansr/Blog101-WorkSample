import * as fs from 'fs';
interface Table {
    tHead: THead,
    tBodies: TBody,
    length: bigint
}
interface THead {
    children : any
}
interface TBody {
    children : any 
}
interface Rows{
    children : any
}

const readOrWriteJsonFile=(mode:string , jsonString:string , erase:boolean = false)=>{
    if (mode === 'read'){
        return JSON.parse(fs.readFileSync('ques.json','utf-8'))
    } else {
        if (erase && fs.existsSync('ques.json')){
            fs.renameSync('ques.json','ques1.json')
        }
        return fs.writeFileSync('ques.json',jsonString ,'utf-8')
        
    }

}

const updateJson= (id : string ,  key : string , value : string , type: string,data : any = false)=>{
   if (!data){
    var data :any = readOrWriteJsonFile('read' , '')
   }
    var idString = id
    for (var ques of Object.keys(data)){
        if (data[ques]['Title'] === id){
            idString = ques
            break
        }
    }
    
    ////console.log(data)
    if (typeof data[idString] !== 'object' || data[idString] === null) {
        data[idString] = {};
    }
    //console.log(data[idString])
    if (type == 'append'){
        if (data[idString].hasOwnProperty(key) && Array.isArray(data[idString][key])  ) {
            data[idString][key].push(value);
        } else {
            data[idString][key] = [value];
        }
    }
    //console.log(data[idString])
    return data
    

}
const fetchAllDetailsFromTable = (tableDom: Table , label : string = '' , erase:boolean = false , companies : boolean = false , topics : boolean=false , other:boolean = false) => {
    if (label.startsWith('ALL') || label.startsWith('NONE')){
        return 
    }
    var keys = Array.from(tableDom.tHead.children[0].children).map((element: any) => {
        var key = element.textContent.trim();
        if (key === '#'){
            key='id'
        }
        if (key === 'Frequency'){
            key='freq'
        }
        return key
    });
    var allques : any = {}
    var qid=1
    Array.from(tableDom.tBodies[0].children).map(( element: any ) => {
        var i = 0;
        var ques = {};
        ////console.log('childrens ', element.children)
        Array.from(element.children).map(( childElement: any) => {
            
            
            const links = childElement.querySelectorAll('a');
            var textContent : string = ''
            if (links.length == 0){
                textContent = childElement.textContent.trim();
            }
            links.forEach((link: HTMLAnchorElement) => {
                const hrefValue = link.getAttribute('href');
                if (hrefValue) {
                    textContent += `${link.textContent}::Link-${hrefValue},`;
                }
            });
            if (textContent != ''){
                ques[keys[i]] = textContent;
                
            }
            i += 1;
        });
        allques[qid++]=ques
        
    });
    ////console.log(allques)
    if (label === ''){
        const jsonstring = JSON.stringify(allques,null,2)
        readOrWriteJsonFile('write',jsonstring , erase)
        return 
    }
    if (Object.keys(allques).length > 0){
        ////console.log(allques)
        var filter = ''
        if (!companies && !topics && !other){
            //console.log('emoty filter')
            return 
        }
        if (companies){
            filter = 'companies'
        }
        if (topics){
            filter = 'topics'
        }
        if (other){
            filter = 'others'
        }
        var data = readOrWriteJsonFile('read' , '' )
        for (var ques of Object.keys(allques)){
            
            data = updateJson(allques[ques]['Title'] , filter , label , 'append',data)
        }
        readOrWriteJsonFile('write',JSON.stringify(data,null,4))
    }
    else {
        //console.log('label empty ', label)
    }
};


export { fetchAllDetailsFromTable, Table , THead , TBody , Rows }