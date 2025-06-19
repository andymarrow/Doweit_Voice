import React from 'react'
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarHeader,
  } from "@/components/ui/sidebar"
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { MessageCircleCode } from 'lucide-react'
import WorkspaceHistory from './WorkspaceHistory'
import SideBarFooters from './SideBarFooters'

function AppSideBar () {
  return (
    <Sidebar>
      <SidebarHeader className="p-5">
            <Image src={'/logo.svg'} width={230} height={230} />
            <Button className="mt-5"><MessageCircleCode/>New Chat</Button>
      </SidebarHeader>
      <SidebarContent className="p-5">
        <SidebarGroup>

            <WorkspaceHistory/>
        </SidebarGroup>
        {/* <SidebarGroup /> */}
      </SidebarContent>
      <SidebarFooter>
        <SideBarFooters/>
      </SidebarFooter>
    </Sidebar>
  )
}

export default AppSideBar