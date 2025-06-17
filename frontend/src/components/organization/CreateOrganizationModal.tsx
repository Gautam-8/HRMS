"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Building2, ChevronRight, User, Loader2, ArrowLeft } from "lucide-react";
import { login } from '@/services/auth.service';
import { useRouter } from 'next/navigation';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { organizationService } from '@/services/organization.service';

// Form schema matching backend DTO
const formSchema = z.object({
  // Organization details
  name: z.string().min(1, "Organization name is required"),
  description: z.string().optional(),
  industry: z.string().min(1, "Industry is required"),
  legalName: z.string().min(1, "Legal name is required"),
  panNumber: z.string()
    .regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, "Invalid PAN number format")
    .optional()
    .or(z.literal("")),
  gstNumber: z.string()
    .regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, "Invalid GST number format")
    .optional()
    .or(z.literal("")),
  
  // HR User details
  fullName: z.string().min(1, "Full name is required"),
  email: z.string()
    .min(1, "Email is required")
    .email("Invalid email format"),
  password: z.string()
    .min(8, "Password must be at least 8 characters long"),
  phone: z.string()
    .min(1, "Phone number is required")
    .regex(/^[6-9]\d{9}$/, "Invalid Indian phone number"),
  designation: z.string().min(1, "Designation is required"),
});

type FormData = z.infer<typeof formSchema>;

interface CreateOrganizationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateOrganizationModal({ isOpen, onClose }: CreateOrganizationModalProps) {
  const router = useRouter();
  const [step, setStep] = useState<'organization' | 'hr'>('organization');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      industry: "",
      legalName: "",
      panNumber: "",
      gstNumber: "",
      fullName: "",
      email: "",
      password: "",
      phone: "",
      designation: "",
    },
  });

  const handleClose = () => {
    setStep('organization');
    form.reset();
    setIsSubmitting(false);
    setIsLoggingIn(false);
    onClose();
  };

  const handleNext = () => {
    const organizationFields = ['name', 'description', 'industry', 'legalName', 'panNumber', 'gstNumber'];
    const isValid = organizationFields.every(field => !form.formState.errors[field as keyof FormData]);
    
    if (isValid) {
      setStep('hr');
    } else {
      form.trigger(organizationFields as (keyof FormData)[]);
    }
  };

  const handleBack = () => {
    setStep('organization');
  };

  const onSubmit = async (data: FormData) => {
    try {
      setIsSubmitting(true);
      await organizationService.create(data);
      toast.success('Organization created successfully!');
      
      // Automatically log in the HR user
      setIsLoggingIn(true);
      try {
        const loginResponse = await login({
          email: data.email,
          password: data.password
        });
        
        toast.success('Welcome to your new organization!');
        router.push('/dashboard');
      } catch (loginError) {
        console.error('Auto-login failed:', loginError);
        toast.error('Organization created but auto-login failed. Please log in manually.');
        handleClose();
      }
    } catch (error) {
      console.error('Organization creation error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create organization');
    } finally {
      setIsSubmitting(false);
      setIsLoggingIn(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold text-center">
            Create Your Organization
          </DialogTitle>
        </DialogHeader>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full transition-colors ${
              step === 'organization' ? 'bg-primary text-white' : 'bg-primary/20 text-primary'
            }`}>
              <Building2 className="w-4 h-4" />
            </div>
            <span className="mx-2 text-sm font-medium">Organization Details</span>
          </div>
          <ChevronRight className="mx-2 w-4 h-4 text-gray-400" />
          <div className="flex items-center">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full transition-colors ${
              step === 'hr' ? 'bg-primary text-white' : 'bg-primary/20 text-primary'
            }`}>
              <User className="w-4 h-4" />
            </div>
            <span className="mx-2 text-sm font-medium">HR Details</span>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {step === 'organization' && (
              <>
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Organization Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter organization name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter description" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="industry"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Industry</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter industry" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="legalName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Legal Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter legal name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="panNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>PAN Number (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter PAN number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="gstNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>GST Number (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter GST number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end pt-4">
                  <Button type="button" onClick={handleNext}>
                    Next
                    <ChevronRight className="ml-2 w-4 h-4" />
                  </Button>
                </div>
              </>
            )}

            {step === 'hr' && (
              <>
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your full name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="Enter your email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="Create a password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your phone number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="designation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Designation</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your designation" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-between pt-4">
                  <Button type="button" variant="outline" onClick={handleBack}>
                    <ArrowLeft className="mr-2 w-4 h-4" />
                    Back
                  </Button>
                  <Button type="submit" disabled={isSubmitting || isLoggingIn}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : isLoggingIn ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Logging in...
                      </>
                    ) : (
                      'Create Organization'
                    )}
                  </Button>
                </div>
              </>
            )}
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
