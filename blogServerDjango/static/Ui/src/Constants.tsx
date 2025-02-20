
import DSA from "./apps/dsa"

const constants = {
    'routesToComponents' : [
        {
            'route' : '/dsa',
            'component' : 'dsa'
        }
    ] ,
    'componentsMap'  :
     {
         'dsa': DSA
     } as unknown as { [key: string]: React.ComponentType<any> } ,

     'tableColumns' : {
        'DSA' : {
            'Id' : 'id' , 
            'Title' : 'Title', 
            'Difficulty':'Difficulty', 
            'Rate':'freq'
        }
     }

}

export default constants