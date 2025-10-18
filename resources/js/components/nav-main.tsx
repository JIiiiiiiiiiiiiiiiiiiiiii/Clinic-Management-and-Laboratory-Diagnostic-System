import { ChevronRightIcon, type LucideIcon } from "lucide-react"
import { Link, usePage } from "@inertiajs/react"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"

export function NavMain({
  items = [],
}: {
  items?: {
    title: string
    href?: string
    url?: string
    icon?: LucideIcon
    isActive?: boolean
    items?: {
      title: string
      href?: string
      url?: string
    }[]
  }[]
}) {
  const page = usePage<any>();
  const currentUrl = page.url;

  // Function to check if any sub-item is active
  const isSubItemActive = (subItems: any[]) => {
    return subItems?.some(subItem => {
      const subUrl = subItem.href || subItem.url;
      return subUrl && currentUrl.startsWith(subUrl);
    }) || false;
  };

  return (
    <SidebarGroup>
      <SidebarMenu>
        {items?.map((item) => {
          // Only open if the current URL matches this item or any of its sub-items
          const shouldBeOpen = item.url && currentUrl.startsWith(item.url) || 
                              (item.items && isSubItemActive(item.items));
          
          return (
            <Collapsible
              key={item.title}
              asChild
              defaultOpen={shouldBeOpen}
              className="group/collapsible"
            >
            <SidebarMenuItem>
              {item.items ? (
                <>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton tooltip={item.title} asChild>
                      <Link href={item.href || item.url || '#'}>
                        {item.icon && <item.icon />}
                        <span>{item.title}</span>
                        <ChevronRightIcon className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                      </Link>
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {item.items?.map((subItem) => (
                        <SidebarMenuSubItem key={subItem.title}>
                          <SidebarMenuSubButton asChild>
                            <Link href={subItem.href || subItem.url || '#'}>
                              <span>{subItem.title}</span>
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </>
              ) : (
                <SidebarMenuButton tooltip={item.title} asChild>
                  <Link href={item.href || item.url || '#'}>
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              )}
            </SidebarMenuItem>
            </Collapsible>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}
