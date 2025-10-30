import React from 'react'
interface TestimonyCardProps{
    testimony:string,
    profilePic:string,
    name:string,
    role?:string
}
const TestimonyCard = ({testimony,profilePic,name,role}:TestimonyCardProps) => {
  return (
    <div className='flex flex-col gap-2 rounded-lg bg-primary p-3 text-white shadow-lg transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:bg-primary/90'>
      <img src="/rating.png" alt="" className='w-20 h-4' />
      <p className='text-sm font-light'>{testimony}</p>
      <div className='flex items-center gap-2 text-sm font-bold'>
        <img src={profilePic} alt="" className='border border-2 border-white rounded-full '/>
        <span>{name}</span>
        <span className='border-l-2 pl-2'>{role}</span>
      </div>
    </div>
  )
}

export default TestimonyCard
