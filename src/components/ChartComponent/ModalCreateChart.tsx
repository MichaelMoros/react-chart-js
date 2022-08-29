import React, { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import FloatingLabel from 'react-bootstrap/FloatingLabel'
import { EXPORT_SUPPORTED_FORMATS } from '../../constants/constants';
import { ExportSupportedFormat, AcceptedChartTypes, ActionTypes } from '../../enums/enums'
import { COMPARING_CHART_TYPES } from '../../constants/constants'
import { HiddenCanvasOptions } from '../../types/types'
import ModalChartInputs from './ModalChartInputs';

const MAX_HEIGHT = 3840
const MAX_WIDTH = 2160
const MIN_VALUE = 200

interface ModalCreateChartProps {
    show: boolean
    close: () => void
    type: AcceptedChartTypes
    createChart: (t: HiddenCanvasOptions) => void
    action: ActionTypes
}

type TResolution = { height: number, width: number }
type CustomLabels = { labelA: string, labelB: string }

const ModalCreateChart: React.FC<ModalCreateChartProps> = ({ type, show, close, createChart, action }) => {
    const [resolution, setResolution] = useState<TResolution>({ height: 1920, width: 1080 })
    const [format, setFormat] = useState(EXPORT_SUPPORTED_FORMATS[0])
    const [customLabels, setCustomLabels] = useState<CustomLabels>({ labelA: 'Dataset A', labelB: 'Dataset B' })

    const isComparingChart = COMPARING_CHART_TYPES.includes(type as any)

    const startDownloadAndClose = () => {
        const { height, width } = resolution
        const _resolution = { height, width }
        const { labelA, labelB } = customLabels
        const options = isComparingChart ? { labelA, labelB } : null

        const param = {
            resolution: _resolution,
            options,
            format
        }

        createChart(param)
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


    const handleCustomLabelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const key = e.currentTarget.name
        const value = e.currentTarget.value

        setCustomLabels({
            ...customLabels,
            [key]: value
        })
    }

    const handleCustomLabelBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        const key = e.currentTarget.name
        const value = e.currentTarget.value

        if (value.length > 1) return

        setCustomLabels({
            ...customLabels,
            [key]: key === 'labelA' ? 'Dataset A' : 'Dataset B'
        })
    }

    return (
        <>
            <Modal show={show} onHide={close} centered>
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

                        <FloatingLabel controlId="floatingSelect-format" label="Select File Format" className="mb-3">
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

                        <ModalChartInputs
                            isComparingChart={isComparingChart}
                            action={action}
                            customLabels={customLabels}
                            onChange={handleCustomLabelChange}
                            onBlur={handleCustomLabelBlur}
                        />
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