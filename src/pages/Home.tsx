import React from 'react'
import Navbar from '../components/layout/Navbar'
import Hero from '../sections/Home/Hero'
import Whyus from '../sections/Home/Whyus'
import DowloadApp from '../sections/Home/DowloadApp'
import Testimonials from '../sections/Home/Testimonials'
import FAQS from '../sections/Home/FAQS'
import Footer from '../components/layout/Footer'
const Home = () => {
  return (
    <div className='mx-auto px-10 py-2 text-opacity-35'>
      <Navbar/>
      <Hero/>
      <Whyus/>
      <DowloadApp/>
      <Testimonials/>
      <FAQS/>
      <Footer/>
    </div>
  )
}

export default Home
