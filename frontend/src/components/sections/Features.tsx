import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Users, 
  Clock, 
  CreditCard, 
  BarChart, 
  FileText,
  Award
} from "lucide-react";

const features = [
  {
    title: "Core HR Management",
    description: "Centralize employee data, documents, and organizational info in one secure hub.",
    icon: Users
  },
  {
    title: "Time & Attendance",
    description: "Flexible time tracking that fits your flow with automated attendance management.",
    icon: Clock
  },
  {
    title: "Payroll Management",
    description: "Automated payroll processing with compliance across all states.",
    icon: CreditCard
  },
  {
    title: "Performance Tracking",
    description: "Set goals, conduct reviews, and drive continuous improvement.",
    icon: BarChart
  },
  {
    title: "Document Management",
    description: "Digital document handling with secure storage and easy access.",
    icon: FileText
  },
  {
    title: "Employee Experience",
    description: "Enhance engagement with recognition, feedback, and development tools.",
    icon: Award
  }
];

export function Features() {
  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">
            One platform to manage People, Payroll and Performance
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Everything you need to create an efficient, engaging, and productive workplace
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="border-2 hover:border-primary transition-colors">
              <CardHeader>
                <feature.icon className="w-12 h-12 text-primary mb-4" />
                <CardTitle>{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
} 