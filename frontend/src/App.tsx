import {useState, DragEvent} from 'react'
import ResultPage from './ResultPage'
import StartPage from './StartPage'

export default function App() {
  const [file, setFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  function setSelectedFile(nextFile: File | null) {
    if (!nextFile) {
      setFile(null)
      return
    }

    if (!nextFile.type.startsWith('image/')) {
//      setError('Please drop an image file')
      return
    }

    setFile(nextFile)
  }

  function onDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault()
    setIsDragging(false)
    setSelectedFile(event.dataTransfer?.files?.[0] || null)
  }

  function onDragOver(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault()
    setIsDragging(true)
  }

  return (
    <main className="landing-page"
        onDragOver={onDragOver}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
    >
      <section className="landing-content">

        {
          file
              ? <ResultPage file={file}/>
              : <StartPage setFile={setSelectedFile}/>
        }

      </section>
      <div className="file-dropzone" style={isDragging ? {} : {display: 'none'}}>
        <h1>Drop image anywhere</h1>
      </div>
    </main>
  )
}
