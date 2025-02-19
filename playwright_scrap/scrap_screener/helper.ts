import * as fs from 'fs'

const keyMap = {

    '1Yr return' : 'Returns:1Year',
    '3Yrs return' : 'Returns:3Years',
    '5Yrs return' : 'Returns:5Years',
    '1day return' : 'Returns:1Day',
    '1wk return' : 'Returns:1Week',
    '1mth return' : 'Returns:1Month',
    '3mth return' : 'Returns:3Month',
    '6mth return' : 'Returns:6Month',
    'P/E' : 'PE Ratio',
    'Div Yld' : 'Dividend Yield',
    'Qtr Profit' : 'Avg Quarter Profit',
    'Qtr Sales' : 'Avg Quarter Sales',
    'mar cap' : 'Market Cap',
    "CMP" : "Price",
    "NP Qtr" : "Net Profit Quarter",
    "ROCE":"ROCE",
    "Pat" : "Profit After Tax"




}



function remapKey(key){

    var keys = Object.keys(keyMap)
    for(var sKey of keys){
        if (key.toLowerCase().indexOf(sKey.toLowerCase()) != -1){
            return keyMap[sKey]
        }
    }
    return null

}

function remapKeysOfObject(obj){
    var newObject = {}
    for (var key of Object.keys(obj)){
        var newkey = remapKey(key)
        if (newkey == null){
            newObject[key] = obj[key]
        } else {
            newObject[newkey] = obj[key]
        }
    }
    return newObject
}

const readOrWriteJsonFile=(mode:string , jsonString:string , erase:boolean = false)=>{
    if (mode === 'read'){
        return JSON.parse(fs.readFileSync('stock.json','utf-8'))
    } else {
        
        return fs.writeFileSync('stock.json',jsonString ,'utf-8')
        
    }

}

const updateData=(completeData , newData , allCompanies : Set<string>)=>{
    if (allCompanies.size){
        if (allCompanies.has(newData['company'])){
            return [completeData , allCompanies]
        }
        else{
            allCompanies.add(newData['company'])
        }
    }
    else{
        allCompanies = new Set()
        for (var data in completeData){
            allCompanies.add(data['company'])
        }
    }
    completeData.push(newData)
    return [completeData , allCompanies]

}
export {remapKey , updateData , readOrWriteJsonFile , remapKeysOfObject}