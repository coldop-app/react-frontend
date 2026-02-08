import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useStore } from '@/stores/store';
import { useProfileSettings } from '@/services/base/settings/profile/useProfileSettings';
import { useUpdateProfileSettings } from '@/services/base/settings/profile/useUpdateProfileSettings';
import { profileUpdateSchema, type ProfileUpdateInput } from '@/schemas/profileUpdate';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardAction,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { AlertCircle, RefreshCw, User, Pencil, X } from 'lucide-react';

const ProfileSettingsPage = () => {
  const { admin, coldStorage } = useStore();
  const storeAdminId = admin?.id;
  const [isEditMode, setIsEditMode] = useState(false);

  const { data, isLoading, isError, error, refetch } = useProfileSettings(
    storeAdminId ? { storeAdminId } : undefined
  );
  const updateProfile = useUpdateProfileSettings();

  const form = useForm<ProfileUpdateInput>({
    resolver: zodResolver(profileUpdateSchema as never),
    mode: 'onChange',
    defaultValues: {
      coldStorageId: coldStorage?.id || admin?.coldStorageId || '',
      name: admin?.name || '',
      personalAddress: admin?.personalAddress || '',
      mobileNumber: admin?.mobileNumber || '',
      password: '',
      role: admin?.role || '',
      isVerified: admin?.isVerified || false,
    },
  });

  // Update form when data is loaded
  useEffect(() => {
    if (data?.data) {
      const formData = {
        coldStorageId: data.data.coldStorageId,
        name: data.data.name,
        personalAddress: data.data.personalAddress || '',
        mobileNumber: data.data.mobileNumber,
        password: '', // Don't populate password
        role: data.data.role,
        isVerified: data.data.isVerified,
      };
      form.reset(formData);
      // Explicitly set role value to ensure Select component updates
      if (data.data.role) {
        form.setValue('role', data.data.role, { shouldValidate: false });
      }
    }
  }, [data, form]);

  // Update coldStorageId when coldStorage changes
  useEffect(() => {
    if (coldStorage?.id) {
      form.setValue('coldStorageId', coldStorage.id);
    }
  }, [coldStorage, form]);

  const onSubmit = (values: ProfileUpdateInput) => {
    if (!storeAdminId) return;

    updateProfile.mutate(
      {
        storeAdminId,
        data: values,
      },
      {
        onSuccess: () => {
          // Reset password field after successful update
          form.setValue('password', '');
          // Exit edit mode
          setIsEditMode(false);
        },
      }
    );
  };

  const handleCancelEdit = () => {
    // Reset form to original values
    if (profileData) {
      form.reset({
        coldStorageId: profileData.coldStorageId,
        name: profileData.name,
        personalAddress: profileData.personalAddress || '',
        mobileNumber: profileData.mobileNumber,
        password: '',
        role: profileData.role,
        isVerified: profileData.isVerified,
      });
    }
    // Exit edit mode
    setIsEditMode(false);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6 min-h-screen">
        <div className="space-y-2">
          <Skeleton className="h-7 sm:h-8 w-48 sm:w-64" />
          <Skeleton className="h-4 w-full sm:w-96" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-48" />
          </CardHeader>
          <CardContent className="space-y-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-9 w-full" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  if (isError || !storeAdminId) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 min-h-screen flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="p-4 sm:p-6 text-center space-y-4">
            <div className="flex justify-center">
              <div className="rounded-full bg-destructive/10 p-3">
                <AlertCircle className="h-6 w-6 text-destructive" />
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Failed to load profile</h3>
              <p className="text-sm text-muted-foreground">
                {!storeAdminId
                  ? 'Store admin ID not found. Please ensure you are logged in.'
                  : error?.message || 'An unexpected error occurred while fetching profile.'}
              </p>
            </div>
            {storeAdminId && (
              <Button onClick={() => refetch()} variant="outline" className="gap-2">
                <RefreshCw className="h-4 w-4" />
                Try Again
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Success state
  const profileData = data?.data;

  if (!profileData) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 min-h-screen flex items-center justify-center">
        <Alert variant="destructive" className="max-w-md mx-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>No Data</AlertTitle>
          <AlertDescription>Profile data is not available.</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6 min-h-screen">
      {/* Header */}
      <div className="space-y-1 sm:space-y-2">
        <div className="flex items-center gap-2">
          <User className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Profile Settings</h1>
        </div>
        <p className="text-sm sm:text-base text-muted-foreground">
          Manage your personal information, password, and account details.
        </p>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>
                {isEditMode
                  ? 'Update your profile information below.'
                  : 'View your profile information. Click the edit icon to make changes.'}
              </CardDescription>
            </div>
            {!isEditMode && (
              <CardAction>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsEditMode(true)}
                  className="h-9 w-9"
                  aria-label="Edit profile"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              </CardAction>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name */}
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter your full name"
                          type="text"
                          disabled={!isEditMode || form.formState.isSubmitting}
                          readOnly={!isEditMode}
                          className={!isEditMode ? 'bg-muted/50 cursor-default' : ''}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Mobile Number */}
                <FormField
                  control={form.control}
                  name="mobileNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mobile Number</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter 10-digit mobile number"
                          type="tel"
                          disabled={!isEditMode || form.formState.isSubmitting}
                          readOnly={!isEditMode}
                          className={!isEditMode ? 'bg-muted/50 cursor-default' : ''}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Personal Address */}
                <FormField
                  control={form.control}
                  name="personalAddress"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Personal Address</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter your address"
                          type="text"
                          disabled={!isEditMode || form.formState.isSubmitting}
                          readOnly={!isEditMode}
                          className={!isEditMode ? 'bg-muted/50 cursor-default' : ''}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>Optional</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Role */}
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role</FormLabel>
                      <Select
                        key={data?.data?.role || 'role-select'} // Force re-render when role changes
                        onValueChange={field.onChange}
                        value={field.value || undefined}
                        disabled={!isEditMode || form.formState.isSubmitting}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a role" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Admin">Admin</SelectItem>
                          <SelectItem value="Manager">Manager</SelectItem>
                          <SelectItem value="Operator">Operator</SelectItem>
                          <SelectItem value="Staff">Staff</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Password */}
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter new password (optional)"
                          type="password"
                          disabled={!isEditMode || form.formState.isSubmitting}
                          readOnly={!isEditMode}
                          className={!isEditMode ? 'bg-muted/50 cursor-default' : ''}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Leave empty to keep your current password unchanged
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Is Verified */}
                <FormField
                  control={form.control}
                  name="isVerified"
                  render={({ field }) => (
                    <FormItem className="flex flex-col justify-end">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <FormLabel>Verification Status</FormLabel>
                          <FormDescription>Account verification status</FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            disabled={!isEditMode || form.formState.isSubmitting}
                          />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Hidden coldStorageId field */}
              <FormField
                control={form.control}
                name="coldStorageId"
                render={({ field }) => <input type="hidden" {...field} />}
              />

              {/* Action Buttons - Only show in edit mode */}
              {isEditMode && (
                <div className="flex justify-end gap-4 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancelEdit}
                    disabled={form.formState.isSubmitting}
                    className="gap-2"
                  >
                    <X className="h-4 w-4" />
                    Cancel
                  </Button>
                  <Button type="submit" disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting ? 'Updating...' : 'Save Changes'}
                  </Button>
                </div>
              )}
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileSettingsPage;
