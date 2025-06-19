import { UserButton } from '@clerk/nextjs'
import React from 'react'
import AddBiography from './_components/AddBiography'
import ADDManyStuff from './_components/AddManyStuff'

export default function page() {
  return (
    <div>
      <AddBiography />
      <ADDManyStuff />
    </div>
  )
}
