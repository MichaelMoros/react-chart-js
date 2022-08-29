import React, { useState } from 'react';
import FloatingLabel from 'react-bootstrap/esm/FloatingLabel';
import Form from 'react-bootstrap/esm/Form';
import { ActionTypes } from '../../enums/enums';

type CustomLabels = { labelA: string, labelB: string }

type ModalChartInputsProps = {
    isComparingChart: boolean
    action: ActionTypes
    customLabels: CustomLabels
    onBlur: (e: React.FocusEvent<HTMLInputElement>) => void
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}

// const ModalChartInputs: React.FC<ModalChartInputsProps> = ({ isComparingChart, action, customLabels, onChange, onBlur }) => {
const ModalChartInputs: React.FC<ModalChartInputsProps> = ({ isComparingChart, action, customLabels, onChange, onBlur }) => {
    if (isComparingChart) {
        if (action === ActionTypes.Create) {
            return (
                <>
                    <FloatingLabel
                        controlId="floatingInput-resolution-height"
                        label={`Set Custom Legend`}
                        className="mb-3"
                    >
                        <Form.Control
                            type="text"
                            min={1}
                            max={64}
                            value={customLabels.labelA}
                            name="labelA"
                            onChange={onChange}
                            onBlur={onBlur}
                        />
                    </FloatingLabel>
                </>
            )
        }

        if (action === ActionTypes.CompareAndCreate) {
            return (
                <>
                    <FloatingLabel
                        controlId="floatingInput-resolution-height"
                        label={`Set Custom Legend`}
                        className="mb-3"
                    >
                        <Form.Control
                            type="text"
                            min={1}
                            max={64}
                            value={customLabels.labelA}
                            name="labelA"
                            onChange={onChange}
                            onBlur={onBlur}
                        />
                    </FloatingLabel>

                    <FloatingLabel
                        controlId="floatingInput-resolution-height"
                        label={`Set Custom Legend`}
                        className="mb-3"
                    >
                        <Form.Control
                            type="text"
                            min={1}
                            max={64}
                            value={customLabels.labelB}
                            name="labelB"
                            onChange={onChange}
                            onBlur={onBlur}
                        />
                    </FloatingLabel>
                </>
            )
        }
    }

    return <></>
}

export default ModalChartInputs