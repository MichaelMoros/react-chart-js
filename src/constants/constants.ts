import { AcceptedChartTypes, ActionTypes, DateSourceOptions, ComparingChartTypes, AggregateFunctions, ImportSupportedFormat, ExportSupportedFormat } from "../enums/enums"

const ACTION_TYPES = Object.values(ActionTypes)
const VALID_ACTION_TYPES = Object.values(ActionTypes).slice(1)
const DATASOURCE_OPTIONS = Object.values(DateSourceOptions)
const CHART_TYPES = Object.values(AcceptedChartTypes)
const COMPARING_CHART_TYPES = Object.values(ComparingChartTypes)
const AGGREGATE_FUNCTIONS = Object.values(AggregateFunctions)
const IMPORT_SUPPORTED_FORMATS = Object.values(ImportSupportedFormat)
const EXPORT_SUPPORTED_FORMATS = Object.values(ExportSupportedFormat)
const DATE_MODIFIERS = ['Day', 'Week', 'Month', 'Year']

export {
    ACTION_TYPES,
    VALID_ACTION_TYPES,
    DATASOURCE_OPTIONS,
    CHART_TYPES,
    COMPARING_CHART_TYPES,
    DATE_MODIFIERS,
    AGGREGATE_FUNCTIONS,
    IMPORT_SUPPORTED_FORMATS,
    EXPORT_SUPPORTED_FORMATS
}