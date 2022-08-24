import React from 'react';
import Container from 'react-bootstrap/Container'
import useWindowSize from '../../hooks/useWindowSize'
import CenteredErrorMessage from '../IndexComponent/CenteredErrorMessage'
import { Pie, Doughnut, Bar, Line } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title, PointElement, LineElement } from 'chart.js';
import { formatChartDataProp } from '../../helpers/helpers'
import { AcceptedChartTypes } from '../../enums/enums'
import { CHART_TYPES } from '../../constants/constants'

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title, PointElement, LineElement);

interface ChartContainerProps {
    type: AcceptedChartTypes
    data: any[]
    labels: any[]
    options?: any
}

const ChartContainer: React.FC<ChartContainerProps> = ({ type, data, labels, options }) => {
    if (!CHART_TYPES.includes(type)) {
        return <CenteredErrorMessage reason={'Invalid type received'} />
    }

    if (data.length === 0 || labels.length === 0) {
        return <CenteredErrorMessage reason={'Empty data received'} />
    }

    const requiredDataProp = formatChartDataProp(type, labels, data)

    const chartDataProp = {
        labels,
        datasets: requiredDataProp.datasets
    }

    const elementMap = {
        "Pie": <Pie data={chartDataProp} />,
        "Doughnut": <Doughnut data={chartDataProp} />,
        "Bar": <Bar data={chartDataProp} options={options} />,
        "Line": <Line data={chartDataProp} options={options} />
    }

    const { height: _height, width: _width } = useWindowSize()

    return (
        <Container fluid style={{
            margin: "0 auto",
            minWidth: `${_width >= 1000 ? "555px" : "auto"}`,
            width: `${_width >= 1000 ? "555px" : "auto"}`,
            height: `${_height >= 1000 ? "555px" : "auto"}`,
            minHeight: `${_height >= 1000 ? "555px" : "auto"}`,
        }}>
            {elementMap[type]}
        </Container>
    )
}


export default ChartContainer