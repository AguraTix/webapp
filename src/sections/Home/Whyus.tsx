import React from 'react'
import WhyusCard from '../../components/shared/WhyusCard'
import {  MapPin } from 'lucide-react'
import { Bell } from 'lucide-react'
import { Smartphone } from 'lucide-react';

const Cards=[
    {
        icon:<Smartphone/>,
        title:"Seamless Ticket Buying",
        description:"Choose your seats,add-ons,and pay securely with Mobile Money or Card",
    },
    {
        icon:<MapPin/>,
        title:"Interactive Venue Experience",
        description:"Navigate venues,order food,and unlock benefits with QR wristbands",
    },
    {
        icon:<Bell/>,
        title:"Real-Time Updates",
        description:"Get event reminders,flash sales,and order statuses instantly",
    },
]
const Whyus = () => {
  return (
    <div className='flex flex-col gap-5 items-center justify-center p-10 w-full '>
      <h1 className='text-center text-2xl font-bold text-[#CDCDE0]'>Why Choose Us</h1>
      <div className='flex  flex-wrap md:flex-nowrap  gap-4 justify-center w-full items-center'>
        {Cards.map((card,index)=>(
            <WhyusCard key={index} {...card}/>
        ))}
      </div>
    </div>
  )
}

export default Whyus
