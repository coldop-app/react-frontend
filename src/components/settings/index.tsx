'use client';

import { useNavigate } from '@tanstack/react-router';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import {
  User,
  Sliders,
  Warehouse,
  Layers,
  Users,
  CreditCard,
  BarChart3,
  Settings as SettingsIcon,
} from 'lucide-react';

/**
 * Settings navigation config
 * Each card maps to a dedicated settings route
 */
const settings = [
  {
    title: 'Profile Settings',
    description: 'Manage your personal information, password, and account security.',
    icon: User,
    path: '/store-admin/settings/profile',
  },
  {
    title: 'Preferences',
    description: 'Customize language, date format, default views, and notifications.',
    icon: Sliders,
    path: '/store-admin/settings/preferences',
  },
  {
    title: 'Storage Configuration',
    description: 'Configure chambers, floors, rows, and storage capacity.',
    icon: Warehouse,
    path: '/store-admin/settings/storage',
  },
  {
    title: 'Inventory Rules',
    description: 'Define stock limits, alerts, and inventory movement rules.',
    icon: Layers,
    path: '/store-admin/settings/inventory-rules',
  },
  {
    title: 'Users & Roles',
    description: 'Manage operators, admins, and access permissions.',
    icon: Users,
    path: '/store-admin/settings/users',
  },
  {
    title: 'Billing & Payments',
    description: 'Configure payment methods, credit rules, and transactions.',
    icon: CreditCard,
    path: '/store-admin/settings/billing',
  },
  {
    title: 'Reports & Analytics',
    description: 'Control report formats, exports, and analytics preferences.',
    icon: BarChart3,
    path: '/store-admin/settings/reports',
  },
  {
    title: 'System Settings',
    description: 'Manage application-wide defaults and system behavior.',
    icon: SettingsIcon,
    path: '/store-admin/settings/system',
  },
];

const SettingsPage = () => {
  const navigate = useNavigate();

  return (
    <div className="p-4 space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Manage your Coldop account and system configuration
        </p>
      </div>

      {/* Settings Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {settings.map((item) => {
          const Icon = item.icon;

          return (
            <Card
              key={item.title}
              role="button"
              tabIndex={0}
              onClick={() => navigate({ to: item.path })}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  navigate({ to: item.path });
                }
              }}
              className="transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <CardHeader className="flex flex-row items-start gap-4">
                <div className="rounded-md border bg-muted/50 p-2">
                  <Icon className="h-5 w-5 text-muted-foreground" />
                </div>

                <div className="space-y-1">
                  <CardTitle className="text-base">{item.title}</CardTitle>
                  <CardDescription className="text-sm leading-snug">
                    {item.description}
                  </CardDescription>
                </div>
              </CardHeader>

              <CardContent />
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default SettingsPage;
