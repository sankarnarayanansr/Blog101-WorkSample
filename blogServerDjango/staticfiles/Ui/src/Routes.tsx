import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import { RouteComponent } from './Types';
import constants from './Constants';
import DSA from './apps/dsa';
function renderRoute(){
    return (
        <Routes>
            {
            constants.routesToComponents.map((route) => {
                const Component = constants.componentsMap[route.component];
                return (<Route key={route.route} path={route.route} element={<Component/>} />)
            })
            }
            <Route key={'/'} path='/' element={<DSA/>}/>
        </Routes>
    )


}

export default renderRoute