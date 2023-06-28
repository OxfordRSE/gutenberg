import React from 'react'
import Image from 'next/image'
import { HiArrowCircleLeft, HiArrowCircleRight } from 'react-icons/hi'

interface Props {
  prevUrl?: string,
  nextUrl?: string
}

const Footer: React.FC<Props> = ({ prevUrl, nextUrl }) => {
  return (
    <footer className="mt-4 mb-2 mx-2 p-2 bg-white rounded-lg shadow md:flex md:items-center md:justify-between dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
      {prevUrl && (
        <a href={`/material/${prevUrl}`} className="pointer-events-auto text-gray-500 hover:text-gray-400">
          <HiArrowCircleLeft className="w-14 h-14"/>
        </a>
      )}
      <span className="flex flex-wrap text-sm text-gray-500 sm:text-center dark:text-gray-400">
        {"© 2023 "}  
          University of Oxford, <a href="https://www.rse.ox.ac.uk/" target="_blank"> Oxford Research Software
          Engineering</a>
      </span>
      <p className="flex flex-wrap items-center mt-3 text-sm text-gray-500 dark:text-gray-400 sm:mt-0">
        For attribution and license information click the @ symbol on the top right
      </p>
      {nextUrl && (
        <a href={`/material/${nextUrl}`} className="pointer-events-auto text-gray-600 hover:text-gray-500 opacity-50">
          <HiArrowCircleRight className="w-14 h-14"/>
        </a>
      )}
    </footer>
  )
}

export default Footer
