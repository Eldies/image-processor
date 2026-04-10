import {useEffect, useState} from "react";

type ResultPageProps = {
    file: File
}

export default function ResultPage(props: ResultPageProps) {
    const { file } = props

    const [resultUrl, setResultUrl] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [originalUrl, setOriginalUrl] = useState('')

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

    return <>
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
    </>

}

function PreviewPlaceholder() {
  return <div className="placeholder">Your preview will appear here.</div>
}
