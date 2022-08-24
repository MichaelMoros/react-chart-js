import React from 'react'
import Container from 'react-bootstrap/Container'
import CenteredErrorMessage from './CenteredErrorMessage'
import ChartProvider from '../ChartComponent/ChartProvider'
import { ArrowLeft } from 'react-bootstrap-icons'
import { VALID_ACTION_TYPES } from '../../constants/constants'
import { ActionTypes } from '../../enums/enums'

interface MainProps {
    action: ActionTypes
    dataKeysAndTypes: {}
    isSampleData: boolean
    datasource: any[]
    filenames: string[]
    toggleView: () => void
}

const Main: React.FC<MainProps> = ({ toggleView, filenames = [], datasource = [], isSampleData, dataKeysAndTypes = {}, action }) => {
    if (filenames?.length === 0 || datasource?.length === 0) {
        return <CenteredErrorMessage reason={'Missing filenames or datasource'} />
    }

    if (!VALID_ACTION_TYPES.includes(action)) {
        return <CenteredErrorMessage reason={'Invalid action supplied'} />
    }

    const dataKeysAndTypesLength = Object.keys(dataKeysAndTypes)?.length

    if (dataKeysAndTypesLength < 1) {
        return <CenteredErrorMessage reason={'Valid data but inconsistent, cant make chart'} />
    }

    const filenameText = filenames?.length > 1 ? `${filenames[0]} and ${filenames[1]}` : filenames[0]
    const actionText = action === ActionTypes.Create ? 'Creating chart' : 'Comparing data'

    return (
        <Container className="mt-4">
            <div>
                <span style={{ fontSize: "26px" }}><ArrowLeft onClick={toggleView} style={{ cursor: "pointer", marginBottom: "5px" }} /> Change Datasource</span>
            </div>

            <div className="mt-4">
                <p style={{ fontSize: "18px" }}>
                    <strong>{actionText}</strong> using <strong>{isSampleData ? 'Sample Data' : filenameText}</strong>
                </p>
            </div>

            <ChartProvider referrence={dataKeysAndTypes} datasource={datasource} action={action} />
        </Container>
    )
}

export default Main