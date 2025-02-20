

import axios, { Axios } from "axios"


var AjaxHelpers = {
    'sendRequest' : async (url : string , params : {[key:string]: string } , method : string = 'post', query:string = 'data')=>{
        var data : {[key:string]:any}   = await axios.request({
            url: url,
            method: method,
            data: params
        })
        console.log(data)
        return data[query] 

    }



}
export default AjaxHelpers