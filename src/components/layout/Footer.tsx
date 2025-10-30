import { MapPin } from 'lucide-react';

import { Phone } from 'lucide-react';
import { Printer } from 'lucide-react';
import { Facebook } from 'lucide-react';
import { Twitter } from 'lucide-react';
import { Linkedin } from 'lucide-react';
import { Youtube } from 'lucide-react';
import { Instagram } from 'lucide-react';
import { NavLink } from 'react-router-dom';

const Footer = () => {
    const footerLinks=[
        {
            link:"#",
            name:"ABOUT US"
        },
        {
            link:"#",
            name:"CONTACT US"
        },
        {
            link:"#",
            name:"EVENTS"
        },
        {
            link:"#",
            name:"PRIVACY POLICY"
        }
    ]

    const socialMediaIcons=[
        <Facebook/>,
        <Twitter/>,
        <Linkedin/>,
        <Youtube/>,
        <Instagram/>
    ]
  return (
    <div className='p-4 md:p-10'>
     <div className='p-4 md:p-10 flex flex-col md:flex-row md:items-center md:justify-center border-y border-[#CDCDE0] gap-6 md:gap-0'>
    <div className='w-full md:w-1/3 flex items-center justify-center md:justify-start mb-4 md:mb-0'>
        <img src="/logo.png" alt=""  height={50} width={150}/>
    </div>  
    <div className='w-full md:w-2/3 flex flex-col gap-2 text-xs text-gray-300'>
        <p className='flex gap-2 items-center justify-center md:justify-start'>
            <span>
                <MapPin className='text-[#CDCDE0] h-5 w-5 font-bold'/>
            </span>
            345 Faulconer Drive, Suite 4 • Charlottesville, CA, 12345
            </p>
            <div className='flex flex-col sm:flex-row gap-2 sm:gap-20 justify-center md:justify-start'>
            <p className='flex gap-2 items-center justify-center sm:justify-start'>
            <span>
                <Phone className='text-[#CDCDE0] h-5 w-5 font-bold'/>
            </span>
            (123) 456-7890
            </p>

            <p className='flex gap-2 items-center justify-center sm:justify-start'>
            <span>
                <Printer className='text-[#CDCDE0] h-5 w-5 font-bold'/>
            </span>
            (123) 456-7890
            </p>
            </div>
            <div className='flex flex-col sm:flex-row gap-2 items-center justify-center md:justify-start'>
                <span className='text-[#CDCDE0] opacity-70'>Social Media</span>
              <div className='gap-2 flex'> {
                socialMediaIcons.map((item,index)=>(
                    <div key={index} className=''>{item}</div>
                ))
               }</div>
            </div>
   </div>  
    </div> 
   <div className='flex flex-col md:flex-row justify-between items-center py-3 gap-2 md:gap-0'>
   <div className='flex flex-wrap gap-4 text-xs text-white font-semibold justify-center md:justify-start'>
{
    footerLinks.map((item,index)=>(
        <NavLink to={item.link} key={index} className= "hover:text-primary hover:text-bold text-center">{item.name}</NavLink>
    ))
}
    </div>
    <p className='text-white text-sm text-center md:text-right'>Copyright &copy; {new Date().getFullYear()}. AguraEvents.com</p>
   </div>
    </div>
  )
}

export default Footer
