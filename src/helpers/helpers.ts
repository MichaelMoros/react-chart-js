import moment from 'moment'
import { AcceptedChartTypes } from '../enums/enums'

// ==============================================================================================
// source https://stackoverflow.com/questions/6117814/get-week-of-year-in-javascript-like-in-php
// ==============================================================================================

function getWeekNumber(d: Date) {
    // Copy date so don't modify original
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    // Set to nearest Thursday: current date + 4 - current day number
    // Make Sunday's day number 7
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    // Get first day of year
    var yearStart: any = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    // Calculate full weeks to nearest Thursday
    var weekNo = Math.ceil((((d.valueOf() - yearStart.valueOf()) / 86400000) + 1) / 7);
    // Return array of year and week number
    return weekNo
}

// =====================================================================================================================================================
// source https://stackoverflow.com/questions/59218548/what-is-the-best-way-to-convert-from-csv-to-json-when-commas-and-quotations-may/59219146#59219146
// =====================================================================================================================================================

// Return array of string values, or NULL if CSV string not well formed.
function CSVtoArray(text: string) {
    var re_valid = /^\s*(?:'[^'\\]*(?:\\[\S\s][^'\\]*)*'|"[^"\\]*(?:\\[\S\s][^"\\]*)*"|[^,'"\s\\]*(?:\s+[^,'"\s\\]+)*)\s*(?:,\s*(?:'[^'\\]*(?:\\[\S\s][^'\\]*)*'|"[^"\\]*(?:\\[\S\s][^"\\]*)*"|[^,'"\s\\]*(?:\s+[^,'"\s\\]+)*)\s*)*$/;
    var re_value = /(?!\s*$)\s*(?:'([^'\\]*(?:\\[\S\s][^'\\]*)*)'|"([^"\\]*(?:\\[\S\s][^"\\]*)*)"|([^,'"\s\\]*(?:\s+[^,'"\s\\]+)*))\s*(?:,|$)/g;
    // Return NULL if input string is not well formed CSV string.
    if (!re_valid.test(text)) return null;
    var a = [];                     // Initialize array to receive values.
    text.replace(re_value, // "Walk" the string using replace with callback.
        function (m0: string, m1: string, m2: string, m3: string) {
            // Remove backslash from \' in single quoted values.
            if (m1 !== undefined) a.push(m1.replace(/\\'/g, "'"));
            // Remove backslash from \" in double quoted values.
            else if (m2 !== undefined) a.push(m2.replace(/\\"/g, '"'));
            else if (m3 !== undefined) a.push(m3);
            return ''; // Return empty string.
        });
    // Handle special case of empty last value.
    if (/,\s*$/.test(text)) a.push('');
    return a;
};


function csvToJson(text: string) {
    const rows = text.split('\n')

    const header = rows[0]
    const splittedHeaders = header.split(",").map((item) => item.replace(/['"]/gi, '').trim())
    const rowsWithoutHeaders = rows.slice(1)
    const data = rowsWithoutHeaders.map((item, index: number) => {
        const rowItem = CSVtoArray(item)?.map((item) => isNumeric(item) ? Number(item) : item)
        const formattedRowItem = rowItem?.reduce((acc: any, cur: any, index: number) => {
            acc[splittedHeaders[index]] = cur

            return acc
        }, {})

        return formattedRowItem
    })

    return data
}

const createOptions = ({ min = 0, max }: { min?: number, max: number }) => {
    return {
        scales: {
            y:
            {
                min,
                max
            },
        },
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'Data Chart',
            },
        },
    }
}

function isNumeric(str: any) {
    if (typeof str !== "string") return false
    return !isNaN(str as any) && !isNaN(parseFloat(str))
}


const isValidDateString = (d: string) => {
    const supportedDataFormats = [
        'DD/MM/YYYY',
        'DD/M/YY',
        'D/M/YY',
        'D/M/YYYY',
        'D/MM/YYYY',
        'DD-MM-YYYY',
        'DD-M-YY',
        'D-M-YY',
        'D-M-YYYY',
        'D-MM-YYYY',
        'DD.MM.YYYY',
        'DD.M.YY',
        'D.M.YY',
        'D.M.YYYY',
        'D.MM.YYYY',
        'DD MM YYYY',
        'DD M YY',
        'D M YY',
        'D M YYYY',
        'D MM YYYY',
        moment.ISO_8601
    ];

    return moment(d, supportedDataFormats, true).isValid()
}

const colors = ["#ea5545", "#f46a9b", "#ef9b20", "#edbf33", "#ede15b", "#bdcf32", "#87bc45", "#27aeef", "#b33dc6", "#e60049", "#0bb4ff", "#50e991", "#e6d800", "#9b19f5", "#ffa300", "#dc0ab4", "#b3d4ff", "#00bfa0", "#b30000", "#7c1158", "#4421af", "#1a53ff", "#0d88e6", "#00b7c7", "#5ad45a", "#8be04e", "#ebdc78", "#fd7f6f", "#7eb0d5", "#b2e061", "#bd7ebe", "#ffb55a", "#ffee65", "#beb9db", "#fdcce5", "#8bd3c7"]

function fyShuffle(arr: any[]) {
    let i = arr.length;
    while (--i > 0) {
        let randIndex = Math.floor(Math.random() * (i + 1));
        [arr[randIndex], arr[i]] = [arr[i], arr[randIndex]];
    }

    return arr;
}

const generateColors = (n: number) => {
    let repeat = 0
    let colorset: string[] = []

    if (colors.length < n) {
        repeat = Math.ceil(n / colors.length)

        if (repeat) {
            while (repeat > 0) {
                colorset = [...colors]
                repeat--;
            }
        }
    } else return colors

    return colorset
}

const formatChartDataProp = (type: AcceptedChartTypes, labels: any[], data: any[], labelA?: string, labelB?: string) => {
    const colors = generateColors(data?.length || 1)

    if (type === AcceptedChartTypes.Pie || type === AcceptedChartTypes.Doughnut) {
        return {
            labels,
            datasets: data.map((item: any[], index) => {
                const values = item.map((_item,) => _item)

                return {
                    data: values,
                    backgroundColor: colors,
                    borderColor: colors,
                    borderWidth: 1
                }
            })
        }
    }

    else {
        return {
            labels,
            datasets: data.map((item, index) => {
                const values = item.map((_item: any) => _item)
                const datasetLabel = index === 0 ? labelA ? labelA : 'Dataset A' : labelB ? labelB : 'Dataset B'

                return {
                    label: datasetLabel,
                    data: values,
                    backgroundColor: colors[index],
                    borderColor: colors[index],
                    borderWidth: 1
                }
            })
        }
    }
}


const monthReferrence = {
    "1": "Jan",
    "2": "Feb",
    "3": "Mar",
    "4": "Apr",
    "5": "May",
    "6": "Jun",
    "7": "Jul",
    "8": "Aug",
    "9": "Sep",
    "10": "Oct",
    "11": "Nov",
    "12": "Dec"
}

const handleDayModifier = (d: string) => {
    const date = new Date(d)
    if (isNaN(date.getTime())) return '###'
    const monthNumber = String(date.getUTCMonth())

    let shortMonth;

    for (let [k, v] of Object.entries(monthReferrence)) {
        if (k === monthNumber) shortMonth = v
    }

    if (!shortMonth) return '###'

    return shortMonth + '-' + date.getUTCDate() + '-' + date.getUTCFullYear()
}


const monthNumberToShortMonth = (month: number | string) => {
    for (let [k, v] of Object.entries(monthReferrence)) {
        if (k === String(month)) return v
    }

    return `###`
}

export {
    formatChartDataProp,
    generateColors,
    getWeekNumber,
    createOptions,
    isValidDateString,
    handleDayModifier,
    monthNumberToShortMonth,
    csvToJson,
    isNumeric
} 