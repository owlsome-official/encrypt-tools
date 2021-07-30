import React, { useState } from 'react'

const copyIcon = <svg className="svg-icon w-4 mx-1" viewBox="0 0 20 20">
  <path fill="currentColor" d="M17.391,2.406H7.266c-0.232,0-0.422,0.19-0.422,0.422v3.797H3.047c-0.232,0-0.422,0.19-0.422,0.422v10.125c0,0.232,0.19,0.422,0.422,0.422h10.125c0.231,0,0.422-0.189,0.422-0.422v-3.797h3.797c0.232,0,0.422-0.19,0.422-0.422V2.828C17.812,2.596,17.623,2.406,17.391,2.406 M12.749,16.75h-9.28V7.469h3.375v5.484c0,0.231,0.19,0.422,0.422,0.422h5.483V16.75zM16.969,12.531H7.688V3.25h9.281V12.531z"></path>
</svg>

function ResultSection({ result }) {
  const [copyText, setCopyText] = useState("Copy")
  const copyToClipboard = (e) => {
    var textField = document.createElement('textarea')
    textField.innerText = result
    document.body.appendChild(textField)
    textField.select()
    document.execCommand('copy')
    textField.remove()

    e.target.focus();
    setCopyText("Copied")
    setTimeout(() => {
      setCopyText("Copy")
    }, 3000);
  }
  return (
    <div className="px-8 py-4">
      <label htmlFor="result" className="text-xl font-bold pb-2 flex justify-between">
        <span className="">Result:</span>
        <button
          type="button"
          className="flex justify-center items-center shadow-sm rounded-2xl border border-solid border-pink-default text-pink-default hover:bg-pink-default hover:text-white-default text-sm px-2 py-1"
          onClick={copyToClipboard}
        >
          {copyIcon}
          {copyText}
        </button>
      </label>
      <pre
        name="result"
        className="w-full shadow-xl rounded-2xl inline-block border-0 bg-white-dark px-2 py-2 whitespace-pre-wrap break-words overflow-x-auto max-h-48"
      >
        {result ? result : "\n"}
      </pre>
    </div>
  )
}

export default ResultSection
