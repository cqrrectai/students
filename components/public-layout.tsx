import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

interface PublicLayoutProps {
  children: React.ReactNode
}

export function PublicLayout({ children }: PublicLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="container mx-auto px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/images/cqrrect-logo.png"
                alt="Cqrrect Ai Logo"
                width={160}
                height={53}
                className="h-10 w-auto"
              />
            </Link>

            {/* Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              <Link href="/exams" className="text-gray-700 hover:text-[#00e4a0] transition-colors font-medium">
                Exams
              </Link>
              <Link href="/cqrrect-ai" className="text-gray-700 hover:text-[#00e4a0] transition-colors font-medium">
                AI Assistant
              </Link>
              <Link href="/pricing" className="text-gray-700 hover:text-[#00e4a0] transition-colors font-medium">
                Pricing
              </Link>
              <Link href="/about" className="text-gray-700 hover:text-[#00e4a0] transition-colors font-medium">
                About
              </Link>
            </nav>

            {/* CTA Button */}
            <Link href="/auth/sign-up">
              <Button className="bg-[#00e4a0] hover:bg-[#00d494] text-white font-semibold px-6 py-2 rounded-full shadow-lg hover:shadow-xl transition-all duration-300">
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            {/* Company Info */}
            <div className="space-y-4">
              <Image
                src="/images/cqrrect-logo.png"
                alt="Cqrrect Ai Logo"
                width={160}
                height={53}
                className="h-10 w-auto brightness-0 invert"
              />
              <p className="text-gray-400 text-sm">
                Bangladesh's leading AI-powered exam platform, helping students achieve their academic goals.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/exams" className="text-gray-400 hover:text-[#00e4a0] transition-colors">
                    Exams
                  </Link>
                </li>
                <li>
                  <Link href="/cqrrect-ai" className="text-gray-400 hover:text-[#00e4a0] transition-colors">
                    AI Assistant
                  </Link>
                </li>
                <li>
                  <Link href="/pricing" className="text-gray-400 hover:text-[#00e4a0] transition-colors">
                    Pricing
                  </Link>
                </li>
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Resources</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/blog" className="text-gray-400 hover:text-[#00e4a0] transition-colors">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="/help" className="text-gray-400 hover:text-[#00e4a0] transition-colors">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="text-gray-400 hover:text-[#00e4a0] transition-colors">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-gray-400 hover:text-[#00e4a0] transition-colors">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Contact</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Email: Info@cqrrect.com</li>
                <li>Phone: +88 01960-2806</li>
                <li>Address: E-14/X, ICT Tower (14th Floor),<br />Agargaon, Dhaka - 1207</li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © {new Date().getFullYear()} Cqrrect AI. All rights reserved.
            </p>
            <div className="flex gap-6 mt-4 md:mt-0">
              <Link href="/contact" className="text-gray-400 hover:text-[#00e4a0] text-sm transition-colors">
                Contact
              </Link>
              <Link href="/privacy" className="text-gray-400 hover:text-[#00e4a0] text-sm transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-gray-400 hover:text-[#00e4a0] text-sm transition-colors">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
} 