import { createSlice ,PayloadAction } from "@reduxjs/toolkit"


interface initState {
    tableData : {[key:string]:any}
}

const initialState : initState = {
    tableData : []
}

const dsaSlice = createSlice({
    name : 'dsa',
    initialState,
    reducers : {
        setTableData : (state ,  action) =>{
            state.tableData = action.payload
        }
    }

})
export const {setTableData} = dsaSlice.actions
export default dsaSlice.reducer