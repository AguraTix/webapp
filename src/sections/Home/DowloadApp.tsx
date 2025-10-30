import React from 'react'
import { Button } from '../../components/ui/Button'
const DowloadApp = () => {
  return (
    <div className='flex flex-col md:flex-row justify-between items-center p-10'>
      <div className='space-y-4 text-start'>
        <h1 className='text-gray-300 text-3xl font-bold'>Ready to Experience More</h1>
     <p className='text-gray-300 text-md '>Download the Agura App now and unlock seamless event discovery, easy ticket purchases, and in-event perks starting today!</p>
     <Button variant='secondary'>Download Our App</Button>
      </div>
      <div>
        <img src="/phone.png" alt="" />
      </div>
    </div>
  )
}

export default DowloadApp
