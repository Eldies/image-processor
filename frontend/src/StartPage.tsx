import {ChangeEvent, useRef} from "react";

type StartPageProps = {
    setFile: (newFile: File | null) => void;
}

export default function ResultPage(props: StartPageProps) {
    const { setFile } = props
    const inputRef = useRef<HTMLInputElement | null>(null)

    function handleFileChange(event: ChangeEvent<HTMLInputElement>): void {
        setFile(event.target.files?.[0] || null)
    }

    return <>
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
    </>
}
