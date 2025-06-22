import React, { useEffect } from 'react';
export default function Languages() {
    // Load Google Translate script
    useEffect(()=>{
        const script=document.createElement("script");
        script.src="https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
        document.body.appendChild(script);
   
        window.googleTranslateElementInit=()=>{
            new window.google.translate.TranslateElement(
              {
                pageLanguage: 'en',
                includedLanguages:"en,es,fr,de,zh",
                layout:window.google.translate.TranslateElement.InlineLayout.SIMPLE
              },
              'google_translate_element'
            );
        }
      },[]);
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="bg-white/80 rounded-xl shadow-lg border border-gray-100 px-8 py-6 flex flex-col items-center">
        <div className="mb-2 text-lg font-semibold text-gray-700 flex items-center gap-2">
          <i className="fa-solid fa-language text-indigo-600 text-xl"></i>
          Language Selection
        </div>
        <div id='google_translate_element' className="mt-2" />
      </div>
    </div>
  );
}