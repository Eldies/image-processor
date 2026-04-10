import {ChangeEvent, useEffect, useState, DragEvent, useRef} from 'react'

export default function App() {
  const inputRef = useRef<HTMLInputElement | null>(null)

  const [file, setFile] = useState<File | null>(null)
  const [resultUrl, setResultUrl] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [originalUrl, setOriginalUrl] = useState('')
  const [isDragging, setIsDragging] = useState(false)

  useEffect(() => {
    if (!file) {
      setOriginalUrl('')
      return
    }

    const url = URL.createObjectURL(file)
    setOriginalUrl(url)

    return () => {
      URL.revokeObjectURL(url)
    }
  }, [file])

  useEffect(() => {
    return () => {
      if (resultUrl) {
        URL.revokeObjectURL(resultUrl)
      }
    }
  }, [resultUrl])

  async function onSubmit() {
    setResultUrl('')

    if (!file)
      return;

    setIsLoading(true)

    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch(`http://localhost:8000/api/v1/remove-bg`, {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('The server could not remove the background.')
      }

      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      setResultUrl(url)
    } finally {
      setIsLoading(false)
    }
  }

  function setSelectedFile(nextFile: File | null) {
    setResultUrl('')

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

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    setSelectedFile(event.target.files?.[0] || null)
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
        <h1>Remove image backgrounds in one click</h1>
        <p className="subtitle">
          Upload an image. The API removes the background and returns a transparent PNG.
        </p>

        <label>
          <input ref={inputRef} type="file" accept="image/*" onChange={handleFileChange} hidden/>
          <button
              className="primary-button"
              onClick={() => inputRef.current?.click()}
          >
            Upload image
          </button>
        </label>

        <div className="actions">
          <button className="primary-button" onClick={onSubmit} disabled={isLoading || !file}>
            {isLoading ? 'Removing background...' : 'Remove background'}
          </button>
          {resultUrl && (
            <a className="secondary-button" href={resultUrl} download="image-no-bg.png">
              Download result
            </a>
          )}
        </div>

        <article>
          <h2>Original</h2>
          {originalUrl ? <img src={originalUrl} alt="Original upload" /> : <PreviewPlaceholder />}
        </article>

        <article>
          <h2>Background removed</h2>
          {resultUrl ? <img src={resultUrl} alt="Background removed output" className="checkerboard" /> : <PreviewPlaceholder />}
        </article>

      </section>
      <div className="file-dropzone" style={isDragging ? {} : {display: 'none'}}>
        <h1>Drop image anywhere</h1>
      </div>
    </main>
  )
}

function PreviewPlaceholder() {
  return <div className="placeholder">Your preview will appear here.</div>
}
