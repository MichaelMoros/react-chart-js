import React, { useEffect, useRef } from 'react';
import CenteredErrorMessage from '../IndexComponent/CenteredErrorMessage'
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title, PointElement, LineElement } from 'chart.js';
import { Pie, Doughnut, Bar, Line } from 'react-chartjs-2';
import { formatChartDataProp } from '../../helpers/helpers'
import { CHART_TYPES } from '../../constants/constants'
import { HiddenCanvasOptions } from '../../types/types'
import { AcceptedChartTypes } from '../../enums/enums'


ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title, PointElement, LineElement);

type HiddenCanvasProps = {
    type: AcceptedChartTypes
    data: any[]
    labels: any[]
    options: any
    canvasOptions: HiddenCanvasOptions
    hide: () => void
}

const HiddenCanvas: React.FC<HiddenCanvasProps> = ({ type, data = [], labels = [], options = {}, canvasOptions, hide }) => {
    const thisChart: any = useRef()
    const initialDownload = useRef(false)

    if (!canvasOptions.format) {
        return <CenteredErrorMessage reason={'Format not specified'} />
    }

    if (!canvasOptions?.resolution?.height || !canvasOptions?.resolution?.width) {
        return <CenteredErrorMessage reason={'Canvas resolution not specified'} />
    }

    if (!CHART_TYPES.includes(type)) {
        return <CenteredErrorMessage reason={'Invalid type received'} />
    }

    if (data.length === 0 || labels.length === 0) {
        return <CenteredErrorMessage reason={'Empty data received'} />
    }

    useEffect(() => {
        if (thisChart.current) {
            if (initialDownload.current) return

            setTimeout(() => {
                // if no interval for some reason you either get a corrupted file or incomplete image
                const imageFormat = `image/${canvasOptions.format}`
                const link = document.createElement('a');
                link.href = thisChart?.current?.toBase64Image(imageFormat, 1)
                link.download = `chart.${canvasOptions.format}`
                link.click()
                hide()
            }, 1000)

            initialDownload.current = true
        }
    }, [])

    const requiredDataProp = canvasOptions?.options ? formatChartDataProp(type, labels, data, canvasOptions.options.labelA, canvasOptions.options.labelB) : formatChartDataProp(type, labels, data)

    const chartDataProp = {
        labels,
        datasets: requiredDataProp.datasets
    }

    const elementMap = {
        "Pie": <Pie data={chartDataProp} style={{ display: "none" }} ref={thisChart} />,
        "Doughnut": <Doughnut data={chartDataProp} style={{ display: "none" }} ref={thisChart} />,
        "Bar": <Bar data={chartDataProp} options={options} style={{ display: "none" }} ref={thisChart} />,
        "Line": <Line data={chartDataProp} options={options} style={{ display: "none" }} ref={thisChart} />
    }

    const { height: _height, width: _width } = canvasOptions.resolution

    return (
        <div style={{ minHeight: _height, height: _height, minWidth: _width, width: _width }}>
            {elementMap[type]}
        </div>
    )
}


export default HiddenCanvas