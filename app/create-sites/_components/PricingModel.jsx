import React from 'react'
import Lookup from '../assets_data/Lookup'
import { Button } from '@/components/ui/button'

function PricingModel () {
  return (
    <div className='mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5'>
        {Lookup.PRICING_OPTIONS.map((pricing, index) => (
            <div className='border p-7 rounded-xl flex-col gap-3 space-y-3'>
                <h2 className='font-bold text-2xl'>{pricing.name}</h2>
                <h2 className='font-medium text-lg'>{pricing.tokens} Tokens</h2>
                <p className='text-gray-600 dark:text-gray-400'>{pricing.desc}</p>
            
               <div className='flex flex-wrap justify-center mt-5 items-center gap-5'>
               <h2 className='font-bold text-3xl text-center'>${pricing.price}</h2>
               <Button className="bg-primary">Upgrade to {pricing.name}</Button>
               </div>
            </div>
        ))}
    </div>
  )
}

export default PricingModel