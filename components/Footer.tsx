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
      <ul className="flex flex-wrap items-center mt-3 text-sm text-gray-500 dark:text-gray-400 sm:mt-0">
          <li>
              <a href="#" className="mr-4 hover:underline md:mr-6 ">About</a>
          </li>
          <li>
              <a href="#" className="mr-4 hover:underline md:mr-6">Privacy Policy</a>
          </li>
          <li>
              <a href="#" className="mr-4 hover:underline md:mr-6">Licensing</a>
          </li>
          <li>
              <a href="#" className="hover:underline">Contact</a>
          </li>
      </ul>
    </footer>
  )
}

export default Footer
