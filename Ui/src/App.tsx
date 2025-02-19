import React from 'react';
import logo from './logo-no-background.png';
import './App.css';
import { BrowserRouter as Router, Route, Link } from 'react-router-dom';
import { Breadcrumb, Layout, Menu, theme } from 'antd';
import renderRoute from './Routes';
import constants from './Constants';
const { Header, Content, Footer } = Layout;




const App: React.FC = () => {
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  return (
    <Router>
      <div className="App">
    <Layout>
      <Header style={{ display: 'flex', alignItems: 'left' }}>
        <div className="demo-logo" >
          <img src={logo} height={30} width={120} style={{marginTop:17}} />
        </div>
        <Menu
          theme="dark"
          mode="horizontal"
          style={{ flex: 1, minWidth: 0 }}
        >
          {
            constants.routesToComponents.map((item)=>{
              return <Link to={item.route}>
                <Menu.Item>{item.component}</Menu.Item>
              </Link>
            })
          }
        </Menu>
      </Header>
      
      {renderRoute()}
    </Layout>
    </div>
    
    </Router>
  );
};
export default App;
