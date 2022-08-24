import React, { useState, useEffect } from 'react'
import FloatingSelect from '../IndexComponent/FloatingSelect'
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Button from 'react-bootstrap/Button'
import ChartContainer from './ChartContainer'
import ModalCreateChart from './ModalCreateChart'
import HiddenCanvas from './HiddenCanvas'
import { ActionTypes, AggregateFunctions, AcceptedChartTypes, ComparingChartTypes, ExportSupportedFormat } from '../../enums/enums'
import { Nullable, ProcessedData, NullableArray, Canvas } from '../../types/types'
import { EXPORT_SUPPORTED_FORMATS, AGGREGATE_FUNCTIONS, CHART_TYPES, COMPARING_CHART_TYPES, DATE_MODIFIERS } from '../../constants/constants'
import { createOptions, handleDayModifier, getWeekNumber, monthNumberToShortMonth } from '../../helpers/helpers'

type ChartProviderProps = {
    action: ActionTypes
    referrence: any
    datasource: any[]
}

enum ColumnType {
    String = 'string',
    Number = 'number',
    Date = 'date',
    Boolean = 'boolean'
}

type Column = { property: string, type: ColumnType }
type NullableCharts = null | AcceptedChartTypes | ComparingChartTypes

type defaultStateReferrenceKeys = {
    number: string[],
    string: string[],
    date: string[]
}

const ChartProvider: React.FC<ChartProviderProps> = ({ referrence, datasource, action }) => {
    const [cType, setCType] = useState<NullableCharts>(null)
    const [cLabels, setCLabels] = useState<Nullable<Column>>(null)
    const [cValues, setCValues] = useState<Nullable<Column>>(null)
    const [aggregate, setAggregate] = useState(AGGREGATE_FUNCTIONS[0])
    const [cDateModifier, setCDateModifier] = useState<Nullable<string>>(null)

    const [processedData, setProcessedData] = useState<Nullable<ProcessedData>>(null)
    const [ready, setReady] = useState(false)
    const [showModal, setShowModal] = useState(false)
    const [enableHiddenCanvas, setEnableHiddenCanvas] = useState(false)
    const [canvasResolution, setCanvasResolution] = useState<Nullable<Canvas>>(null)
    const [imageFormat, setImageFormat] = useState<Nullable<ExportSupportedFormat>>(null)

    // on initial load, extract all k/v's with type number, string and date respectively
    // readonly-ish, can probably use useRef, updated only on first load
    const [labelOptions, setLabelOptions] = useState<NullableArray<string>>(null)
    const [valueOptions, setValueOptions] = useState<NullableArray<string>>(null)

    useEffect(() => {
        const referrenceKeys = Object.entries(referrence).reduce((acc: defaultStateReferrenceKeys, cv) => {
            const arrayItem = cv
            const currentArrayItemKey = arrayItem[0]
            const currentArrayItemValue = arrayItem[1]

            const updatedArray = [...acc[currentArrayItemValue as keyof defaultStateReferrenceKeys], currentArrayItemKey]

            acc[currentArrayItemValue as keyof defaultStateReferrenceKeys] = updatedArray
            return acc
        }, { number: [], string: [], date: [] })

        const chartType = action === ActionTypes.Create ? CHART_TYPES[0] : COMPARING_CHART_TYPES[0]
        const _labelOptions = [...new Set([...referrenceKeys.string, ...referrenceKeys.date])]
        const _valueOptions = [...new Set(referrenceKeys.number)]

        if (_labelOptions.length > 0) {
            const defaultCLabel = { property: _labelOptions[0], type: referrence[_labelOptions[0]] }
            setLabelOptions(_labelOptions)
            setCLabels(defaultCLabel)
        }

        if (_valueOptions.length > 0) {
            const defaultValue = { property: _valueOptions[0], type: referrence[_valueOptions[0]] }
            setValueOptions(_valueOptions)
            setCValues(defaultValue)

            if (defaultValue.type === 'date') setCDateModifier(DATE_MODIFIERS[0])
        }

        setCType(chartType)
        setReady(true)
    }, [])


    useEffect(() => {
        if (!cLabels || !cValues) return

        const lkey = cLabels.property
        const vkey = cValues.property

        let mapped = []

        const total = datasource.map((item) => {
            return item.reduce((acc: any, cv: any) => {
                const propKey = cv[lkey]
                const propValue = cv[vkey]

                if (acc[propKey]) {
                    if (aggregate === 'Count') {
                        acc[propKey] += 1
                    } else {
                        acc[propKey] += propValue
                    }
                } else {
                    if (aggregate === 'Count') {
                        acc[propKey] = 1
                    } else {
                        acc[propKey] = propValue
                    }
                }

                return acc
            }, {})
        })

        if (cLabels.type === 'date' && cDateModifier) {
            const WeekHandlerA = (ds: string) => getWeekNumber(new Date(ds))
            const WeekHandlerB = (str: string) => `Week ${str}`

            const MonthHandlerA = (ds: string) => new Date(ds).getUTCMonth()
            const MonthHandlerB = (mn: number) => monthNumberToShortMonth(mn)

            const YearHandlerA = (ds: string) => new Date(ds).getUTCFullYear()
            const YearHandlerB = (str: string) => `Year ${str}`

            const handlerA = cDateModifier === 'Week' ? WeekHandlerA : cDateModifier === 'Month' ? MonthHandlerA : cDateModifier === 'Year' ? YearHandlerA : (t: string) => '###'
            const handlerB = cDateModifier === 'Week' ? WeekHandlerB : cDateModifier === 'Month' ? MonthHandlerB : cDateModifier === 'Year' ? YearHandlerB : (t: string) => '###'

            const PATTERN = ['Week', 'Month', 'Year']

            if (!PATTERN.includes(cDateModifier as string)) {
                const sortedItems: any = total.map((item) => Object.entries(item).sort((a, b) => Date.parse(a[0]) - Date.parse(b[0])))

                mapped = sortedItems.map((item: any) => {
                    return item.reduce((acc: any, cv: any) => {
                        const key = cv[0]
                        const value = cv[1]
                        const updatedValue = handleDayModifier(key) as string
                        acc[updatedValue] = value

                        return acc
                    }, {})
                })
            }

            // TODO: 
            // if (!PATTERN.includes(cDateModifier as string)) {
            //     mapped = total.map((item) => {
            //         const object: any = Object.entries(item).reduce((acc: any, cv: any) => {
            //             const key = cv[0]
            //             const value = cv[1]
            //             const processedKey = handlerA(key) as string

            //             if (acc[processedKey]) {
            //                 if (aggregate === 'Count') {
            //                     acc[processedKey] += 1
            //                 } else {
            //                     acc[processedKey] += value
            //                 }
            //             }

            //             else {
            //                 if (aggregate === 'Count') {
            //                     acc[processedKey] = 1
            //                 } else {
            //                     acc[processedKey] = value
            //                 }
            //             }

            //             return acc
            //         }, {})


            //         const sortedItems = Object.entries(object).sort((a, b) => Number(a[0]) - Number(b[0]))
            //         let updatedItems = sortedItems.reduce((acc: any, cv: any) => {
            //             const key = cDateModifier === 'Month' ? Number(cv[0]) + 1 : cv[0]
            //             const value = cv[1]
            //             const updatedKey = handlerB(key)

            //             acc[updatedKey] = value
            //             return acc

            //         }, {})

            //         return updatedItems
            //     })
            // }
            // END TODO

            if (cDateModifier === 'Week') {
                mapped = total.map((item) => {
                    const object: any = Object.entries(item).reduce((acc: any, cv: any) => {
                        const key = cv[0]
                        const value = cv[1]
                        const processedKey = getWeekNumber(new Date(key))

                        if (acc[processedKey]) {
                            if (aggregate === 'Count') {
                                acc[processedKey] += 1
                            } else {
                                acc[processedKey] += value
                            }
                        }

                        else {
                            if (aggregate === 'Count') {
                                acc[processedKey] = 1
                            } else {
                                acc[processedKey] = value
                            }
                        }

                        return acc
                    }, {})


                    const sortedItems = Object.entries(object).sort((a, b) => Number(a[0]) - Number(b[0]))
                    let updatedItems = sortedItems.reduce((acc: any, cv: any) => {
                        const key = cv[0]
                        const value = cv[1]
                        const updatedKey = `Week ${key}`

                        acc[updatedKey] = value
                        return acc

                    }, {})

                    return updatedItems
                })
            }

            if (cDateModifier === 'Month') {
                mapped = total.map((item) => {
                    const object: any = Object.entries(item).reduce((acc: any, cv: any) => {
                        const key = cv[0]
                        const value = cv[1]
                        const processedKey = new Date(key).getUTCMonth()

                        if (acc[processedKey]) {
                            if (aggregate === 'Count') {
                                acc[processedKey] += 1
                            } else {
                                acc[processedKey] += value
                            }
                        }

                        else {
                            if (aggregate === 'Count') {
                                acc[processedKey] = 1
                            } else {
                                acc[processedKey] = value
                            }
                        }

                        return acc
                    }, {})

                    const sortedItems = Object.entries(object).sort((a, b) => Number(a[0]) - Number(b[0]))
                    let updatedItems = sortedItems.reduce((acc: any, cv: any) => {
                        const key = Number(cv[0]) + 1
                        const value = cv[1]
                        const updatedKey = monthNumberToShortMonth(key)

                        acc[updatedKey] = value
                        return acc

                    }, {})

                    return updatedItems
                })
            }

            if (cDateModifier === 'Year') {
                mapped = total.map((item) => {
                    const object: any = Object.entries(item).reduce((acc: any, cv: any) => {
                        const key = cv[0]
                        const value = cv[1]
                        const processedKey = new Date(key).getUTCFullYear()

                        if (acc[processedKey]) {
                            if (aggregate === 'Count') {
                                acc[processedKey] += 1
                            } else {
                                acc[processedKey] += value
                            }
                        }

                        else {
                            if (aggregate === 'Count') {
                                acc[processedKey] = 1
                            } else {
                                acc[processedKey] = value
                            }
                        }

                        return acc
                    }, {})

                    const sortedItems = Object.entries(object).sort((a, b) => Number(a[0]) - Number(b[0]))
                    let updatedItems = sortedItems.reduce((acc: any, cv: any) => {
                        const key = cv[0]
                        const value = cv[1]
                        const updatedKey = `Year ${key}`

                        acc[updatedKey] = value
                        return acc

                    }, {})

                    return updatedItems
                })
            }
        }

        const preCheck = cLabels.type !== 'date' ? [...total] : [...mapped]
        const allKeysFromSources = preCheck.map((item) => Object.keys(item))
        const mergedKeysFromAllSources = [...new Set(allKeysFromSources.flat())].sort((a, b) => a > b ? 1 : a < b ? -1 : 0)

        const valuesOnlyWithFlatKeys = preCheck.map((item) => {
            // I can probably convert to array then map 
            // but the lookup time maybe not that efficient if multiple rows
            // end up with for loop for index based update/s
            let values = new Array(mergedKeysFromAllSources.length).fill(0)

            for (let i = 0; i < mergedKeysFromAllSources.length; i++) {
                if (item[mergedKeysFromAllSources[i]]) values[i] = item[mergedKeysFromAllSources[i]]
            }


            return values
        })

        // max value + 30% as buffer
        const tableMaxHeight = Math.max(...valuesOnlyWithFlatKeys.flat()) + ((30 / 100) * Math.max(...valuesOnlyWithFlatKeys.flat()))
        const chartOptions = createOptions({ max: tableMaxHeight })

        setProcessedData({ labels: mergedKeysFromAllSources, data: valuesOnlyWithFlatKeys, options: chartOptions })
    }, [cType, aggregate, cLabels, cValues, cDateModifier])

    const updateCanvasResolution = (height: number, width: number) => {
        if (!height || !width) return
        if (typeof height !== "number" || typeof width !== "number") return

        setCanvasResolution({ height, width })
    }

    const closeModal = () => setShowModal(false)
    const openModal = () => setShowModal(true)
    const confirmDownload = () => setEnableHiddenCanvas(true)
    const hideHiddenCanvas = () => setEnableHiddenCanvas(false)

    const handleCTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        let value = action === ActionTypes.Create ? e.currentTarget.value as AcceptedChartTypes : e.currentTarget.value as ComparingChartTypes
        setCType(value)
    }

    const handleAggregateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.currentTarget.value as AggregateFunctions
        if (!AGGREGATE_FUNCTIONS.includes(value)) return
        setAggregate(value)
    }

    const handleCLabelsChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.currentTarget.value
        const ref = labelOptions as string[]
        if (!ref.includes(value)) return

        if (referrence[value] !== 'date') setCDateModifier(null)
        if (referrence[value] === 'date') setCDateModifier(DATE_MODIFIERS[0])

        setCLabels({ property: value, type: referrence[value] })
    }

    const handleCValuesChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.currentTarget.value
        const ref = valueOptions as string[]
        if (!ref.includes(value)) return

        setCValues({ property: value, type: referrence[value] })
    }

    const handleCDateModifierChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.currentTarget.value
        if (!DATE_MODIFIERS.includes(value)) return
        setCDateModifier(value)
    }

    const handleImageFormatChange = (format: ExportSupportedFormat) => {
        if (!EXPORT_SUPPORTED_FORMATS.includes(format)) return
        setImageFormat(format)
    }

    if (!ready) return <div>Loading form...</div>

    const { property: cLabelsProp } = cLabels as Column
    const { property: cValuesProp } = cValues as Column

    return (
        <div>
            <FloatingSelect
                value={cType}
                handler={handleCTypeChange}
                options={action === ActionTypes.Create ? CHART_TYPES : COMPARING_CHART_TYPES}
                key={1}
                label={'Select Chart Type'} />

            {
                cType && <FloatingSelect
                    value={cLabelsProp}
                    handler={handleCLabelsChange}
                    options={labelOptions as string[]}
                    key={2}
                    label={'Select Column for Labels'}
                />
            }

            {
                cType && cLabels && cLabels.type === "date" && <FloatingSelect
                    value={cDateModifier}
                    handler={handleCDateModifierChange}
                    options={DATE_MODIFIERS}
                    key={3}
                    label={'Date Modifier'}
                />
            }

            {
                cType && <FloatingSelect
                    value={cValuesProp}
                    handler={handleCValuesChange}
                    options={valueOptions as string[]}
                    key={4}
                    label={'Select Column for Values'}
                />
            }

            {
                cType && cValues && cValues?.type === "number" && <FloatingSelect
                    value={aggregate}
                    handler={handleAggregateChange}
                    options={AGGREGATE_FUNCTIONS}
                    key={5}
                    label={'Select Aggregate Type'}
                />
            }

            {
                processedData && (
                    <Container>
                        <Row>
                            <h5>Preview Chart</h5>
                        </Row>
                        <Row>
                            <ChartContainer type={cType as AcceptedChartTypes} data={processedData.data} labels={processedData.labels} options={processedData.options} />
                        </Row>
                    </Container>
                )
            }

            <Button className="w-100 mb-3 mt-2" onClick={openModal}>Save</Button>

            {
                showModal && <ModalCreateChart show={showModal} close={closeModal} onConfirm={confirmDownload} setCanvas={updateCanvasResolution} changeFormat={handleImageFormatChange} />
            }

            {
                enableHiddenCanvas && cType && <HiddenCanvas
                    type={cType as AcceptedChartTypes}
                    data={processedData?.data ?? []}
                    labels={processedData?.labels ?? []}
                    options={processedData?.options ?? {}}
                    hide={hideHiddenCanvas}
                    canvasResolution={canvasResolution ?? null}
                    format={imageFormat as ExportSupportedFormat} />
            }
        </div>
    )
}

export default ChartProvider