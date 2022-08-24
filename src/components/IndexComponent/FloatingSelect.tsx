import React from 'react'
import FloatingLabel from 'react-bootstrap/FloatingLabel'
import Form from 'react-bootstrap/Form'

type FloatingSelectProps = {
    value: any,
    handler: (e: React.ChangeEvent<HTMLSelectElement>) => void
    options: string[]
    label: string
}

export default function FloatingSelect(props: FloatingSelectProps) {
    const { value, handler, options, label = "Floating.Label" } = props

    return (
        <div className="mt-3 pt-0 pb-0 mb-3">
            <FloatingLabel label={label}>
                <Form.Select onChange={handler} defaultValue={value}>
                    {options.map((item, index) => {
                        const properLabel = item.slice(0, 1).toUpperCase() + item.slice(1)
                        return (
                            <option key={index} value={item}>{properLabel}</option>
                        )
                    })}
                </Form.Select>
            </FloatingLabel >
        </div>
    );
}