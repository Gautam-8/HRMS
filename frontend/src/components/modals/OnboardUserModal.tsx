'use client';

import { useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { userService } from '@/services/user.service';
import { departmentService } from '@/services/department.service';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Loader2, Upload } from 'lucide-react';
import { extractTextFromPDF } from '@/lib/pdf';

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || '');

const formSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters').optional(),
  designation: z.string().min(2, 'Designation must be at least 2 characters'),
  role: z.enum(['CEO', 'CTO', 'HR', 'Manager', 'Employee']),
  departmentId: z.string().optional(),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
});

type FormData = z.infer<typeof formSchema>;

export interface OnboardUserModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  defaultValues?: Partial<FormData> & { id?: string };
  mode?: 'create' | 'edit';
  organizationId: string;
}

export function OnboardUserModal({
  open,
  onOpenChange,
  onSuccess,
  defaultValues,
  mode = 'create',
  organizationId,
}: OnboardUserModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const { toast } = useToast();

  const { data: departments = [] } = useQuery({
    queryKey: ['departments', organizationId],
    queryFn: async () => {
      const response = await departmentService.getAll(organizationId);
      return response.data;
    },
    enabled: !!organizationId,
  });

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      role: 'Employee',
      phone: '',
      ...defaultValues,
    },
  });

  // Reset form when defaultValues change or when modal opens
  useEffect(() => {
    if (!open) return;

    if (mode === 'create') {
      form.reset({
        role: 'Employee',
        phone: '',
        fullName: '',
        email: '',
        password: '',
        designation: '',
        departmentId: undefined,
      });
    } else if (defaultValues) {
      const { password, ...values } = defaultValues;
      form.reset(values);
    }
  }, [form, defaultValues, mode, open]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file type
    if (!file.type.includes('pdf')) {
      toast({
        title: 'Error',
        description: 'Please upload a PDF document',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsParsing(true);
      
      // Extract text from PDF
      const text = await extractTextFromPDF(file);
      console.log('Extracted text:', text);
      
      // Parse with Gemini
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const prompt = `Extract the following information from this resume and return ONLY a valid JSON object without any markdown formatting or additional text:
        {
          "fullName": "Full name",
          "email": "Email address",
          "phone": "Phone number",
          "designation": "Current or most recent job title",
          "skills": ["List of skills"]
        }
        
        Resume text:
        ${text}`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      let parsedData = null;

      if(response.candidates && response.candidates.length && response.candidates[0]?.content 
        && response.candidates[0]?.content.parts.length && response.candidates[0]?.content.parts[0]?.text) {
        const responseText = response.candidates[0].content.parts[0].text;
        // Clean the response text to ensure it's valid JSON
        const cleanedText = responseText.replace(/```json\n?|\n?```/g, '').trim();
        try {
          parsedData = JSON.parse(cleanedText);
        } catch (parseError) {
          console.error('JSON Parse Error:', parseError);
          console.log('Raw response:', responseText);
          console.log('Cleaned text:', cleanedText);
        }
      }

      if(!parsedData) {
        toast({
          title: 'Error',
          description: 'Failed to parse resume. Please fill in the details manually.',
          variant: 'destructive',
        });
        return;
      }

      // Update form with parsed data
      form.setValue('fullName', parsedData.fullName || '');
      form.setValue('email', parsedData.email || '');
      form.setValue('phone', parsedData.phone || '');
      form.setValue('designation', parsedData.designation || '');

      toast({
        title: 'Success',
        description: 'Resume parsed successfully',
      });
    } catch (error) {
      console.error('Failed to parse resume:', error);
      toast({
        title: 'Error',
        description: 'Failed to parse resume. Please fill in the details manually.',
        variant: 'destructive',
      });
    } finally {
      setIsParsing(false);
    }
  };

  async function onSubmit(data: FormData) {
    try {
      setIsSubmitting(true);
      if (mode === 'create') {
        await userService.create({
          ...data,
          password: data.password!,
          organizationId,
          isOnboarded: false,
        });
        toast({
          title: 'Success',
          description: 'Team member onboarded successfully',
        });
      } else {
        if (!defaultValues?.id) return;
        const updateData = { ...data };
        if (!updateData.password) delete updateData.password;
        
        await userService.update(defaultValues.id, updateData);
        toast({
          title: 'Success',
          description: 'Team member updated successfully',
        });
      }
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to ' + (mode === 'create' ? 'onboard' : 'update') + ' team member:', error);
      toast({
        title: 'Error',
        description: 'Failed to ' + (mode === 'create' ? 'onboard' : 'update') + ' team member',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Onboard Team Member' : 'Edit Team Member'}
          </DialogTitle>
          <DialogDescription>
            Fill in the details below to {mode === 'create' ? 'onboard a new' : 'update the'} team member.
            {mode === 'create' && ' They will receive an email to set up their account.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {mode === 'create' && (
              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-8 h-8 mb-4 text-gray-500" />
                    <p className="mb-2 text-sm text-gray-500">
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-gray-500">PDF Document</p>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept=".pdf"
                    onChange={handleFileUpload}
                    disabled={isParsing}
                  />
                </label>
              </div>
            )}
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
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
                    <Input placeholder="john@example.com" type="email" {...field} />
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
                  <FormLabel>Phone</FormLabel>
                  <FormControl>
                    <Input placeholder="+1234567890" type="tel" {...field} />
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
                  <FormLabel>{mode === 'create' ? 'Password' : 'New Password (optional)'}</FormLabel>
                  <FormControl>
                    <Input 
                      type="password" 
                      placeholder={mode === 'create' ? "Enter password" : "Enter new password"} 
                      {...field} 
                      value={field.value || ''}
                    />
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
                    <Input placeholder="Software Engineer" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="departmentId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Department</FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a department" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {departments.map((department) => (
                        <SelectItem 
                          key={department.id} 
                          value={department.id}
                        >
                          {department.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Employee">Employee</SelectItem>
                      <SelectItem value="Manager">Manager</SelectItem>
                      <SelectItem value="HR">HR</SelectItem>
                      <SelectItem value="CTO">CTO</SelectItem>
                      <SelectItem value="CEO">CEO</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={isSubmitting || isParsing}>
                {isSubmitting ? 'Saving...' : isParsing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Parsing Resume...
                  </>
                ) : mode === 'create' ? 'Onboard Member' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
} 