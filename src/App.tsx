import React, { useState, useEffect } from 'react';
import Container from 'react-bootstrap/Container'
import Button from 'react-bootstrap/Button'
import FloatingSelect from './components/IndexComponent/FloatingSelect'
import StepOne from './components/IndexComponent/StepOne';
import Main from './components/IndexComponent/Main'
import CenteredContainer from './components/IndexComponent/CenteredContainer';

import { SampleDataA, SampleDataB } from './assets/sample-data'
import { ActionTypes, DateSourceOptions, ImportSupportedFormat } from './enums/enums'
import { Nullable, NullableArray } from './types/types';
import { isValidDateString, csvToJson, isNumeric } from './helpers/helpers'
import { ACTION_TYPES, VALID_ACTION_TYPES, DATASOURCE_OPTIONS, IMPORT_SUPPORTED_FORMATS } from './constants/constants'

const extractKeysAndTypes = (array: any[], strictMode?: boolean) => {
    if (!Array.isArray(array)) return null

    const results = array.reduce((acc, cv, index) => {
        if (index === 0) {
            for (let [k, v] of Object.entries(cv)) {
                if (!acc[k]) {
                    if (typeof v === "object") throw new Error('Not supported, please normalize dataset')

                    const isDate = isValidDateString(v as string)
                    const isNumber = isNumeric(String(v))

                    if (isNumber) acc[k] = "number"
                    else if (isDate) acc[k] = 'date'
                    else acc[k] = !v ? 'string' : typeof v
                }
            }

            return acc
        }

        if (index !== 0) {
            for (let [k, v] of Object.entries(cv)) {
                const currentType = isNumeric(String(v)) ? 'number' : isValidDateString(v as string) ? 'date' : 'string'
                if (currentType !== acc[k]) acc[k] = null
            }
        }

        return acc
    }, {})

    let final: any = {}

    if (!strictMode) {
        for (let [k, v] of Object.entries(results || {})) {
            if (v) {
                final[k] = v
            }
        }
    }

    return final
}


const App = () => {
    const [action, setAction] = useState(ACTION_TYPES[0])
    const [dataSourceType, setDataSourceType] = useState(DATASOURCE_OPTIONS[0])
    const [firstStepError, setFirstStepError] = useState<Nullable<string>>(null)
    const [showIndex, setShowIndex] = useState(true)
    const [showCharts, setShowCharts] = useState(false)
    const [dataSourceFilename, setDataSourceFilename] = useState<NullableArray<string>>(null)
    const [dataSources, setDatasources] = useState<NullableArray<any>>(null)
    const [isSampleData, setIsSampleData] = useState(false)
    const [dataKeysAndTypes, setDataKeysAndTypes] = useState<any>(null)

    const resetStates = () => {
        setFirstStepError(null)
        setDataSourceFilename(null)
        setDatasources(null)
        setIsSampleData(false)
        setDataKeysAndTypes(null)
    }

    const handleActionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.currentTarget.value as ActionTypes
        if (!VALID_ACTION_TYPES.includes(value)) return
        setAction(value)
    }

    const handleDataSourceTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.currentTarget.value as DateSourceOptions
        if (!DATASOURCE_OPTIONS.includes(value)) return
        setDataSourceType(value)
    }

    const useSampleData = () => {
        const result = extractKeysAndTypes(SampleDataA)

        const selectedDataSource = action !== ActionTypes.CompareAndCreate ? [SampleDataA] : [SampleDataA, SampleDataB]
        const sampleDataFileNames = action !== ActionTypes.CompareAndCreate ? ['sample-dataA'] : ['sample-dataA', 'sample-dataB']

        setDatasources(selectedDataSource)
        setDataSourceFilename(sampleDataFileNames)
        setIsSampleData(true)
        setDataKeysAndTypes(result)
    }

    const toggleView = () => setShowCharts(!showCharts)

    const clickHandler = () => {
        if (dataSourceType === DateSourceOptions.Sample) {
            useSampleData()
            toggleView()
            return
        }

        if (dataSources && dataSourceFilename && !isSampleData && dataKeysAndTypes) {
            toggleView()
        }
    }

    const parseJsonFile = async (file: any, type: ImportSupportedFormat) => {
        if (!IMPORT_SUPPORTED_FORMATS.includes(type)) return null

        return new Promise((resolve, reject) => {
            const fileReader = new FileReader()
            fileReader.onerror = error => reject(error)
            fileReader.onload = (event: any) => {
                try {
                    if (type === ImportSupportedFormat.Csv) resolve(csvToJson(event.target.result))
                    if (type === ImportSupportedFormat.Json) resolve(JSON.parse(event.target.result))
                } catch (e) {
                    reject(e)
                }
            }
            fileReader.readAsText(file)
        }).catch((error) => null)
    }

    const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
        setFirstStepError(null)
        const target = e.target as HTMLInputElement
        const files = target.files

        if (!files) {
            setFirstStepError('file not found')
            return
        }

        if ([...files].length > 2) {
            const ignoredFiles = [...files].filter((item, index) => index > 1).map((item) => item.name)

            if (ignoredFiles.length === 1) {
                setFirstStepError(`Ignored [${ignoredFiles[0]}]`)
            }

            else if (ignoredFiles.length === 2) {
                setFirstStepError(`Ignored [${ignoredFiles[0]} and ${ignoredFiles[0]}]`)
            }

            else {
                const formattedIgnoredFiles = ignoredFiles.reduce((acc, cv, index) => {
                    if (index > -1 && index < ignoredFiles.length - 2) acc += cv + ", "
                    if (index === ignoredFiles.length - 2) acc += cv + " and "
                    if (index === ignoredFiles.length - 1) acc += cv

                    return acc
                }, '')

                setFirstStepError(`Ignored [${formattedIgnoredFiles}]`)
            }
        }

        let correctFiles;

        if (action === ActionTypes.CompareAndCreate) {
            correctFiles = [...files].slice(0, 2)
        } else {
            correctFiles = [...files].slice(0, 1)
        }

        const parsedFiles = await Promise.all(correctFiles.map(async (item) => {
            const type = item.name.split('.')
            const extension = type[type.length - 1].toLowerCase() as ImportSupportedFormat

            return await parseJsonFile(item, extension)
        }))

        if (parsedFiles.some((item) => !item)) {
            resetStates()
            setFirstStepError(`Error occured while parsing file/s, incorrect format or malformed`)
            return
        }

        const results = parsedFiles.map((item: any) => extractKeysAndTypes(item))

        if (results.some((item) => !item)) {
            setFirstStepError(`Error occured while creating types, incorrect format or malformed`)
            return
        }

        const biggerObject = results.reduce((acc, cv, index) => {
            const currentLength = Object.keys(cv)?.length || 0
            if (currentLength > acc.length) {
                acc = { length: currentLength, index }
            }
            return acc
        }, { length: 0, index: null })

        type ValidKeys = {
            [j: string]: string
        }

        let validKeys: ValidKeys = {}

        let looper
        let lookup

        if (action === ActionTypes.CompareAndCreate) {
            looper = biggerObject.index === 1 ? results[1] : results[0]
            lookup = biggerObject.index === 1 ? results[0] : results[1]
        } else {
            looper = results[0]
            lookup = results[0]
        }

        for (let [k, v] of Object.entries(looper)) {
            const targetValue = lookup[k] ?? null
            if (targetValue === v) validKeys[k] = String(v)
        }

        if (Object.keys(validKeys)?.length === 0) {
            setFirstStepError(`Error occured while creating types, inconsistent data no matching types`)
            return
        }

        // eliminate all rows that doesn't meet the validKeys format
        const parsedAndFilteredFiles = parsedFiles.map((item: any) => {
            const j = item.filter((_item: any, index: number) => {
                const keys = Object.entries(_item || {}).sort((a, b) => a[0] > b[0] ? 1 : a[0] < b[0] ? -1 : 0)
                const _keys = Object.entries(validKeys).sort((a, b) => a[0] > b[0] ? 1 : a[0] < b[0] ? -1 : 0)

                const formattedKeys = keys.map((item) => {
                    item[1] = isNumeric(String(item[1])) ? 'number' : isValidDateString(item[1] as string) ? 'date' : 'string'
                    return [item[0], item[1]]
                })

                if (JSON.stringify(_keys) === JSON.stringify(formattedKeys)) return _item
            })

            return j
        })

        // check if ValidKeys has atleast one(1) type of (string || date) and number
        // since aggregate functions needs atleast one type of number and string or date as filter/s
        if (!Object.values(validKeys).some((item) => item === 'string' || item === 'date') || !Object.values(validKeys).some((item) => item === 'number')) {
            setFirstStepError(`Data doesn't contain the minimum requirement to create chart`)
            return
        }

        const requiredDataSources = action === ActionTypes.CompareAndCreate ? [parsedAndFilteredFiles[0], parsedAndFilteredFiles[1]] : [parsedAndFilteredFiles[0]]
        const requiredDataSourceFileNames = action === ActionTypes.CompareAndCreate ? [correctFiles[0].name, correctFiles[1].name] : [correctFiles[0].name]

        setDatasources(requiredDataSources)
        setDataSourceFilename(requiredDataSourceFileNames)
        setIsSampleData(false)
        setDataKeysAndTypes(validKeys)
    }

    useEffect(() => {
        if (!showCharts) resetStates()
    }, [showCharts])


    if (showIndex && !showCharts) {
        return (
            <CenteredContainer>
                <h3 className="mt-0 pt-0 mb-2">Chart App using ChartJS</h3>
                <small className="my-0 py-0">Import data/s to create charts</small>
                <small className="my-0 py-0">
                    Created using
                    {" "}
                    <a href="https://www.chartjs.org/">ChartJS</a>
                    {" "}
                    and
                    {" "}
                    <a href="https://reactjs.org/">React</a>
                </small>
                <Button variant={"primary"} size="sm" onClick={() => setShowIndex(false)} className="mt-3">Get Started</Button>
            </CenteredContainer>
        )
    }

    else if (!showIndex && !showCharts) {
        return (
            <Container className="mb-3" style={{ position: "relative", height: "92vh" }}>
                <h4 className="mt-3 mb-0">Create Chart</h4>
                <h6 className="mt-3 mb-0">First Step</h6>

                <FloatingSelect
                    value={action}
                    handler={handleActionChange}
                    options={action === "No action" ? ACTION_TYPES : VALID_ACTION_TYPES}
                    key={action}
                    label={'Select action'}
                />

                {
                    action !== ActionTypes.NoAction && (
                        <>
                            <h6>We need data to work with</h6>
                            <FloatingSelect
                                value={dataSourceType}
                                handler={handleDataSourceTypeChange}
                                options={DATASOURCE_OPTIONS}
                                key={dataSourceType}
                                label={'Select data source'}
                            />
                        </>)
                }

                {
                    action !== ActionTypes.NoAction && dataSourceType === DateSourceOptions.Import && <StepOne action={action} fileHandler={handleFile} error={firstStepError} />
                }

                {
                    action !== ActionTypes.NoAction && <Button className="mt-5" style={{ position: "absolute", bottom: 0, alignItems: "center", width: "95%" }} onClick={clickHandler} >Get Started</Button>
                }
            </Container>
        )
    }

    else if (!showIndex && showCharts) {
        return <Main
            action={action}
            toggleView={toggleView}
            filenames={dataSourceFilename ?? []}
            datasource={dataSources ?? []}
            isSampleData={isSampleData}
            dataKeysAndTypes={dataKeysAndTypes ?? {}} />
    }


    else return <div>Something went wrong, you shouldn't see this page ever</div>
}

export default App
