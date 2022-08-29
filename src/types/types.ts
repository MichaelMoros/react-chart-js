import { ExportSupportedFormat } from '../enums/enums'

enum Gender {
    Male = 'male',
    Female = 'female'
}

interface TestData {
    employee: string
    transactionId: number,
    sale: number,
    date: string
    gender: Gender
}

type Nullable<T> = T | null | undefined
type NullableArray<T> = T[] | null

type ProcessedData = {
    labels: string[]
    data: any[][]
    options?: any
}

type HiddenCanvasOptions = {
    resolution: { height: number, width: number }
    options?: { labelA: string, labelB: string } | null
    format: ExportSupportedFormat
}

export type {
    TestData,
    Nullable,
    NullableArray,
    ProcessedData,
    HiddenCanvasOptions
}