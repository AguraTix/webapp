
import { Button } from '../../components/ui/Button'

const Hero = () => {
  const heroButtons=[
    {
      title:"Download our App",
      variant:"secondary"
    },{
      title:"Get Started",
      variant:"primary"
    }
  ]
  return (
    <div className=' flex items-center p-10 justify-between w-full md:flex-row md:flex-nowrap flex-wrap'>
      <div className='flex flex-col gap-6 items-start'>
        <span className='rounded-full text-primary bg-[#101010] text-xs py-2 px-3'>Online event ticketing platform</span>
        <h1 className='text-white font-bold text-4xl'>Enjoy Endless Events Experiences <span className='block'>with <span className='text-primary'>Agura</span></span></h1>
        <p className='text-sm text-gray-200'>Discover,purchase, and enjoy tickets for you favorite events on our seemless platform</p>
        <div className='flex md:flex-row flex-col items-center gap-3'>
         {
          heroButtons.map((items,index)=>(
            <Button key={index} variant={items.variant}>{items.title}</Button>
          ))
         }
        </div>
      </div>

      <div className='flex '>
        <img src="/left.png" alt="" className='translate-x-10 ' />
        <div className="relative">
          <img src="/event1.png" alt="" className="z-10" />
          <div className="flex flex-col gap-2 absolute bottom-4 left-4 z-20 bg-black bg-opacity-60 p-3 rounded">
            <span className="text-[#CDCDE0] font-bold text-sm">Summer Event</span>
            <span className="text-xs text-[#CDCDE0]">10-May-2025</span>
            <span className="text-xs text-[#CDCDE0]">Serena Hotel Kigali</span>
          </div>
        </div>
        <img src="/right.png" alt="" className='-translate-x-10'/>
      </div>
    </div>
  )
}

export default Hero
