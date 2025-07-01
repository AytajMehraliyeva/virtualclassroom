import React from 'react'
import Header from '../../layouts/Header/Header'
import {Outlet} from 'react-router'
import Footer from '../../layouts/Footer/Footer'
const SiteRoot = () => {
  return (
  <>
  
  <Outlet/>
  
  </>
  )
}

export default SiteRoot