import { BookOpen, Users, BarChart3, Settings, ChevronRight } from 'lucide-react';
import { useLocation } from '@tanstack/react-router';

import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';

const navigationItems = [
  {
    name: 'Daybook',
    href: '/store-admin/daybook',
    icon: BookOpen,
    children: [
      { name: 'Overview', href: '/store-admin/daybook' },
      { name: 'Incoming', href: '/store-admin/incoming' },
      { name: 'Outgoing', href: '/store-admin/outgoing' },
    ],
  },
  {
    name: 'People',
    href: '/store-admin/people',
    icon: Users,
    activePaths: ['/store-admin/people'],
  },
  {
    name: 'Analytics',
    href: '/store-admin/analytics',
    icon: BarChart3,
  },
  {
    name: 'Settings',
    href: '/store-admin/settings',
    icon: Settings,
    activePaths: [
      '/store-admin/settings',
      '/store-admin/settings/rbac',
      '/store-admin/settings/profile',
      '/store-admin/settings/preferences',
    ],
  },
];

const AppSidebar = () => {
  const { pathname } = useLocation();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-2">
          <h1 className="text-lg font-semibold text-sidebar-foreground group-data-[collapsible=icon]:hidden">
            Coldop
            <span className="text-[10px] ml-1 font-medium text-muted-foreground">BETA</span>
          </h1>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => {
                const Icon = item.icon;

                if (item.children) {
                  const isActive =
                    pathname === item.href ||
                    item.children.some((c) => pathname.startsWith(c.href));

                  const defaultOpen =
                    pathname.startsWith('/store-admin/incoming') ||
                    pathname.startsWith('/store-admin/outgoing') ||
                    pathname === '/store-admin/daybook';

                  return (
                    <SidebarMenuItem key={item.name}>
                      <Collapsible defaultOpen={defaultOpen} className="group/collapsible">
                        <CollapsibleTrigger asChild>
                          <SidebarMenuButton
                            isActive={isActive}
                            variant="coldop-variant"
                            tooltip={item.name}
                            className="flex justify-between w-full"
                          >
                            <div className="flex items-center gap-2">
                              <Icon className="h-4 w-4" />
                              <span>{item.name}</span>
                            </div>
                            <ChevronRight className="h-4 w-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                          </SidebarMenuButton>
                        </CollapsibleTrigger>

                        <CollapsibleContent className="ml-6 mt-1 group-data-[collapsible=icon]:hidden">
                          {item.children.map((child) => {
                            const isChildActive = pathname === child.href;

                            return (
                              <SidebarMenuButton
                                key={child.name}
                                asChild
                                isActive={isChildActive}
                                size="sm"
                                className="pl-6"
                              >
                                <a href={child.href}>{child.name}</a>
                              </SidebarMenuButton>
                            );
                          })}
                        </CollapsibleContent>
                      </Collapsible>
                    </SidebarMenuItem>
                  );
                }

                const isActive =
                  pathname === item.href ||
                  (item.activePaths
                    ? item.activePaths.some((path) => pathname.startsWith(path))
                    : pathname.startsWith(item.href));

                return (
                  <SidebarMenuItem key={item.name}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      variant="coldop-variant"
                      tooltip={item.name}
                    >
                      <a href={item.href}>
                        <Icon className="h-4 w-4" />
                        <span>{item.name}</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

export default AppSidebar;
