import { Link, createFileRoute } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import { ThemeToggle } from '@/components/theme-toggle';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export const Route = createFileRoute('/')({
  component: Index,
});

function Index() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navbar */}
      <nav className="fixed top-0 w-full bg-background/80 backdrop-blur-md border-b border-border z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="shrink-0">
              <Link to="/" className="flex items-center">
                <div className="w-10 h-10 bg-linear-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xl">C</span>
                </div>
                <span className="ml-2 text-xl font-bold">Coldop</span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <Link
                to="/"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Home
              </Link>

              <ThemeToggle />

              <Link to="/auth/login">
                <Button className="bg-green-600 hover:bg-green-700 text-white">Sign in</Button>
              </Link>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center space-x-2">
              <ThemeToggle />
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg hover:bg-accent transition-colors"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 space-y-3 border-t border-border">
              <Link
                to="/"
                className="block px-3 py-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Home
              </Link>
              <Link to="/auth/login" className="block" onClick={() => setMobileMenuOpen(false)}>
                <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                  Sign in
                </Button>
              </Link>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <main className="pt-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] py-12 sm:py-20">
            <div className="max-w-3xl">
              {/* Badge */}
              <div className="flex justify-center mb-8">
                <div className="inline-block px-4 py-2 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-full">
                  <span className="text-sm font-medium text-green-700 dark:text-green-400">
                    ✨ Complete Cold Storage Solution
                  </span>
                </div>
              </div>

              {/* Headline */}
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 text-center leading-tight">
                Manage Your Cold Storage With{' '}
                <span className="bg-linear-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  Confidence
                </span>
              </h1>

              {/* Description */}
              <p className="text-lg text-muted-foreground text-center mb-12 max-w-2xl mx-auto leading-relaxed">
                All-in-one platform combining mobile app, web dashboard, WhatsApp notifications, and
                instant receipt printing. Stay connected and in control of your operations.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
                <Link to="/auth/login" className="w-full sm:w-auto">
                  <Button
                    size="lg"
                    className="w-full bg-green-600 hover:bg-green-700 text-white px-8 py-6 text-base font-medium"
                  >
                    Get Started
                  </Button>
                </Link>
                <Link to="/auth/login" className="w-full sm:w-auto">
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full px-8 py-6 text-base font-medium"
                  >
                    Sign In
                  </Button>
                </Link>
              </div>

              {/* Social Proof Card */}
              <Card className="border border-border bg-card/50 backdrop-blur-sm">
                <CardContent className="pt-6">
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-8 text-center sm:text-left">
                    <div className="flex-1">
                      <div className="text-3xl font-bold text-green-600 dark:text-green-500">
                        2,402+
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">Customers trust Coldop</p>
                    </div>
                    <div className="w-px h-12 bg-border hidden sm:block"></div>
                    <div className="flex-1">
                      <div className="text-3xl font-bold text-green-600 dark:text-green-500">
                        99.9%
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">System uptime guaranteed</p>
                    </div>
                    <div className="w-px h-12 bg-border hidden sm:block"></div>
                    <div className="flex-1">
                      <div className="text-3xl font-bold text-green-600 dark:text-green-500">
                        24/7
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">Premium support</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Feature Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
                <Card className="border border-border bg-card/50 backdrop-blur-sm hover:border-green-200 dark:hover:border-green-800 transition-colors">
                  <CardHeader>
                    <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mb-4">
                      <svg
                        className="w-6 h-6 text-green-600 dark:text-green-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                    <CardTitle className="text-lg">Mobile App</CardTitle>
                    <CardDescription>
                      Manage operations on the go with our intuitive mobile application
                    </CardDescription>
                  </CardHeader>
                </Card>

                <Card className="border border-border bg-card/50 backdrop-blur-sm hover:border-green-200 dark:hover:border-green-800 transition-colors">
                  <CardHeader>
                    <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mb-4">
                      <svg
                        className="w-6 h-6 text-green-600 dark:text-green-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                        />
                      </svg>
                    </div>
                    <CardTitle className="text-lg">Web Dashboard</CardTitle>
                    <CardDescription>
                      Real-time analytics and comprehensive reporting from your browser
                    </CardDescription>
                  </CardHeader>
                </Card>

                <Card className="border border-border bg-card/50 backdrop-blur-sm hover:border-green-200 dark:hover:border-green-800 transition-colors">
                  <CardHeader>
                    <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mb-4">
                      <svg
                        className="w-6 h-6 text-green-600 dark:text-green-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                        />
                      </svg>
                    </div>
                    <CardTitle className="text-lg">Smart Notifications</CardTitle>
                    <CardDescription>
                      Get WhatsApp alerts and instant receipt printing for all operations
                    </CardDescription>
                  </CardHeader>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Index;
