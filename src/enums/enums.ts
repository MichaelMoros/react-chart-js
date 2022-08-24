enum AcceptedChartTypes {
    Pie = 'Pie',
    Doughnut = 'Doughnut',
    Bar = 'Bar',
    Line = 'Line'
}

enum ComparingChartTypes {
    Bar = 'Bar',
    Line = 'Line'
}

enum DateModifiers {
    Day = 'Day',
    Week = 'Week',
    Month = 'Month',
    Year = 'Year'
}

enum ActionTypes {
    NoAction = 'No action',
    Create = 'Create chart',
    CompareAndCreate = 'Compare and create chart'
}

enum DateSourceOptions {
    Sample = 'use sample data',
    Import = 'import data'
}

enum AggregateFunctions {
    Count = 'Count',
    Sum = 'Sum'
}

enum ExportSupportedFormat {
    Jpeg = 'jpeg',
    Png = 'png'
}

enum ImportSupportedFormat {
    Json = 'json',
    Csv = 'csv'
}

export {
    AcceptedChartTypes,
    ComparingChartTypes,
    DateModifiers,
    ActionTypes,
    DateSourceOptions,
    AggregateFunctions,
    ExportSupportedFormat,
    ImportSupportedFormat
}