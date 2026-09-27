import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { StatusChip } from '@/components/ui/StatusChip';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Avatar } from '@/components/ui/Avatar';
import { useUser } from '@/hooks/useUser';
import { useToast } from '@/hooks/useToast';
import {
  User,
  GraduationCap,
  Phone,
  Mail,
  MapPin,
  Bus,
  ShieldCheck,
  Edit2,
  Check,
  X,
  Camera,
  AlertTriangle,
  Building,
  Calendar,
} from 'lucide-react';

const profileSchema = z.object({
  name: z.string().min(2, 'Full Name is required'),
  phone: z.string().min(10, 'Valid 10-digit mobile number is required'),
  emergencyContact: z.string().min(10, 'Emergency contact phone is required'),
  section: z.string().min(1, 'Section is required'),
  address: z.string().min(5, 'Residential address is required'),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export const StudentProfilePage: React.FC = () => {
  const { studentProfile, updateStudentProfile } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  const extraProfileFields = {
    section: 'Section A',
    address: 'Door No. 12-4-56, Brodipet 4th Line, Guntur, AP - 522002',
    assignedRoute: 'Route #14 - Guntur City Express',
    validUntil: '31 May 2027',
    emergencyContactName: 'K. Rama Rao (Father)',
  };

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: studentProfile.name,
      phone: studentProfile.phone,
      emergencyContact: studentProfile.emergencyContact,
      section: extraProfileFields.section,
      address: extraProfileFields.address,
    },
  });

  const completionPercentage = 100;

  // Re-sync form defaults when the user's profile context updates
  // (e.g., after a successful save, or between sessions)
  useEffect(() => {
    reset({
      name: studentProfile.name,
      phone: studentProfile.phone,
      emergencyContact: studentProfile.emergencyContact,
      section: extraProfileFields.section,
      address: extraProfileFields.address,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studentProfile.name, studentProfile.phone, studentProfile.emergencyContact]);

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const onSave = (data: ProfileFormValues) => {
    setIsLoading(true);
    updateStudentProfile({
      name: data.name,
      phone: data.phone,
      emergencyContact: data.emergencyContact,
      section: data.section,
      address: data.address,
    });
    setIsLoading(false);
    setIsEditing(false);
    toast.success('Profile Updated', 'Student transport profile details saved successfully.');
  };

  const handleCancel = () => {
    reset();
    setIsEditing(false);
  };

  const handlePhotoUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('File Too Large', 'Please select an image smaller than 2MB.');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        updateStudentProfile({ avatarUrl: result });
        toast.success('Photo Updated', 'Official student pass photograph updated.');
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-page">
      {/* Hidden File Input for Avatar Upload */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* 1. Profile Hero Banner */}
      <Card className="p-6 bg-gradient-to-r from-primary/5 via-card to-secondary/5 border-primary/15">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            {/* Student Photo */}
            <div className="relative group shrink-0">
              <Avatar
                name={studentProfile.name}
                src={studentProfile.avatarUrl}
                size="xl"
                className="h-20 w-20 border-2 border-primary/25 text-xl ring-4 ring-primary/10"
              />
              <button
                onClick={handlePhotoUpload}
                aria-label="Change profile photo"
                className="absolute bottom-0 right-0 p-1.5 rounded-full bg-primary text-primary-foreground shadow-md hover:scale-110 active:scale-100 transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2"
                title="Change Photo"
              >
                <Camera className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-black text-foreground font-heading">{studentProfile.name}</h1>
                <Badge variant="outline">{studentProfile.regNo}</Badge>
                <StatusChip status="active" />
              </div>
              <p className="text-sm text-muted-foreground">
                {studentProfile.department} · {studentProfile.academicYear}
              </p>
              <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-primary" />
                {studentProfile.email}
              </p>
            </div>
          </div>

          {/* Profile Completion */}
          <div className="flex flex-col sm:items-end gap-2 shrink-0 border-t md:border-t-0 pt-4 md:pt-0 border-border">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-muted-foreground">Profile Completion</span>
              <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">{completionPercentage}%</span>
            </div>
            <div className="w-48 bg-muted rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-gradient-to-r from-emerald-500 to-emerald-400 h-full rounded-full transition-all duration-700 ease-out"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
            <span className="text-[11px] text-muted-foreground flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" /> Fully Verified Transport Registration
            </span>
          </div>
        </div>
      </Card>

      {/* Main Profile Content Form */}
      <form onSubmit={handleSubmit(onSave)}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Column 1: Academic & Contact Information */}
          <div className="lg:col-span-7 space-y-6">
            {/* Academic Information */}
            <Card className="p-6">
              <SectionHeader
                title="Academic Details"
                subtitle="Official VFSTR Enrollment Records"
                badge={<Badge variant="secondary">Read-Only Administrative Record</Badge>}
                className="pb-3 mb-4"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5 p-3.5 bg-muted/30 rounded-xl border border-border/50">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                    <GraduationCap className="h-3 w-3 text-primary" /> Full Name
                  </span>
                  {isEditing ? (
                    <Input error={errors.name?.message} {...register('name')} className="h-8 text-xs" />
                  ) : (
                    <span className="font-bold text-foreground block text-sm">{studentProfile.name}</span>
                  )}
                </div>

                <div className="space-y-1.5 p-3.5 bg-muted/30 rounded-xl border border-border/50">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                    <User className="h-3 w-3 text-primary" /> Roll Number
                  </span>
                  <span className="font-black text-foreground block text-sm font-mono tracking-tight">{studentProfile.regNo}</span>
                </div>

                <div className="space-y-1.5 p-3.5 bg-muted/30 rounded-xl border border-border/50">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                    <Building className="h-3 w-3 text-primary" /> Department
                  </span>
                  <span className="font-semibold text-foreground block text-xs">{studentProfile.department}</span>
                </div>

                <div className="space-y-1.5 p-3.5 bg-muted/30 rounded-xl border border-border/50">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                    <Calendar className="h-3 w-3 text-primary" /> Year & Section
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-foreground text-xs">{studentProfile.academicYear}</span>
                    {isEditing ? (
                      <Input error={errors.section?.message} {...register('section')} className="h-7 w-24 text-xs" />
                    ) : (
                      <Badge variant="outline">{extraProfileFields.section}</Badge>
                    )}
                  </div>
                </div>
              </div>
            </Card>

            {/* Contact Details */}
            <Card className="p-6">
              <SectionHeader
                title="Personal Contact Information"
                subtitle="Student communication channels"
                actions={
                  !isEditing ? (
                    <Button variant="outline" size="sm" leftIcon={<Edit2 className="h-3.5 w-3.5" />} onClick={() => setIsEditing(true)}>
                      Edit Profile
                    </Button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" leftIcon={<X className="h-3.5 w-3.5" />} onClick={handleCancel} disabled={isLoading}>
                        Cancel
                      </Button>
                      <Button type="submit" variant="primary" size="sm" leftIcon={<Check className="h-3.5 w-3.5" />} isLoading={isLoading}>
                        Save Changes
                      </Button>
                    </div>
                  )
                }
                className="pb-3 mb-4"
              />

              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1 p-3 bg-muted/40 rounded-lg">
                    <span className="text-muted-foreground flex items-center gap-1.5 font-medium">
                      <Phone className="h-3.5 w-3.5 text-primary" /> Mobile Phone Number
                    </span>
                    {isEditing ? (
                      <Input error={errors.phone?.message} {...register('phone')} className="h-8 text-xs bg-background" />
                    ) : (
                      <span className="font-bold text-foreground block">{studentProfile.phone}</span>
                    )}
                  </div>

                  <div className="space-y-1 p-3 bg-muted/40 rounded-lg">
                    <span className="text-muted-foreground flex items-center gap-1.5 font-medium">
                      <Mail className="h-3.5 w-3.5 text-primary" /> Institutional Email
                    </span>
                    <span className="font-bold text-foreground block font-mono">{studentProfile.email}</span>
                  </div>
                </div>

                <div className="space-y-1 p-3 bg-muted/40 rounded-lg">
                  <span className="text-muted-foreground flex items-center gap-1.5 font-medium">
                    <MapPin className="h-3.5 w-3.5 text-primary" /> Permanent Residential Address
                  </span>
                  {isEditing ? (
                    <Input error={errors.address?.message} {...register('address')} className="h-8 text-xs bg-background" />
                  ) : (
                    <span className="font-medium text-foreground block leading-relaxed">{extraProfileFields.address}</span>
                  )}
                </div>
              </div>
            </Card>
          </div>

          {/* Column 2: Transport Registration & Emergency Contacts */}
          <div className="lg:col-span-5 space-y-6">
            {/* Transport Registration Card */}
            <Card className="p-6">
              <SectionHeader
                title="Transport Registration"
                subtitle="Assigned bus pass details"
                badge={<StatusChip status="active" />}
                className="pb-3 mb-4"
              />

              <div className="space-y-3 text-xs">
                <div className="p-3 bg-muted/40 rounded-lg flex items-center justify-between">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <Bus className="h-3.5 w-3.5 text-primary" /> Assigned Route:
                  </span>
                  <span className="font-bold text-primary">{extraProfileFields.assignedRoute}</span>
                </div>

                <div className="p-3 bg-muted/40 rounded-lg flex items-center justify-between">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-primary" /> Boarding Stop:
                  </span>
                  <span className="font-bold text-foreground">{studentProfile.pickupPoint}</span>
                </div>

                <div className="p-3 bg-muted/40 rounded-lg flex items-center justify-between">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-primary" /> Pass Valid Until:
                  </span>
                  <span className="font-bold text-foreground">{extraProfileFields.validUntil}</span>
                </div>
              </div>
            </Card>

            {/* Emergency Contacts Card */}
            <Card className="p-6 border-2 border-amber-500/20 bg-amber-50/40 dark:bg-amber-950/20">
              <SectionHeader
                title="Emergency Contacts"
                subtitle="Parent / Guardian Emergency Contact"
                badge={<AlertTriangle className="h-4 w-4 text-amber-500" />}
                className="pb-3 mb-4"
              />

              <div className="space-y-3 text-xs">
                <div className="p-3 bg-muted/40 rounded-lg space-y-1">
                  <span className="text-muted-foreground font-medium block">Guardian Name & Relationship:</span>
                  <span className="font-bold text-foreground block">{extraProfileFields.emergencyContactName}</span>
                </div>

                <div className="p-3 bg-muted/40 rounded-lg space-y-1">
                  <span className="text-muted-foreground font-medium block">Emergency Contact Phone:</span>
                  {isEditing ? (
                    <Input error={errors.emergencyContact?.message} {...register('emergencyContact')} className="h-8 text-xs bg-background" />
                  ) : (
                    <span className="font-bold text-primary block">{studentProfile.emergencyContact}</span>
                  )}
                </div>
              </div>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
};
