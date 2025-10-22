"use client"

import * as React from "react"
import { ChevronRightIcon, LucideIcon } from "lucide-react"
import { Link, usePage } from "@inertiajs/react"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"

export function NavSecondary({
  items = [],
  ...props
}: {
  items?: {
    title: string
    url?: string
    icon: LucideIcon
    isActive?: boolean
    show?: boolean
    items?: {
      title: string
      url: string
      show?: boolean
    }[]
  }[]
} & React.ComponentPropsWithoutRef<typeof SidebarGroup>) {
  const page = usePage<any>();
  const currentUrl = page.url;

  // Function to check if any sub-item is active
  const isSubItemActive = (subItems: any[]) => {
    return subItems?.some(subItem => {
      const subUrl = subItem.href || subItem.url;
      return subUrl && currentUrl.startsWith(subUrl);
    }) || false;
  };

  // State to track which items are open - start with all closed
  const [openItems, setOpenItems] = React.useState<string[]>([]);

  const toggleItem = (itemTitle: string) => {
    setOpenItems(prev => 
      prev.includes(itemTitle) 
        ? prev.filter(title => title !== itemTitle)
        : [...prev, itemTitle]
    );
  };

  return (
    <SidebarGroup {...props}>
      <SidebarGroupContent>
        <SidebarMenu>
          {items?.filter(item => item.show !== false).map((item) => {
            const isOpen = openItems.includes(item.title);
            
            return (
              <Collapsible
                key={item.title}
                asChild
                open={isOpen}
                onOpenChange={() => toggleItem(item.title)}
                className="group/collapsible"
              >
              <SidebarMenuItem>
                {item.items ? (
                  <>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton tooltip={item.title} size="sm">
                        <item.icon />
                        <span>{item.title}</span>
                        <ChevronRightIcon className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {item.items?.filter(subItem => subItem.show !== false).map((subItem) => (
                          <SidebarMenuSubItem key={subItem.title}>
                            <SidebarMenuSubButton asChild>
                              <Link href={subItem.url || '#'}>
                                <span>{subItem.title}</span>
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </>
                ) : (
                  <SidebarMenuButton tooltip={item.title} asChild size="sm">
                    <Link href={item.url || '#'}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                )}
              </SidebarMenuItem>
            </Collapsible>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
