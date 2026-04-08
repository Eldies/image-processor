import { ChangeEvent, useEffect, useState, SubmitEvent } from 'react'

export default function App() {
  const [file, setFile] = useState<File | null>(null)
  const [resultUrl, setResultUrl] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [previewUrl, setPreviewUrl] = useState('')

  useEffect(() => {
    if (!file) {
      setPreviewUrl('')
      return
    }

    const url = URL.createObjectURL(file)
    setPreviewUrl(url)

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

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()

    setError('')
    setResultUrl('')
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

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const nextFile = event.target.files?.[0] || null
    setFile(nextFile)
    setResultUrl('')
    setError('')
  }

  return (
    <main className="page">
      <h1>Background remover</h1>

      <form className="card" onSubmit={handleSubmit}>
        <input type="file" accept="image/*" onChange={handleFileChange} />
        <button type="submit" disabled={isLoading || !file}>
          Remove background
        </button>
      </form>

      {error && <p className="error">{error}</p>}

      <section className="results">
        {previewUrl && (
          <article className="card">
            <h2>Original</h2>
            <img src={previewUrl} alt="Original upload" />
          </article>
        )}

        {resultUrl && (
          <article className="card">
            <h2>Result</h2>
            <img src={resultUrl} alt="Background removed" />
            <a href={resultUrl} download="background-removed.png">
              Download result
            </a>
          </article>
        )}
      </section>
    </main>
  )
}