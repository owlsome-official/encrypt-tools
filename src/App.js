import { useEffect, useState } from 'react';
import { useParams, withRouter } from 'react-router-dom';

import './App.css';

import Title from './components/Title';
import Navbar from './components/Navbar';
import InputGroup from './components/Input/InputGroup';
import InputWithLabel from './components/Input/InputWithLabel';
import TextareaWithLabel from './components/Input/TextareaWithLabel';
import ResultSection from './components/ResultSection';
import Footer from './components/Footer';
import { decryptAES, encryptAES } from './utils/crypto';
import { DECRYPTION_MODE, ENCRYPTION_MODE } from './utils/constants';

const DEMO_KEY = "67890123456789012345678901234567"
const DEMO_IV = "6789012345678901"
const DEMO_INPUT = `{"firstname":"Chinnawat","lastname":"Chimdee"}`
const DEMO_RESULT = encryptAES(DEMO_KEY, DEMO_IV, DEMO_INPUT)

function App({ history }) {
  const [key, setKey] = useState(DEMO_KEY)
  const [iv, setIV] = useState(DEMO_IV)
  const [input, setInput] = useState(DEMO_INPUT)
  const [result, setResult] = useState(DEMO_RESULT)

  let { mode } = useParams();

  useEffect(() => {
    if (mode !== ENCRYPTION_MODE && mode !== DECRYPTION_MODE) {
      history.push("/" + ENCRYPTION_MODE)
    }
  }, [mode, history])

  useEffect(() => { // the largest re-render by just a piece changes
    setResult(aesCipher(mode, input, key, iv))
  }, [mode, input, key, iv])

  const aesCipher = (selectedMode, userInput, userKey, userIV) => {
    if (selectedMode === ENCRYPTION_MODE) {
      return encryptAES(userInput, userKey, userIV)
    } else if (selectedMode === DECRYPTION_MODE) {
      return decryptAES(userInput, userKey, userIV)
    } else {
      return ""
    }
  }

  return (
    <div className="App h-screen w-screen flex justify-center items-center bg-black">
      <div className="divide-y divide-gray-300 w-full sm:max-w-prose bg-white-default py-4 rounded-2xl m-4">

        <Title name="AES Encrypt & Decrypt Tools" />
        <Navbar mode={mode} />
        <InputGroup>
          <InputWithLabel
            className="w-1/2"
            name="key"
            label="Key:"
            value={key}
            onChange={e => setKey(e.target.value)}
            placeholder="Enter Key"
          />
          <InputWithLabel
            className="w-1/2"
            name="iv"
            label="IV:"
            value={iv}
            onChange={e => setIV(e.target.value)}
            placeholder="Enter IV"
          />
          <TextareaWithLabel
            className="w-full"
            name="input"
            label="Input:"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Enter Input"
          />
        </InputGroup>
        <ResultSection result={result} />

        <Footer />
      </div>
    </div>
  );
}

export default withRouter(App)
