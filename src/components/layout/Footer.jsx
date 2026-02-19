
import React from 'react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-[#191919] mt-auto">
      <div className="w-full px-4 md:px-6 py-2 flex flex-col md:flex-row items-center justify-between gap-2 md:gap-4">

        {/* Left Side: Copyright */}
        <div className="text-center md:text-left order-2 md:order-1">
          <p className="text-gray-400 text-[10px] sm:text-xs">
            © {currentYear} Art Academy. All rights reserved.
          </p>
        </div>

        {/* Right Side: Credits & Links */}
        <div className="flex items-center gap-3 sm:gap-4 order-1 md:order-2">
          {/* WebArya */}
          <div className="flex items-center gap-1.5">
            <span className="text-gray-400 dark:text-gray-500 text-[10px] hidden sm:inline">Designed by</span>
            <a
              href="https://webarya.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 group"
              title="Designed & Developed by WebArya"
            >
              <img
                src="/WebAryaLogo.jpeg"
                alt="WebArya"
                className="h-4 w-4 sm:h-5 sm:w-5 rounded-full object-cover group-hover:scale-110 transition-transform duration-300"
              />
              <span className="text-green-600 dark:text-green-500 font-bold text-[10px] sm:text-xs group-hover:text-green-500 transition-colors duration-300">WebArya</span>
            </a>
          </div>

          <div className="h-3 w-px bg-gray-300 dark:bg-gray-700 hidden sm:block"></div>

          {/* Contact Links */}
          <div className="flex items-center gap-3">
            <a
              href="tel:+919187385124"
              className="flex items-center gap-1 text-gray-500 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-500 transition-colors duration-300"
              title="Call Us"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <span className="text-[10px] sm:text-xs hidden sm:inline">+91 9187 385 124</span>
            </a>

            <a
              href="https://wa.me/919187385124"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-gray-500 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-500 transition-colors duration-300"
              title="Chat on WhatsApp"
            >
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              <span className="text-[10px] sm:text-xs hidden sm:inline">WhatsApp</span>
            </a>

            {/* Scroll to Top Button */}
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="w-6 h-6 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 rounded flex items-center justify-center transition-all duration-300 shadow-sm border border-gray-200 dark:border-gray-700"
              title="Back to top"
              aria-label="Scroll to top"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Footer;
