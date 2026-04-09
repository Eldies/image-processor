import { ChangeEvent, useEffect, useState, DragEvent } from 'react'

export default function App() {
  const [file, setFile] = useState<File | null>(null)
  const [resultUrl, setResultUrl] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
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
    setError('')
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
    } catch (unknownError) {
      const message =
        unknownError instanceof Error ? unknownError.message : 'Something went wrong.'

      setError(message)
    } finally {
      setIsLoading(false)
    }
  }

  function setSelectedFile(nextFile: File | null) {
    setResultUrl('')
    setError('')

    if (!nextFile) {
      setFile(null)
      return
    }

    if (!nextFile.type.startsWith('image/')) {
      setError('Please drop an image file')
      return
    }

    setFile(nextFile)
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    setSelectedFile(event.target.files?.[0] || null)
  }

  function handleDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault()
    setIsDragging(false)
    setSelectedFile(event.dataTransfer?.files?.[0] || null)
  }

  function onDragOver(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault()
    setIsDragging(true)
  }

  return (
    <main className="page">
      <section className="hero">
        <p className="eyebrow">MVP</p>
        <h1>Remove image backgrounds in one click</h1>
        <p className="subtitle">
          Upload a PNG, JPG, or WebP image. The API removes the background with U2-Net and returns a transparent PNG.
        </p>
      </section>

      <section className="card uploader-card">
        <label
            className={`dropzone ${isDragging ? "dropzone-active" : ""}`}
            onDragOver={onDragOver}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
        >
          <input type="file" accept="image/*" onChange={handleFileChange} />
          <span className="dropzone-title">Drag and drop an image here</span>
          <span className="dropzone-subtitle">or click to choose a file</span>
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

        {error && <p className="error-text">{error}</p>}
      </section>

      <section className="preview-grid">
        <article className="card preview-card">
          <h2>Original</h2>
          {originalUrl ? <img src={originalUrl} alt="Original upload" className="preview-image" /> : <PreviewPlaceholder />}
        </article>

        <article className="card preview-card">
          <h2>Background removed</h2>
          {resultUrl ? <img src={resultUrl} alt="Background removed output" className="preview-image checkerboard" /> : <PreviewPlaceholder />}
        </article>
      </section>
    </main>
  )
}

function PreviewPlaceholder() {
  return <div className="placeholder">Your preview will appear here.</div>
}
