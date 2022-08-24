import React, { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import FloatingLabel from 'react-bootstrap/FloatingLabel'
import { EXPORT_SUPPORTED_FORMATS } from '../../constants/constants';
import { ExportSupportedFormat } from '../../enums/enums'

const MAX_HEIGHT = 3840
const MAX_WIDTH = 2160
const MIN_VALUE = 200

interface ModalCreateChartProps {
    show: boolean
    close: () => void
    onConfirm: () => void
    setCanvas: (h: number, w: number) => void
    changeFormat: (f: ExportSupportedFormat) => void
}

type TResolution = { height: number, width: number }

const ModalCreateChart: React.FC<ModalCreateChartProps> = ({ show, close, onConfirm, setCanvas, changeFormat }) => {
    const [resolution, setResolution] = useState<TResolution>({ height: 1920, width: 1080 })
    const [format, setFormat] = useState(EXPORT_SUPPORTED_FORMATS[0])

    const startDownloadAndClose = () => {
        const { height, width } = resolution
        setCanvas(height, width)
        changeFormat(format as ExportSupportedFormat)
        onConfirm()
        close()
    }

    const handleResolution = (e: React.ChangeEvent<HTMLInputElement>) => {
        const key = e.currentTarget.name
        const value = Number(e.currentTarget.value.replace(/\D/, ''))

        if (!resolution[key as keyof TResolution]) return

        let temp;

        if (key === 'height') {
            if (value > MAX_HEIGHT) temp = MAX_HEIGHT
            else if (value < MIN_VALUE) temp = MIN_VALUE
            else if (value < MAX_HEIGHT && value > MIN_VALUE) temp = value
        } else {
            if (value > MAX_WIDTH) temp = MAX_WIDTH
            else if (value < MIN_VALUE) temp = MIN_VALUE
            else if (value < MAX_WIDTH && value > MIN_VALUE) temp = value
        }

        setResolution({
            ...resolution,
            [key]: temp
        })
    }

    const handleFormatChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.currentTarget.value as ExportSupportedFormat
        if (!EXPORT_SUPPORTED_FORMATS.includes(value)) return
        setFormat(value)
    }

    return (
        <>
            <Modal show={show} onHide={close}>
                <Modal.Header closeButton>
                    <Modal.Title>Save Chart</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <FloatingLabel
                            controlId="floatingInput-resolution-height"
                            label={`Set Custom Height [${MIN_VALUE}-${MAX_HEIGHT}]`}
                            className="mb-3"
                        >
                            <Form.Control
                                type="number"
                                min={MIN_VALUE}
                                max={MAX_HEIGHT}
                                value={resolution.height}
                                name="height"
                                onChange={handleResolution}
                            />
                        </FloatingLabel>

                        <FloatingLabel
                            controlId="floatingInput-resolution-width"
                            label={`Set Custom Width [${MIN_VALUE}-${MAX_WIDTH}]`}
                            className="mb-3"
                        >
                            <Form.Control
                                type="number"
                                min={MIN_VALUE}
                                max={MAX_WIDTH}
                                value={resolution.width}
                                name="width"
                                onChange={handleResolution}
                            />
                        </FloatingLabel>

                        <FloatingLabel controlId="floatingSelect-format" label="Select File Format">
                            <Form.Select defaultValue={format} aria-label="Select File Format" onChange={handleFormatChange}>
                                {
                                    EXPORT_SUPPORTED_FORMATS.map((item, index) => {
                                        return (
                                            <option key={index} value={item}>{item}</option>
                                        )
                                    })
                                }
                            </Form.Select>
                        </FloatingLabel>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={close}>
                        Close
                    </Button>
                    <Button variant="primary" onClick={startDownloadAndClose}>
                        Download
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}


export default ModalCreateChart