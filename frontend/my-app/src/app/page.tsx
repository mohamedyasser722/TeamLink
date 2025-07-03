import Link from 'next/link';
import Image from 'next/image';
import Navigation from '@/components/Navigation';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-2 lg:gap-8 lg:items-center">
          <div className="text-center lg:text-left">
            <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl md:text-6xl">
              Connect with <span className="text-blue-600">Teams</span>
            </h1>
            <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl lg:mx-0 lg:max-w-none">
              TeamLink is a platform that connects talented freelancers with project leaders to build amazing teams and deliver exceptional results.
            </p>
            <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8 lg:justify-start lg:mx-0">
              <div className="rounded-md shadow">
                <Link
                  href="/auth/register"
                  className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 md:py-4 md:text-lg md:px-10"
                >
                  Get Started
                </Link>
              </div>
              <div className="mt-3 rounded-md shadow sm:mt-0 sm:ml-3">
                <Link
                  href="/auth/login"
                  className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-blue-600 bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10"
                >
                  Sign In
                </Link>
              </div>
            </div>
          </div>
          
          <div className="mt-12 lg:mt-0">
            <div className="relative">
              {/* Hero Image */}
              <div className="relative bg-gradient-to-r from-blue-400 to-blue-600 rounded-lg shadow-xl p-8 lg:p-12">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full mb-4">
                    <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">Build Amazing Teams</h3>
                  <p className="text-blue-100">Connect with talented professionals and create something extraordinary together.</p>
                </div>
              </div>
              
              {/* Replace the above placeholder with your own image when you have one */}
              {/* 
              <Image
                src="/your-welcome-image.jpg"
                alt="TeamLink Welcome"
                width={600}
                height={400}
                className="rounded-lg shadow-xl"
                priority
              />
              */}
            </div>
          </div>
        </div>

        <div className="mt-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="lg:text-center">
              <h2 className="text-base text-blue-600 font-semibold tracking-wide uppercase">
                How it works
              </h2>
              <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                Build your dream team
              </p>
            </div>

            <div className="mt-10">
              <div className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10">
                <div className="relative">
                  <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                    <span className="text-lg font-bold">1</span>
                  </div>
                  <p className="ml-16 text-lg leading-6 font-medium text-gray-900">
                    Create your profile
                  </p>
                  <p className="mt-2 ml-16 text-base text-gray-500">
                    Whether you're a freelancer or project leader, set up your profile with your skills and experience.
                  </p>
                </div>

                <div className="relative">
                  <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                    <span className="text-lg font-bold">2</span>
                  </div>
                  <p className="ml-16 text-lg leading-6 font-medium text-gray-900">
                    Find projects or talent
                  </p>
                  <p className="mt-2 ml-16 text-base text-gray-500">
                    Leaders post projects and freelancers apply. Find the perfect match for your skills or project needs.
                  </p>
                </div>

                <div className="relative">
                  <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                    <span className="text-lg font-bold">3</span>
                  </div>
                  <p className="ml-16 text-lg leading-6 font-medium text-gray-900">
                    Build your team
                  </p>
                  <p className="mt-2 ml-16 text-base text-gray-500">
                    Once applications are accepted, teams are automatically formed to start working together.
                  </p>
                </div>

                <div className="relative">
                  <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                    <span className="text-lg font-bold">4</span>
                  </div>
                  <p className="ml-16 text-lg leading-6 font-medium text-gray-900">
                    Deliver results
                  </p>
                  <p className="mt-2 ml-16 text-base text-gray-500">
                    Work collaboratively with your team to deliver exceptional projects and build lasting relationships.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
