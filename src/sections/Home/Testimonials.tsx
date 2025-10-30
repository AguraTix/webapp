import React from 'react'
import TestimonyCard from '../../components/shared/TestimonyCard'

const Testimoniews=[
{
    testimony:"I've been using the Agura app for a few months now, and I've been really impressed with the user experience. The app is very easy to use and the interface is very intuitive. I've also been able to find some great events that I wouldn't have otherwise known about.",
    profilePic:"/pp.png",
    name:"John Doe",
    role:"CTO"
},
{
    testimony:"I've been using the Agura app for a few months now, and I've been really impressed with the user experience. The app is very easy to use and the interface is very intuitive. I've also been able to find some great events that I wouldn't have otherwise known about.",
    profilePic:"/pp.png",
    name:"John Doe",
    role:"CTO"
},
{
    testimony:"I've been using the Agura app for a few months now, and I've been really impressed with the user experience. The app is very easy to use and the interface is very intuitive. I've also been able to find some great events that I wouldn't have otherwise known about.",
    profilePic:"/pp.png",
    name:"John Doe",
    role:"CTO"
},
]
const Testimonials = () => {
  return (
    <div className='p-10 flex flex-col gap-3 justify-center items-center w-full'>
      <h1 className='text-[#CDCDE0] font-bold text-2xl text-center'>What our Clients Say About us?</h1>
      <p className='text-md text-[#CDCDE0] text-center'>Get to know what different customers who used our app say about agura ticketing platform</p>
<div className='flex  flex-wrap md:flex-nowrap  gap-4 justify-center w-full items-center'>
    {Testimoniews.map((testimony,index)=>(
        <TestimonyCard key={index} {...testimony}/>
    ))}
</div>
    </div>
  )
}

export default Testimonials
