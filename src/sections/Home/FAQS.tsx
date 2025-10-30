import React, { useState } from 'react'

interface FaqsProps {
  question: string,
  answer: string
}
const Faqs: FaqsProps[] = [
  {
    question: "How do I buy a ticket?",
    answer: "Browse events, select your event, and follow the checkout process to purchase your ticket."
  },
  {
    question: "Can I get a refund?",
    answer: "Refunds depend on the event organizer's policy. Please check the event details for more information."
  },
  {
    question: "How do I access my ticket?",
    answer: "After purchase, your ticket will be available in your account and sent to your email."
  },
  {
    question: "Is my payment information secure?",
    answer: "Yes, we use industry-standard encryption to protect your payment details."
  }
]

const FAQS = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  return (
    <div className='p-10 flex justify-between items-center gap-5 flex-col md:flex-row'>
      <div className='space-y-3 text-start w-full'>
        <h1 className='text-4xl text-[#CDCDE0] font-bold'>FAQS</h1>
        <p className=' text-sm text-center md:text-start text-gray-300'>Know different questions that our customers like to ask themselves about our app and how do we manage them</p>
      </div>
      <div className='flex flex-col gap-5 w-full'>
        {Faqs.map((item, index) => (
          <div className='bg-[#101010] rounded-md text-gray-400 text-sm p-3 w-full ' key={index}>
            <div className='flex justify-between items-center'>
              <p className='font-medium'>{item.question}</p>
              <button
                className='text-lg font-bold'
                onClick={() => setOpenIndex(openIndex === index ? null : index)}>
                {openIndex === index ? "-" : "+"}
              </button>
            </div>
            {openIndex === index &&
              <p className='text-[#CDCDE0] mt-3 transition-all duration-300 ease-in-out'>{item.answer}</p>
            }
          </div>
        ))}
      </div>
    </div>
  )
}

export default FAQS
