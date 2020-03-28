import React from 'react';
import Link from 'next/link';

export const Layout = ({children, noPad = false}) => (
  <div className="bg-gray-200">
    <nav className="flex items-center justify-between flex-wrap p-6">
      <div className="flex items-center flex-shrink-0 mr-6">
        <Link href="/">
          <a>
            <span className="text-gray-800 mt-12 mb-4 -ml-1 text-xl font-extrabold tracking-wider">
              COVID Modeling Project
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
    <div className={`${noPad ? '' : 'p-6'} min-h-screen bg-gray-200`}>
      {children}
    </div>
  </div>
);
