import React from 'react'
import Image from 'next/image'

const Footer: React.FC = () => {
  return (

    <footer className="mt-5 p-4 bg-white rounded-lg shadow md:flex md:items-center md:justify-between md:p-6 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
      <span className="text-sm text-gray-500 sm:text-center dark:text-gray-400">
        {"© 2022 "}  
        <a href="https://www.rse.ox.ac.uk/" className="hover:underline">
          University of Oxford
        </a>
      </span>
      <p className="flex flex-wrap items-center mt-3 text-sm text-gray-500 dark:text-gray-400 sm:mt-0">
        For license information click the @ symbol at the top right of your screen
      </p>
    </footer>
  )
}

export default Footer
