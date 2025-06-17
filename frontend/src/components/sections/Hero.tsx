"use client";

import { Button } from "@/components/ui/button";
import { useModalStore } from "@/lib/store/modal-store";
import { CreateOrganizationModal } from "@/components/organization/CreateOrganizationModal";
import Image from "next/image";

const companyLogos = [
  { src: "/logos/company1.svg", alt: "Company 1" },
  { src: "/logos/company2.svg", alt: "Company 2" },
  { src: "/logos/company3.svg", alt: "Company 3" },
  { src: "/logos/company4.svg", alt: "Company 4" },
];

export function Hero() {
  const { openCreateOrgModal, isCreateOrgModalOpen, closeCreateOrgModal } = useModalStore();

  return (
    <>
      <section className="pt-32 pb-24 bg-gradient-to-b from-white to-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <h1 className="text-5xl font-bold leading-tight">
                Your people drive your success.{" "}
                <span className="text-primary">We elevate their experience!</span>
              </h1>
              <p className="text-xl text-gray-600">
                Meet HRMS—the HR platform that's easy, friendly, and actually fun to use. 
                No jargon, no spreadsheets—just smooth sailing for your team!
              </p>
              <div className="flex gap-4">
                <Button size="lg" className="text-lg" onClick={openCreateOrgModal}>
                  Get Started
                </Button>
                <Button size="lg" variant="outline" className="text-lg">
                  Book a Demo
                </Button>
              </div>
              
              <p className="text-sm text-gray-500 mb-6">Trusted by leading companies worldwide</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center">
                {companyLogos.map((logo, index) => (
                  <div key={index} className="relative h-10 grayscale hover:grayscale-0 transition-all">
                    <Image
                      src={logo.src}
                      alt={logo.alt}
                      fill
                      className="object-contain"
                    />
                  </div>
                ))}
              </div>
            </div>
            <div className="relative h-[600px]">
              <Image
                src="/hero-illustration.svg"
                alt="HRMS Platform"
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      <CreateOrganizationModal 
        isOpen={isCreateOrgModalOpen} 
        onClose={closeCreateOrgModal} 
      />
    </>
  );
} 