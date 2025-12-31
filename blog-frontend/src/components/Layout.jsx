import React from "react";
import Header from "./Header/Header.jsx";
import Footer from "./Footer/Footer.jsx";
import SideBar from './Sidebar/SideBar.jsx'

const Layout = ({ children }) => {
  return (
    <>
      <Header />
      <SideBar />
      <main >{children}</main>
      <Footer />
    </>
  );
};

export default Layout;
