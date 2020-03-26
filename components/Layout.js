import React from 'react';
import Link from 'next/link';

const Layout = ({children}) => (
  <div className="bg-gray-200">
    <nav className="flex items-center justify-between flex-wrap p-6">
      <div className="flex items-center flex-shrink-0 mr-6">
        <Link href="/">
          <a>
            <span className="font-bold text-xl mb-2 tracking-tight">
              COVID-19 Model
            </span>
          </a>
        </Link>
      </div>
      <div className="flex items-center w-auto">
        <div className="text-sm flex-grow">
          <Link href="/state">
            <a className="inline-block mt-0 text-blue-600 hover:text-gray-600 mr-4">
              States
            </a>
          </Link>
          <Link href="/country">
            <a className="inline-block mt-0 text-blue-600 hover:text-gray-600 mr-4">
              Countries
            </a>
          </Link>
          <Link href="/about">
            <a className="inline-block mt-0 text-blue-600 hover:text-gray-600 mr-4">
              About
            </a>
          </Link>
        </div>
      </div>
    </nav>
    <div className="p-6 min-h-screen bg-gray-200">{children}</div>
  </div>
);

export default Layout;
